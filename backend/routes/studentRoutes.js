const express = require("express");
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getStudentProfileByUserId } = require("../config/db");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function resolveFeeStatus(totalAmount, paidAmount) {
  if (paidAmount <= 0) return "pending";
  if (paidAmount >= totalAmount) return "paid";
  return "partial";
}

function getDepartmentId(code) {
  const department = db
    .prepare("SELECT id FROM departments WHERE UPPER(code) = UPPER(?)")
    .get(String(code || "").trim());
  return department ? department.id : null;
}

router.use(authMiddleware);

router.get("/", roleMiddleware("admin"), (_req, res) => {
  const students = db
    .prepare(
      `
        SELECT
          s.id,
          s.roll_number,
          s.registration_number,
          s.semester,
          s.section,
          s.branch_id,
          u.full_name,
          u.email,
          d.name AS department_name,
          b.name AS branch_name,
          advisor_user.full_name AS advisor_name
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN departments d ON d.id = s.department_id
        LEFT JOIN branches b ON b.id = s.branch_id
        LEFT JOIN faculty advisor ON advisor.id = s.advisor_faculty_id
        LEFT JOIN users advisor_user ON advisor_user.id = advisor.user_id
        ORDER BY u.full_name ASC
      `
    )
    .all();

  return res.json({ students });
});

router.get("/assigned", roleMiddleware("faculty"), (req, res) => {
  const facultyProfile = db.prepare("SELECT id FROM faculty WHERE user_id = ?").get(req.user.id);
  if (!facultyProfile) {
    return res.status(404).json({ message: "Faculty profile not found." });
  }

  const students = db
    .prepare(
      `
        SELECT
          DISTINCT s.id,
          s.roll_number,
          s.registration_number,
          s.semester,
          s.section,
          s.branch_id,
          u.full_name,
          u.email,
          d.name AS department_name,
          b.name AS branch_name
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN departments d ON d.id = s.department_id
        LEFT JOIN branches b ON b.id = s.branch_id
        JOIN courses ON courses.department_id = s.department_id
          AND COALESCE(courses.branch_id, s.branch_id) = s.branch_id
          AND courses.semester = s.semester
        WHERE courses.faculty_id = ?
        ORDER BY u.full_name ASC
      `
    )
    .all(facultyProfile.id);

  return res.json({ students });
});

