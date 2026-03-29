const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
const validStatuses = new Set(["present", "absent", "late"]);

function facultyOwnsCourse(userId, courseId) {
  const faculty = getFacultyProfileByUserId(userId);
  if (!faculty) {
    return false;
  }

  const course = db.prepare("SELECT id FROM courses WHERE id = ? AND faculty_id = ?").get(courseId, faculty.id);
  return Boolean(course);
}

router.use(authMiddleware);

router.post("/", roleMiddleware("faculty", "admin"), (req, res) => {
  const { courseId, date, records, studentId, status } = req.body;
  const attendanceDate = date ? String(date).slice(0, 10) : null;

  if (!courseId || !attendanceDate) {
    return res.status(400).json({ message: "Subject and date are required." });
  }

  const payloadRecords = Array.isArray(records) && records.length > 0 ? records : [{ studentId, status }];
  if (!payloadRecords.every((record) => record.studentId && validStatuses.has(String(record.status).toLowerCase()))) {
    return res.status(400).json({ message: "Each attendance record requires a valid student and status." });
  }

  if (req.user.role === "faculty" && !facultyOwnsCourse(req.user.id, Number(courseId))) {
    return res.status(403).json({ message: "You can only mark attendance for your assigned courses." });
  }

  const course = db
    .prepare(
      `
        SELECT id, department_id, semester, faculty_id
          , branch_id
        FROM courses
        WHERE id = ?
      `
    )
    .get(courseId);

  if (!course) {
    return res.status(404).json({ message: "Course not found." });
  }

  const facultyId =
    req.user.role === "admin"
      ? course.faculty_id ||
        (db.prepare("SELECT id FROM faculty ORDER BY id LIMIT 1").get() || {}).id
      : getFacultyProfileByUserId(req.user.id).id;

  const upsertAttendance = db.transaction((items) => {
    const statement = db.prepare(
      `
        INSERT INTO attendance (student_id, course_id, faculty_id, date, status)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(student_id, course_id, date)
        DO UPDATE SET status = excluded.status, faculty_id = excluded.faculty_id
      `
    );

    items.forEach((record) => {
      const student = db
        .prepare(
          `
            SELECT id
            FROM students
            WHERE id = ?
              AND department_id = ?
              AND COALESCE(branch_id, ?) = ?
              AND semester = ?
          `
        )
        .get(record.studentId, course.department_id, course.branch_id || null, course.branch_id || null, course.semester);

      if (!student) {
        throw Object.assign(new Error("One or more students do not belong to the selected course."), {
          status: 400
        });
      }

      statement.run(
        record.studentId,
        course.id,
        facultyId,
        attendanceDate,
        String(record.status).toLowerCase()
      );
    });
  });

  try {
    upsertAttendance(payloadRecords);
    return res.json({ message: "Attendance saved successfully." });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const byCourse = db
    .prepare(
      `
        SELECT
          courses.id AS course_id,
          courses.name AS course_name,
          courses.code AS course_code,
          COUNT(attendance.id) AS total_classes,
          SUM(CASE WHEN attendance.status IN ('present', 'late') THEN 1 ELSE 0 END) AS attended_classes,
          ROUND(
            (
              CAST(SUM(CASE WHEN attendance.status IN ('present', 'late') THEN 1 ELSE 0 END) AS REAL) /
              NULLIF(COUNT(attendance.id), 0)
            ) * 100,
            2
          ) AS percentage
        FROM attendance
        JOIN courses ON courses.id = attendance.course_id
        WHERE attendance.student_id = ?
        GROUP BY courses.id, courses.name, courses.code
        ORDER BY courses.code ASC
      `
    )
    .all(student.id);

  const overall = byCourse.length
    ? Number(
        (
          byCourse.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / byCourse.length
        ).toFixed(2)
      )
    : 0;

  const recent = db
    .prepare(
      `
        SELECT
          courses.id AS course_id,
          attendance.date,
          attendance.status,
          courses.name AS course_name,
          courses.code AS course_code
        FROM attendance
        JOIN courses ON courses.id = attendance.course_id
        WHERE attendance.student_id = ?
        ORDER BY attendance.date DESC
        LIMIT 8
      `
    )
    .all(student.id);

  return res.json({
    summary: {
      overallPercentage: overall,
      byCourse,
      recent
    }
  });
});

router.get("/course/:courseId", roleMiddleware("faculty", "admin"), (req, res) => {
  const courseId = Number(req.params.courseId);

  if (req.user.role === "faculty" && !facultyOwnsCourse(req.user.id, courseId)) {
    return res.status(403).json({ message: "You can only view attendance for your assigned courses." });
  }

  const records = db
    .prepare(
      `
        SELECT
          attendance.id,
          attendance.date,
          attendance.status,
          students.id AS student_id,
          students.roll_number,
          users.full_name,
          courses.name AS course_name,
          courses.code AS course_code
        FROM attendance
        JOIN students ON students.id = attendance.student_id
        JOIN users ON users.id = students.user_id
        JOIN courses ON courses.id = attendance.course_id
        WHERE attendance.course_id = ?
        ORDER BY attendance.date DESC, users.full_name ASC
      `
    )
    .all(courseId);

  return res.json({ records });
});

module.exports = router;
