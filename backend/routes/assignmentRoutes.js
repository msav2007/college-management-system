const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
const uploadsDir = path.join(__dirname, "..", "uploads");

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-assignment-${safeName}`);
  }
});

const upload = multer({ storage });

function removeUploadedFile(file) {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
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

router.post("/", roleMiddleware("faculty", "admin"), upload.single("attachment"), (req, res) => {
  const { courseId, title, description, deadline } = req.body;

  if (!courseId || !title || !description || !deadline) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Course, title, description, and deadline are required." });
  }

  const deadlineDate = new Date(deadline);
  if (Number.isNaN(deadlineDate.getTime())) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Deadline must be a valid date." });
  }

  if (req.user.role === "faculty" && !facultyOwnsCourse(req.user.id, Number(courseId))) {
    removeUploadedFile(req.file);
    return res.status(403).json({ message: "You can only create assignments for your assigned courses." });
  }

  const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(courseId);
  if (!course) {
    removeUploadedFile(req.file);
    return res.status(404).json({ message: "Course not found." });
  }

  const facultyId =
    req.user.role === "admin"
      ? course.faculty_id ||
        (db.prepare("SELECT id FROM faculty ORDER BY id LIMIT 1").get() || {}).id
      : getFacultyProfileByUserId(req.user.id).id;

  const result = db
    .prepare(
      `
        INSERT INTO assignments (
          course_id,
          faculty_id,
          title,
          description,
          deadline,
          attachment_path,
          attachment_name
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      courseId,
      facultyId,
      String(title).trim(),
      String(description).trim(),
      deadlineDate.toISOString(),
      req.file ? `/uploads/${req.file.filename}` : null,
      req.file ? req.file.originalname : null
    );

  return res.status(201).json({ message: "Assignment created successfully.", assignmentId: result.lastInsertRowid });
});

router.get("/", roleMiddleware("admin", "faculty", "student"), (req, res) => {
  let assignments = [];

  if (req.user.role === "admin") {
    assignments = db
      .prepare(
        `
          SELECT
            assignments.id,
            assignments.course_id,
            assignments.title,
            assignments.description,
            assignments.deadline,
            assignments.attachment_path,
            assignments.attachment_name,
            assignments.created_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            users.full_name AS faculty_name,
            COUNT(submissions.id) AS submissions_count
          FROM assignments
          JOIN courses ON courses.id = assignments.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = assignments.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          LEFT JOIN submissions ON submissions.assignment_id = assignments.id
          GROUP BY assignments.id
          ORDER BY assignments.deadline ASC
        `
      )
      .all();
  } else if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    assignments = db
      .prepare(
        `
          SELECT
            assignments.id,
            assignments.course_id,
            assignments.title,
            assignments.description,
            assignments.deadline,
            assignments.attachment_path,
            assignments.attachment_name,
            assignments.created_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            COUNT(submissions.id) AS submissions_count
          FROM assignments
          JOIN courses ON courses.id = assignments.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN submissions ON submissions.assignment_id = assignments.id
          WHERE assignments.faculty_id = ?
          GROUP BY assignments.id
          ORDER BY assignments.deadline ASC
        `
      )
      .all(faculty.id);
  } else {
    const student = getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    assignments = db
      .prepare(
        `
          SELECT
            assignments.id,
            assignments.course_id,
            assignments.title,
            assignments.description,
            assignments.deadline,
            assignments.attachment_path,
            assignments.attachment_name,
            assignments.created_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            users.full_name AS faculty_name
          FROM assignments
          JOIN courses ON courses.id = assignments.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = assignments.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          WHERE courses.department_id = ?
            AND COALESCE(courses.branch_id, ?) = ?
            AND courses.semester = ?
          ORDER BY assignments.deadline ASC
        `
      )
      .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);
  }

  return res.json({
    assignments: assignments.map((assignment) => ({
      ...assignment,
      attachmentUrl: assignment.attachment_path
    }))
  });
});

module.exports = router;
