const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
const allowedAudiences = new Set(["all", "students", "faculty", "admins"]);

router.use(authMiddleware);

router.post("/", roleMiddleware("admin", "faculty"), (req, res) => {
  const { title, content, audience = "all" } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  const normalizedAudience = req.user.role === "faculty" ? "students" : String(audience).toLowerCase();

  if (!allowedAudiences.has(normalizedAudience)) {
    return res.status(400).json({ message: "Audience selection is invalid." });
  }

  const result = db
    .prepare(
      `
        INSERT INTO notices (title, content, posted_by, audience)
        VALUES (?, ?, ?, ?)
      `
    )
    .run(String(title).trim(), String(content).trim(), req.user.id, normalizedAudience);

  return res.status(201).json({ message: "Notice posted successfully.", noticeId: result.lastInsertRowid });
});

router.put("/:id", roleMiddleware("admin"), (req, res) => {
  const { title, content, audience = "all" } = req.body;
  const noticeId = Number(req.params.id);

  if (!noticeId) {
    return res.status(400).json({ message: "Notice selection is invalid." });
  }

  if (!title || !content) {
    return res.status(400).json({ message: "Title and content are required." });
  }

  const normalizedAudience = String(audience).toLowerCase();
  if (!allowedAudiences.has(normalizedAudience)) {
    return res.status(400).json({ message: "Audience selection is invalid." });
  }

  const existing = db.prepare("SELECT id FROM notices WHERE id = ?").get(noticeId);
  if (!existing) {
    return res.status(404).json({ message: "Notice not found." });
  }

  db.prepare("UPDATE notices SET title = ?, content = ?, audience = ? WHERE id = ?").run(
    String(title).trim(),
    String(content).trim(),
    normalizedAudience,
    noticeId
  );

  return res.json({ message: "Notice updated successfully." });
});

router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const noticeId = Number(req.params.id);
  if (!noticeId) {
    return res.status(400).json({ message: "Notice selection is invalid." });
  }

  const result = db.prepare("DELETE FROM notices WHERE id = ?").run(noticeId);
  if (!result.changes) {
    return res.status(404).json({ message: "Notice not found." });
  }

  return res.json({ message: "Notice deleted successfully." });
});

router.get("/", roleMiddleware("admin", "faculty", "student"), (req, res) => {
  let notices = [];

  if (req.user.role === "admin") {
    notices = db
      .prepare(
        `
          SELECT DISTINCT
            notices.id,
            notices.title,
            notices.content,
            notices.audience,
            notices.posted_at,
            notices.posted_by,
            users.full_name AS posted_by_name,
            users.role AS posted_by_role
          FROM notices
          JOIN users ON users.id = notices.posted_by
          ORDER BY notices.posted_at DESC
        `
      )
      .all();
  } else if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    notices = db
      .prepare(
        `
          SELECT
            notices.id,
            notices.title,
            notices.content,
            notices.audience,
            notices.posted_at,
            notices.posted_by,
            users.full_name AS posted_by_name,
            users.role AS posted_by_role
          FROM notices
          JOIN users ON users.id = notices.posted_by
          WHERE
            (users.role = 'admin' AND notices.audience IN ('all', 'faculty'))
            OR notices.posted_by = ?
          ORDER BY notices.posted_at DESC
        `
      )
      .all(req.user.id);
  } else {
    const student = getStudentProfileByUserId(req.user.id);
    if (!student) {
      return res.status(404).json({ message: "Student profile not found." });
    }

    notices = db
      .prepare(
        `
          SELECT
            notices.id,
            notices.title,
            notices.content,
            notices.audience,
            notices.posted_at,
            notices.posted_by,
            users.full_name AS posted_by_name,
            users.role AS posted_by_role
          FROM notices
          JOIN users ON users.id = notices.posted_by
          LEFT JOIN faculty author_faculty ON author_faculty.user_id = users.id
          LEFT JOIN courses faculty_courses ON faculty_courses.faculty_id = author_faculty.id
          WHERE
            (users.role = 'admin' AND notices.audience IN ('all', 'students'))
            OR (
              users.role = 'faculty'
              AND notices.audience = 'students'
              AND faculty_courses.department_id = ?
              AND COALESCE(faculty_courses.branch_id, ?) = ?
              AND faculty_courses.semester = ?
            )
          ORDER BY notices.posted_at DESC
        `
      )
      .all(
        student.department_id,
        student.branch_id || null,
        student.branch_id || null,
        student.semester
      );
  }

  return res.json({ notices });
});

module.exports = router;
