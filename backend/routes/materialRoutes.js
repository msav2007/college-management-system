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
    cb(null, `${Date.now()}-material-${safeName}`);
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

router.post("/", roleMiddleware("faculty", "admin"), upload.single("file"), (req, res) => {
  const { courseId, title, description } = req.body;

  if (!courseId || !title || !description || !req.file) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Course, title, description, and file are required." });
  }

  if (req.user.role === "faculty" && !facultyOwnsCourse(req.user.id, Number(courseId))) {
    removeUploadedFile(req.file);
    return res.status(403).json({ message: "You can only upload materials for your assigned courses." });
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
        INSERT INTO materials (course_id, faculty_id, title, description, file_path, file_name)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      courseId,
      facultyId,
      String(title).trim(),
      String(description).trim(),
      `/uploads/${req.file.filename}`,
      req.file.originalname
    );

  return res.status(201).json({ message: "Material uploaded successfully.", materialId: result.lastInsertRowid });
});

router.get("/", roleMiddleware("admin", "faculty", "student"), (req, res) => {
  let materials = [];

  if (req.user.role === "admin") {
    materials = db
      .prepare(
        `
          SELECT
            materials.id,
            materials.course_id,
            materials.title,
            materials.description,
            materials.file_path,
            materials.file_name,
            materials.uploaded_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            users.full_name AS faculty_name
          FROM materials
          JOIN courses ON courses.id = materials.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = materials.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          ORDER BY materials.uploaded_at DESC
        `
      )
      .all();
  } else if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    materials = db
      .prepare(
        `
          SELECT
            materials.id,
            materials.course_id,
            materials.title,
            materials.description,
            materials.file_path,
            materials.file_name,
            materials.uploaded_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            users.full_name AS faculty_name
          FROM materials
          JOIN courses ON courses.id = materials.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = materials.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          WHERE materials.faculty_id = ?
          ORDER BY materials.uploaded_at DESC
        `
      )
      .all(faculty.id);
  } else {
    const student = getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    materials = db
      .prepare(
        `
          SELECT
            materials.id,
            materials.course_id,
            materials.title,
            materials.description,
            materials.file_path,
            materials.file_name,
            materials.uploaded_at,
            courses.name AS course_name,
            courses.code AS course_code,
            courses.academic_course,
            branches.name AS branch_name,
            users.full_name AS faculty_name
          FROM materials
          JOIN courses ON courses.id = materials.course_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = materials.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          WHERE courses.department_id = ?
            AND COALESCE(courses.branch_id, ?) = ?
            AND courses.semester = ?
          ORDER BY materials.uploaded_at DESC
        `
      )
      .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);
  }

  return res.json({
    materials: materials.map((material) => ({
      ...material,
      downloadUrl: material.file_path
    }))
  });
});

module.exports = router;
