const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
const allowedStatuses = new Set(["approved", "rejected"]);

router.use(authMiddleware);

router.post("/", roleMiddleware("student"), (req, res) => {
  const { purpose, destination, outingDate, returnDate } = req.body;

  if (!purpose || !destination || !outingDate || !returnDate) {
    return res.status(400).json({ message: "Purpose, destination, outing date, and return date are required." });
  }

  const outing = new Date(outingDate);
  const returning = new Date(returnDate);
  if (Number.isNaN(outing.getTime()) || Number.isNaN(returning.getTime())) {
    return res.status(400).json({ message: "Please provide valid outing dates." });
  }

  if (returning < outing) {
    return res.status(400).json({ message: "Return date must be after the outing date." });
  }

  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const result = db
    .prepare(
      `
        INSERT INTO outing_requests (student_id, purpose, destination, outing_date, return_date, status)
        VALUES (?, ?, ?, ?, ?, 'pending')
      `
    )
    .run(student.id, String(purpose).trim(), String(destination).trim(), outingDate, returnDate);

  return res.status(201).json({ message: "Outing request submitted successfully.", requestId: result.lastInsertRowid });
});

router.get("/my", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const requests = db
    .prepare(
      `
        SELECT
          outing_requests.id,
          outing_requests.purpose,
          outing_requests.destination,
          outing_requests.outing_date,
          outing_requests.return_date,
          outing_requests.status,
          outing_requests.faculty_comment,
          outing_requests.created_at,
          reviewer.full_name AS reviewed_by_name
        FROM outing_requests
        LEFT JOIN faculty ON faculty.id = outing_requests.reviewed_by
        LEFT JOIN users reviewer ON reviewer.id = faculty.user_id
        WHERE outing_requests.student_id = ?
        ORDER BY outing_requests.created_at DESC
      `
    )
    .all(student.id);

  return res.json({ requests });
});

router.get("/", roleMiddleware("faculty", "admin"), (req, res) => {
  let requests = [];

  if (req.user.role === "admin") {
    requests = db
      .prepare(
        `
          SELECT
            outing_requests.id,
            outing_requests.purpose,
            outing_requests.destination,
            outing_requests.outing_date,
            outing_requests.return_date,
            outing_requests.status,
            outing_requests.faculty_comment,
            outing_requests.created_at,
            users.full_name AS student_name,
            students.roll_number
          FROM outing_requests
          JOIN students ON students.id = outing_requests.student_id
          JOIN users ON users.id = students.user_id
          ORDER BY outing_requests.created_at DESC
        `
      )
      .all();
  } else {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    requests = db
      .prepare(
        `
          SELECT
            outing_requests.id,
            outing_requests.purpose,
            outing_requests.destination,
            outing_requests.outing_date,
            outing_requests.return_date,
            outing_requests.status,
            outing_requests.faculty_comment,
            outing_requests.created_at,
            users.full_name AS student_name,
            students.roll_number
          FROM outing_requests
          JOIN students ON students.id = outing_requests.student_id
          JOIN users ON users.id = students.user_id
          WHERE students.advisor_faculty_id = ?
          ORDER BY outing_requests.created_at DESC
        `
      )
      .all(faculty.id);
  }

  return res.json({ requests });
});

router.put("/:id", roleMiddleware("faculty", "admin"), (req, res) => {
  const requestId = Number(req.params.id);
  const { status, facultyComment = "" } = req.body;

  if (!allowedStatuses.has(String(status).toLowerCase())) {
    return res.status(400).json({ message: "Status must be either approved or rejected." });
  }

  const request = db
    .prepare(
      `
        SELECT outing_requests.id, students.advisor_faculty_id
        FROM outing_requests
        JOIN students ON students.id = outing_requests.student_id
        WHERE outing_requests.id = ?
      `
    )
    .get(requestId);

  if (!request) {
    return res.status(404).json({ message: "Outing request not found." });
  }

  let reviewedBy = null;

  if (req.user.role === "faculty") {
    const faculty = getFacultyProfileByUserId(req.user.id);
    if (!faculty || request.advisor_faculty_id !== faculty.id) {
      return res.status(403).json({ message: "You can only review outing requests for your assigned students." });
    }
    reviewedBy = faculty.id;
  }

  db.prepare(
    `
      UPDATE outing_requests
      SET status = ?, faculty_comment = ?, reviewed_by = ?
      WHERE id = ?
    `
  ).run(String(status).toLowerCase(), String(facultyComment).trim(), reviewedBy, requestId);

  return res.json({ message: `Outing request ${String(status).toLowerCase()} successfully.` });
});

module.exports = router;
