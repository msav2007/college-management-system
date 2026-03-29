const express = require("express");
const bcrypt = require("bcryptjs");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db, getFacultyProfileByUserId } = require("../config/db");

const router = express.Router();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const allowedDays = new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]);

function getDepartmentId(code) {
  const department = db
    .prepare("SELECT id FROM departments WHERE UPPER(code) = UPPER(?)")
    .get(String(code || "").trim());
  return department ? department.id : null;
}

router.use(authMiddleware);

router.get("/", roleMiddleware("admin"), (_req, res) => {
  const faculty = db
    .prepare(
      `
        SELECT
          faculty.id,
          faculty.employee_code,
          faculty.designation,
          faculty.salary_status,
          faculty.branch_id,
          users.full_name,
          users.email,
          departments.name AS department_name,
          branches.name AS branch_name
        FROM faculty
        JOIN users ON users.id = faculty.user_id
        JOIN departments ON departments.id = faculty.department_id
        LEFT JOIN branches ON branches.id = faculty.branch_id
        ORDER BY users.full_name ASC
      `
    )
    .all();

  return res.json({ faculty });
});

router.post("/", roleMiddleware("admin"), (req, res) => {
  const { fullName, email, password, departmentCode, branchId, designation, employeeCode } = req.body;

  if (!fullName || !email || !password || !departmentCode || !designation || !employeeCode) {
    return res.status(400).json({ message: "All faculty fields are required." });
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

  const duplicateUser = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);
  if (duplicateUser) {
    return res.status(409).json({ message: "A user with this email already exists." });
  }

  const duplicateFaculty = db.prepare("SELECT id FROM faculty WHERE employee_code = ?").get(employeeCode);
  if (duplicateFaculty) {
    return res.status(409).json({ message: "Employee code already exists." });
  }

  const createFaculty = db.transaction(() => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const userInsert = db
      .prepare(
        `
          INSERT INTO users (role, full_name, email, password_hash, department_id)
          VALUES ('faculty', ?, ?, ?, ?)
        `
      )
      .run(fullName.trim(), String(email).trim().toLowerCase(), passwordHash, departmentId);

    const facultyInsert = db
      .prepare(
        `
          INSERT INTO faculty (user_id, employee_code, designation, department_id, branch_id, salary_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(userInsert.lastInsertRowid, employeeCode.trim(), designation.trim(), departmentId, parsedBranchId, "pending");

    return facultyInsert.lastInsertRowid;
  });

  const facultyId = createFaculty();
  return res.status(201).json({ message: "Faculty created successfully.", facultyId });
});

router.get("/assigned-students", roleMiddleware("faculty", "admin"), (req, res) => {
  let students = [];

  if (req.user.role === "admin") {
    students = db
      .prepare(
        `
          SELECT
            students.id,
            students.roll_number,
            students.registration_number,
            students.semester,
            students.section,
            students.branch_id,
            users.full_name,
            users.email,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM students
          JOIN users ON users.id = students.user_id
          JOIN departments ON departments.id = students.department_id
          LEFT JOIN branches ON branches.id = students.branch_id
          ORDER BY users.full_name ASC
        `
      )
      .all();
  } else {
    const facultyProfile = getFacultyProfileByUserId(req.user.id);
    if (!facultyProfile) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    students = db
      .prepare(
        `
          SELECT
            DISTINCT students.id,
            students.roll_number,
            students.registration_number,
            students.semester,
            students.section,
            students.branch_id,
            users.full_name,
            users.email,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM students
          JOIN users ON users.id = students.user_id
          JOIN departments ON departments.id = students.department_id
          LEFT JOIN branches ON branches.id = students.branch_id
          JOIN courses ON courses.department_id = students.department_id
            AND COALESCE(courses.branch_id, students.branch_id) = students.branch_id
            AND courses.semester = students.semester
          WHERE courses.faculty_id = ?
          ORDER BY users.full_name ASC
        `
      )
      .all(facultyProfile.id);
  }

  return res.json({ students });
});

router.get("/courses", roleMiddleware("faculty", "admin"), (req, res) => {
  let courses = [];

  if (req.user.role === "admin") {
    courses = db
      .prepare(
        `
          SELECT
            courses.id,
            courses.name,
            courses.code,
            courses.department_id,
            courses.academic_course,
            courses.branch_id,
            courses.semester,
            courses.credits,
            departments.name AS department_name,
            branches.name AS branch_name,
            users.full_name AS faculty_name
          FROM courses
          JOIN departments ON departments.id = courses.department_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          LEFT JOIN faculty ON faculty.id = courses.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
          ORDER BY courses.code ASC
        `
      )
      .all();
  } else {
    const facultyProfile = getFacultyProfileByUserId(req.user.id);
    if (!facultyProfile) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    courses = db
      .prepare(
        `
          SELECT
            courses.id,
            courses.name,
            courses.code,
            courses.department_id,
            courses.academic_course,
            courses.branch_id,
            courses.semester,
            courses.credits,
            departments.name AS department_name,
            branches.name AS branch_name
          FROM courses
          JOIN departments ON departments.id = courses.department_id
          LEFT JOIN branches ON branches.id = courses.branch_id
          WHERE courses.faculty_id = ?
          ORDER BY courses.code ASC
        `
      )
      .all(facultyProfile.id);
  }

  return res.json({ courses });
});

router.post("/timetable", roleMiddleware("admin"), (req, res) => {
  const { courseId, facultyId, dayOfWeek, startTime, endTime, roomNo } = req.body;

  if (!courseId || !facultyId || !dayOfWeek || !startTime || !endTime || !roomNo) {
    return res.status(400).json({ message: "Course, faculty, day, time, and classroom are required." });
  }

  if (!allowedDays.has(String(dayOfWeek))) {
    return res.status(400).json({ message: "Selected day is invalid." });
  }

  if (String(startTime) >= String(endTime)) {
    return res.status(400).json({ message: "End time must be later than start time." });
  }

  const course = db.prepare("SELECT id, department_id FROM courses WHERE id = ?").get(Number(courseId));
  if (!course) {
    return res.status(404).json({ message: "Selected subject was not found." });
  }

  const faculty = db.prepare("SELECT id FROM faculty WHERE id = ?").get(Number(facultyId));
  if (!faculty) {
    return res.status(404).json({ message: "Selected faculty was not found." });
  }

  const clash = db
    .prepare(
      `
        SELECT id
        FROM timetable
        WHERE faculty_id = ?
          AND day_of_week = ?
          AND start_time < ?
          AND end_time > ?
      `
    )
    .get(Number(facultyId), String(dayOfWeek), String(endTime), String(startTime));

  if (clash) {
    return res.status(409).json({ message: "Faculty already has a class scheduled for this time slot." });
  }

  const result = db
    .prepare(
      `
        INSERT INTO timetable (department_id, course_id, faculty_id, day_of_week, start_time, end_time, room_no)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      course.department_id,
      Number(courseId),
      Number(facultyId),
      String(dayOfWeek),
      String(startTime),
      String(endTime),
      String(roomNo).trim()
    );

  return res.status(201).json({ message: "Timetable slot created successfully.", timetableId: result.lastInsertRowid });
});

router.get("/timetable", roleMiddleware("faculty", "admin"), (req, res) => {
  let timetable = [];

  if (req.user.role === "admin") {
    timetable = db
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
            departments.name AS department_name,
            users.full_name AS faculty_name
          FROM timetable
          JOIN courses ON courses.id = timetable.course_id
          JOIN departments ON departments.id = timetable.department_id
          LEFT JOIN faculty ON faculty.id = timetable.faculty_id
          LEFT JOIN users ON users.id = faculty.user_id
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
      .all();
  } else {
    const facultyProfile = getFacultyProfileByUserId(req.user.id);
    if (!facultyProfile) {
      return res.status(404).json({ message: "Faculty profile not found." });
    }

    timetable = db
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
            departments.name AS department_name
          FROM timetable
          JOIN courses ON courses.id = timetable.course_id
          JOIN departments ON departments.id = timetable.department_id
          WHERE timetable.faculty_id = ?
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
      .all(facultyProfile.id);
  }

  return res.json({ timetable });
});

router.get("/profile", roleMiddleware("faculty", "admin"), (req, res) => {
  if (req.user.role === "admin") {
    return res.json({ faculty: null, admin: req.user });
  }

  const faculty = getFacultyProfileByUserId(req.user.id);
  if (!faculty) {
    return res.status(404).json({ message: "Faculty profile not found." });
  }

  return res.json({ faculty });
});

module.exports = router;
