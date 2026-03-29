const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();

function calculateGrade(marksObtained, maxMarks) {
  const percentage = (Number(marksObtained) / Number(maxMarks)) * 100;

  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "F";
}

function facultyOwnsCourse(userId, courseId) {
  const faculty = getFacultyProfileByUserId(userId);
  if (!faculty) {
    return false;
  }

  const course = db.prepare("SELECT id FROM courses WHERE id = ? AND faculty_id = ?").get(courseId, faculty.id);
  return Boolean(course);
}

router.use(authMiddleware);

router.post("/exams", roleMiddleware("admin"), (req, res) => {
  const { courseId, examName, examDate, examTime } = req.body;

  if (!courseId || !examName || !examDate || !examTime) {
    return res.status(400).json({ message: "Subject, exam name, date, and time are required." });
  }

  const course = db.prepare("SELECT id FROM courses WHERE id = ?").get(Number(courseId));
  if (!course) {
    return res.status(404).json({ message: "Selected subject was not found." });
  }

  const result = db
    .prepare(
      `
        INSERT INTO exams (course_id, exam_name, exam_date, exam_time, created_by)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(Number(courseId), String(examName).trim(), String(examDate), String(examTime), req.user.id);

  return res.status(201).json({ message: "Exam scheduled successfully.", examId: result.lastInsertRowid });
});

router.get("/exams", roleMiddleware("admin", "faculty", "student"), (req, res) => {
  let exams = [];

  if (req.user.role === "admin") {
    exams = db
      .prepare(
        `
          SELECT
            exams.id,
            exams.exam_name,
            exams.exam_date,
            exams.exam_time,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM exams
          JOIN courses ON courses.id = exams.course_id
          LEFT JOIN departments ON departments.id = courses.department_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          ORDER BY exams.exam_date ASC, exams.exam_time ASC
        `
      )
      .all();
  } else if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    exams = db
      .prepare(
        `
          SELECT
            exams.id,
            exams.exam_name,
            exams.exam_date,
            exams.exam_time,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM exams
          JOIN courses ON courses.id = exams.course_id
          LEFT JOIN departments ON departments.id = courses.department_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          WHERE courses.faculty_id = ?
          ORDER BY exams.exam_date ASC, exams.exam_time ASC
        `
      )
      .all(faculty.id);
  } else {
    const student = getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    exams = db
      .prepare(
        `
          SELECT
            exams.id,
            exams.exam_name,
            exams.exam_date,
            exams.exam_time,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM exams
          JOIN courses ON courses.id = exams.course_id
          LEFT JOIN departments ON departments.id = courses.department_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          WHERE courses.department_id = ?
            AND COALESCE(courses.branch_id, ?) = ?
            AND courses.semester = ?
          ORDER BY exams.exam_date ASC, exams.exam_time ASC
        `
      )
      .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);
  }

  return res.json({ exams });
});

router.post("/", roleMiddleware("faculty", "admin"), (req, res) => {
  const { studentId, courseId, examType, marksObtained, maxMarks, remarks = "" } = req.body;

  if (!studentId || !courseId || !examType || marksObtained === undefined || !maxMarks) {
    return res.status(400).json({ message: "Student, course, exam type, and marks are required." });
  }

  const marks = Number(marksObtained);
  const maximum = Number(maxMarks);
  if (Number.isNaN(marks) || Number.isNaN(maximum) || marks < 0 || maximum <= 0 || marks > maximum) {
    return res.status(400).json({ message: "Marks should be valid numbers within the allowed range." });
  }

  if (req.user.role === "faculty" && !facultyOwnsCourse(req.user.id, Number(courseId))) {
    return res.status(403).json({ message: "You can only publish results for your assigned courses." });
  }

  const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(courseId);
  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  const student = db
    .prepare(
      `
        SELECT id
        FROM students
        WHERE id = ? AND department_id = ? AND COALESCE(branch_id, ?) = ? AND semester = ?
      `
    )
    .get(studentId, course.department_id, course.branch_id || null, course.branch_id || null, course.semester);

  if (!student) {
    return res.status(400).json({ message: "Selected student does not belong to the chosen course." });
  }

  const facultyId =
    req.user.role === "admin"
      ? course.faculty_id ||
        (db.prepare("SELECT id FROM faculty ORDER BY id LIMIT 1").get() || {}).id
      : getFacultyProfileByUserId(req.user.id).id;

  const grade = calculateGrade(marks, maximum);

  const result = db
    .prepare(
      `
        INSERT INTO results (
          student_id,
          course_id,
          faculty_id,
          exam_type,
          marks_obtained,
          max_marks,
          grade,
          remarks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(studentId, courseId, facultyId, String(examType).trim(), marks, maximum, grade, String(remarks).trim());

  return res.status(201).json({ message: "Result published successfully.", resultId: result.lastInsertRowid });
});

router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const results = db
    .prepare(
      `
        SELECT
          results.id,
          results.exam_type,
          results.marks_obtained,
          results.max_marks,
          results.grade,
          results.remarks,
          results.published_at,
          courses.name AS course_name,
          courses.code AS course_code
        FROM results
        JOIN courses ON courses.id = results.course_id
        WHERE results.student_id = ?
        ORDER BY results.published_at DESC
      `
    )
    .all(student.id);

  return res.json({ results });
});

router.get("/", roleMiddleware("faculty", "admin"), (req, res) => {
  let results = [];

  if (req.user.role === "admin") {
    results = db
      .prepare(
        `
          SELECT
            results.id,
            results.exam_type,
            results.marks_obtained,
            results.max_marks,
            results.grade,
            results.published_at,
            courses.name AS course_name,
            courses.code AS course_code,
            users.full_name AS student_name,
            students.roll_number
          FROM results
          JOIN courses ON courses.id = results.course_id
          JOIN students ON students.id = results.student_id
          JOIN users ON users.id = students.user_id
          ORDER BY results.published_at DESC
        `
      )
      .all();
  } else {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    results = db
      .prepare(
        `
          SELECT
            results.id,
            results.exam_type,
            results.marks_obtained,
            results.max_marks,
            results.grade,
            results.published_at,
            courses.name AS course_name,
            courses.code AS course_code,
            users.full_name AS student_name,
            students.roll_number
          FROM results
          JOIN courses ON courses.id = results.course_id
          JOIN students ON students.id = results.student_id
          JOIN users ON users.id = students.user_id
          WHERE results.faculty_id = ?
          ORDER BY results.published_at DESC
        `
      )
      .all(faculty.id);
  }

  return res.json({ results });
});

module.exports = router;
