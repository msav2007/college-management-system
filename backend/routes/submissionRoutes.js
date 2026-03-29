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
    cb(null, `${Date.now()}-submission-${safeName}`);
  }
});

const upload = multer({ storage });

function removeUploadedFile(file) {
  if (file && file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
}

router.use(authMiddleware);

router.post("/", roleMiddleware("student"), upload.single("file"), (req, res) => {
  const { assignmentId, notes = "" } = req.body;

  if (!assignmentId || !req.file) {
    removeUploadedFile(req.file);
    return res.status(400).json({ message: "Assignment and submission file are required." });
  }

  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    removeUploadedFile(req.file);
    return res.status(404).json({ message: "Student profile not found." });
  }

  const assignment = db
    .prepare(
      `
        SELECT assignments.id, assignments.deadline, courses.department_id, courses.branch_id, courses.semester
        FROM assignments
        JOIN courses ON courses.id = assignments.course_id
        WHERE assignments.id = ?
      `
    )
    .get(assignmentId);

  if (!assignment) {
    removeUploadedFile(req.file);
    return res.status(404).json({ message: "Assignment not found." });
  }

  if (
    assignment.department_id !== student.department_id ||
    (assignment.branch_id || null) !== (student.branch_id || null) ||
    assignment.semester !== student.semester
  ) {
    removeUploadedFile(req.file);
    return res.status(403).json({ message: "This assignment is not assigned to you." });
  }

  const submissionStatus = new Date() > new Date(assignment.deadline) ? "late" : "submitted";

  db.prepare(
    `
      INSERT INTO submissions (assignment_id, student_id, notes, file_path, file_name, status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(assignment_id, student_id)
      DO UPDATE SET
        notes = excluded.notes,
        file_path = excluded.file_path,
        file_name = excluded.file_name,
        status = excluded.status,
        submitted_at = CURRENT_TIMESTAMP
    `
  ).run(
    assignmentId,
    student.id,
    String(notes).trim(),
    `/uploads/${req.file.filename}`,
    req.file.originalname,
    submissionStatus
  );

  return res.json({ message: "Assignment submitted successfully." });
});

router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const submissions = db
    .prepare(
      `
        SELECT
          submissions.id,
          submissions.notes,
          submissions.file_path,
          submissions.file_name,
          submissions.status,
          submissions.submitted_at,
          assignments.id AS assignment_id,
          assignments.title,
          assignments.deadline,
          courses.name AS course_name,
          courses.code AS course_code
        FROM submissions
        JOIN assignments ON assignments.id = submissions.assignment_id
        JOIN courses ON courses.id = assignments.course_id
        WHERE submissions.student_id = ?
        ORDER BY submissions.submitted_at DESC
      `
    )
    .all(student.id);

  return res.json({
    submissions: submissions.map((submission) => ({
      ...submission,
      downloadUrl: submission.file_path
    }))
  });
});

router.get("/:assignmentId", roleMiddleware("faculty", "admin"), (req, res) => {
  const assignmentId = Number(req.params.assignmentId);
  const assignment = db.prepare("SELECT * FROM assignments WHERE id = ?").get(assignmentId);

  if (!assignment) {
    return res.status(404).json({ message: "Assignment not found." });
  }

  if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty || assignment.faculty_id !== faculty.id) {
      return res.status(403).json({ message: "You can only view submissions for your assignments." });
    }
  }

  const submissions = db
    .prepare(
      `
        SELECT
          submissions.id,
          submissions.notes,
          submissions.file_path,
          submissions.file_name,
          submissions.status,
          submissions.submitted_at,
          users.full_name AS student_name,
          students.roll_number
        FROM submissions
        JOIN students ON students.id = submissions.student_id
        JOIN users ON users.id = students.user_id
        WHERE submissions.assignment_id = ?
        ORDER BY submissions.submitted_at DESC
      `
    )
    .all(assignmentId);

  return res.json({
    submissions: submissions.map((submission) => ({
      ...submission,
      downloadUrl: submission.file_path
    }))
  });
});

module.exports = router;