router.post("/", roleMiddleware("admin"), (req, res) => {
  const {
    fullName,
    email,
    password,
    departmentCode,
    branchId,
    semester,
    section,
    rollNumber,
    registrationNumber,
    advisorFacultyId
  } = req.body;

  if (
    !fullName ||
    !email ||
    !password ||
    !departmentCode ||
    !semester ||
    !section ||
    !rollNumber ||
    !registrationNumber
  ) {
    return res.status(400).json({ message: "All student fields are required." });
  }

  if (!emailPattern.test(String(email).trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  if (String(password).length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  const departmentId = getDepartmentId(departmentCode);
  if (!departmentId) {
    return res.status(400).json({ message: "Selected department is invalid." });
  }

  let parsedBranchId = branchId ? Number(branchId) : null;
  if (parsedBranchId) {
    const branch = db.prepare("SELECT id FROM branches WHERE id = ? AND department_id = ?").get(parsedBranchId, departmentId);
    if (!branch) {
      return res.status(400).json({ message: "Selected branch is invalid." });
    }
  }

  const existingUser = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  if (existingUser) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const existingStudent = db
    .prepare("SELECT id FROM students WHERE roll_number = ? OR registration_number = ?")
    .get(rollNumber, registrationNumber);
  if (existingStudent) {
    return res.status(409).json({ message: "Roll number or registration number already exists." });
  }

  let assignedFacultyId = advisorFacultyId || null;
  if (!assignedFacultyId) {
    const faculty = db
      .prepare("SELECT id FROM faculty WHERE department_id = ? ORDER BY id LIMIT 1")
      .get(departmentId);
    assignedFacultyId = faculty ? faculty.id : null;
  }

  const createStudent = db.transaction(() => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const userInsert = db
      .prepare(
        `
          INSERT INTO users (role, full_name, email, password_hash, department_id)
          VALUES ('student', ?, ?, ?, ?)
        `
      )
      .run(fullName.trim(), String(email).trim().toLowerCase(), passwordHash, departmentId);

    const studentInsert = db
      .prepare(
        `
          INSERT INTO students (
            user_id,
            roll_number,
            registration_number,
            department_id,
            branch_id,
            semester,
            section,
            advisor_faculty_id
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
      )
      .run(
        userInsert.lastInsertRowid,
        rollNumber.trim(),
        registrationNumber.trim(),
        departmentId,
        parsedBranchId,
        Number(semester),
        section.trim().toUpperCase(),
        assignedFacultyId
      );

    return studentInsert.lastInsertRowid;
  });

  const studentId = createStudent();
  return res.status(201).json({ message: "Student created successfully.", studentId });
});

router.get("/me/profile", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const advisor = student.advisor_faculty_id
    ? db
        .prepare(
          `
            SELECT users.full_name
            FROM faculty
            JOIN users ON users.id = faculty.user_id
            WHERE faculty.id = ?
          `
        )
        .get(student.advisor_faculty_id)
    : null;

  return res.json({
    student: {
      id: student.id,
      fullName: student.full_name,
      email: student.email,
      rollNumber: student.roll_number,
      registrationNumber: student.registration_number,
      semester: student.semester,
      section: student.section,
      departmentName: student.department_name,
      branchName: student.branch_name || null,
      advisorName: advisor ? advisor.full_name : null
    }
  });
});

router.get("/me/courses", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const courses = db
    .prepare(
      `
        SELECT
          courses.id,
          courses.name,
          courses.code,
          courses.academic_course,
          courses.semester,
          courses.credits,
          branches.name AS branch_name,
          faculty_users.full_name AS faculty_name
        FROM courses
        LEFT JOIN branches ON branches.id = courses.branch_id
        LEFT JOIN faculty ON faculty.id = courses.faculty_id
        LEFT JOIN users faculty_users ON faculty_users.id = faculty.user_id
        WHERE courses.department_id = ?
          AND COALESCE(courses.branch_id, ?) = ?
          AND courses.semester = ?
        ORDER BY courses.code ASC
      `
    )
    .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);

  return res.json({ courses });
});

router.get("/me/timetable", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const timetable = db
    .prepare(
      `
        SELECT
          timetable.id,
          timetable.day_of_week,
          timetable.start_time,
          timetable.end_time,
          timetable.room_no,
          courses.name AS course_name,
          courses.code AS course_code,
          faculty_users.full_name AS faculty_name
        FROM timetable
        JOIN courses ON courses.id = timetable.course_id
        LEFT JOIN faculty ON faculty.id = timetable.faculty_id
        LEFT JOIN users faculty_users ON faculty_users.id = faculty.user_id
        WHERE timetable.department_id = ?
          AND COALESCE(courses.branch_id, ?) = ?
          AND courses.semester = ?
        ORDER BY
          CASE timetable.day_of_week
            WHEN 'Monday' THEN 1
            WHEN 'Tuesday' THEN 2
            WHEN 'Wednesday' THEN 3
            WHEN 'Thursday' THEN 4
            WHEN 'Friday' THEN 5
            WHEN 'Saturday' THEN 6
            ELSE 7
          END,
          timetable.start_time ASC
      `
    )
    .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);

  return res.json({ timetable });
});

router.get("/me/fees", roleMiddleware("student"), (req, res) => {
  const student = getStudentProfileByUserId(req.user.id);
  if (!student) {
    return res.status(404).json({ message: "Student profile not found." });
  }

  const fees = db
    .prepare(
      `
        SELECT
          id,
          semester,
          total_amount,
          paid_amount,
          due_date,
          status,
          (total_amount - paid_amount) AS balance
        FROM fees
        WHERE student_id = ?
        ORDER BY semester DESC
      `
    )
    .all(student.id);

  return res.json({ fees });
});

router.get("/fees", roleMiddleware("admin"), (_req, res) => {
  const fees = db
    .prepare(
      `
        SELECT
          fees.id,
          fees.student_id,
          fees.semester,
          fees.total_amount,
          fees.paid_amount,
          fees.due_date,
          fees.status,
          (fees.total_amount - fees.paid_amount) AS balance,
          students.roll_number,
          users.full_name,
          branches.name AS branch_name
        FROM fees
        JOIN students ON students.id = fees.student_id
        JOIN users ON users.id = students.user_id
        LEFT JOIN branches ON branches.id = students.branch_id
        ORDER BY fees.due_date ASC
      `
    )
    .all();

  return res.json({ fees });
});

router.post("/fees", roleMiddleware("admin"), (req, res) => {
  const { studentId, semester, totalAmount, paidAmount = 0, dueDate } = req.body;

  if (!studentId || !semester || totalAmount === undefined || !dueDate) {
    return res.status(400).json({ message: "Student, semester, total amount, and due date are required." });
  }

  const student = db.prepare("SELECT id FROM students WHERE id = ?").get(Number(studentId));
  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  const total = Number(totalAmount);
  const paid = Number(paidAmount);
  const parsedSemester = Number(semester);

  if (!Number.isFinite(total) || total < 0 || !Number.isFinite(paid) || paid < 0) {
    return res.status(400).json({ message: "Fee amounts must be valid positive numbers." });
  }

  if (paid > total) {
    return res.status(400).json({ message: "Paid amount cannot exceed the total amount." });
  }

  if (parsedSemester < 1 || parsedSemester > 8) {
    return res.status(400).json({ message: "Semester must be between 1 and 8." });
  }

  const status = resolveFeeStatus(total, paid);
  const existing = db.prepare("SELECT id FROM fees WHERE student_id = ? AND semester = ?").get(Number(studentId), parsedSemester);

  if (existing) {
    db.prepare("UPDATE fees SET total_amount = ?, paid_amount = ?, due_date = ?, status = ? WHERE id = ?").run(
      total,
      paid,
      String(dueDate),
      status,
      existing.id
    );

    return res.json({ message: "Fee record updated successfully.", feeId: existing.id });
  }

  const result = db
    .prepare(
      `
        INSERT INTO fees (student_id, semester, total_amount, paid_amount, due_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    )
    .run(Number(studentId), parsedSemester, total, paid, String(dueDate), status);

  return res.status(201).json({ message: "Fee record created successfully.", feeId: result.lastInsertRowid });
});

router.put("/fees/:id", roleMiddleware("admin"), (req, res) => {
  const feeId = Number(req.params.id);
  const { totalAmount, paidAmount = 0, dueDate, semester } = req.body;

  if (!feeId) {
    return res.status(400).json({ message: "Fee record selection is invalid." });
  }

  if (totalAmount === undefined || !dueDate || !semester) {
    return res.status(400).json({ message: "Semester, total amount, and due date are required." });
  }

  const existing = db.prepare("SELECT id FROM fees WHERE id = ?").get(feeId);
  if (!existing) {
    return res.status(404).json({ message: "Fee record not found." });
  }

  const total = Number(totalAmount);
  const paid = Number(paidAmount);
  const parsedSemester = Number(semester);

  if (!Number.isFinite(total) || total < 0 || !Number.isFinite(paid) || paid < 0) {
    return res.status(400).json({ message: "Fee amounts must be valid positive numbers." });
  }

  if (paid > total) {
    return res.status(400).json({ message: "Paid amount cannot exceed the total amount." });
  }

  if (parsedSemester < 1 || parsedSemester > 8) {
    return res.status(400).json({ message: "Semester must be between 1 and 8." });
  }

  const status = resolveFeeStatus(total, paid);
  db.prepare("UPDATE fees SET semester = ?, total_amount = ?, paid_amount = ?, due_date = ?, status = ? WHERE id = ?").run(
    parsedSemester,
    total,
    paid,
    String(dueDate),
    status,
    feeId
  );

  return res.json({ message: "Fee record updated successfully." });
});

router.delete("/:id", roleMiddleware("admin"), (req, res) => {
  const studentId = Number(req.params.id);

  if (!studentId) {
    return res.status(400).json({ message: "Student selection is invalid." });
  }

  const student = db
    .prepare(
      `
        SELECT students.id, students.user_id
        FROM students
        WHERE students.id = ?
      `
    )
    .get(studentId);

  if (!student) {
    return res.status(404).json({ message: "Student not found." });
  }

  const deleteStudent = db.transaction(() => {
    db.prepare("DELETE FROM attendance WHERE student_id = ?").run(studentId);
    db.prepare("DELETE FROM results WHERE student_id = ?").run(studentId);
    db.prepare("DELETE FROM fees WHERE student_id = ?").run(studentId);
    db.prepare("DELETE FROM submissions WHERE student_id = ?").run(studentId);
    db.prepare("DELETE FROM outing_requests WHERE student_id = ?").run(studentId);
    db.prepare("DELETE FROM notices WHERE posted_by = ?").run(student.user_id);
    db.prepare("DELETE FROM students WHERE id = ?").run(studentId);
    db.prepare("DELETE FROM users WHERE id = ?").run(student.user_id);
  });

  deleteStudent();

  return res.json({ message: "Student deleted successfully." });
});

module.exports = router;
