const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { db } = require("../config/db");

const router = express.Router();

function normalizeCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

router.use(authMiddleware);

router.get("/departments", roleMiddleware("admin"), (_req, res) => {
  const departments = db
    .prepare(
      `
        SELECT DISTINCT departments.id, departments.name, departments.code
        FROM departments
        JOIN branches ON branches.department_id = departments.id
        ORDER BY departments.name ASC
      `
    )
    .all();
  return res.json({ departments });
});

router.get("/branches", roleMiddleware("admin"), (req, res) => {
  const { departmentId } = req.query;
  const branches = departmentId
    ? db
        .prepare(
          `
            SELECT branches.id, branches.name, branches.code, branches.department_id, departments.name AS department_name
            FROM branches
            JOIN departments ON departments.id = branches.department_id
            WHERE branches.department_id = ?
            ORDER BY branches.name ASC
          `
        )
        .all(Number(departmentId))
    : db
        .prepare(
          `
            SELECT branches.id, branches.name, branches.code, branches.department_id, departments.name AS department_name
            FROM branches
            JOIN departments ON departments.id = branches.department_id
            ORDER BY departments.name ASC, branches.name ASC
          `
        )
        .all();

  return res.json({ branches });
});

router.get("/overview", roleMiddleware("admin"), (_req, res) => {
  const departments = db
    .prepare(
      `
        SELECT DISTINCT departments.id, departments.name, departments.code
        FROM departments
        JOIN branches ON branches.department_id = departments.id
        ORDER BY departments.name ASC
      `
    )
    .all();
  const branches = db
    .prepare(
      `
        SELECT
          branches.id,
          branches.name,
          branches.code,
          branches.department_id,
          departments.name AS department_name
        FROM branches
        JOIN departments ON departments.id = branches.department_id
        ORDER BY departments.name ASC, branches.name ASC
      `
    )
    .all();
  const faculty = db
    .prepare(
      `
        SELECT
          faculty.id,
          faculty.employee_code,
          faculty.designation,
          faculty.department_id,
          faculty.branch_id,
          faculty.salary_status,
          users.full_name,
          departments.name AS department_name,
          branches.name AS branch_name
        FROM faculty
        JOIN users ON users.id = faculty.user_id
        LEFT JOIN departments ON departments.id = faculty.department_id
        LEFT JOIN branches ON branches.id = faculty.branch_id
        ORDER BY users.full_name ASC
      `
    )
    .all();
  const subjects = db
    .prepare(
      `
        SELECT
          courses.id,
          courses.name,
          courses.code,
          courses.academic_course,
          courses.semester,
          courses.credits,
          courses.department_id,
          courses.branch_id,
          departments.name AS department_name,
          branches.name AS branch_name,
          faculty.id AS faculty_id,
          users.full_name AS faculty_name
        FROM courses
        LEFT JOIN departments ON departments.id = courses.department_id
        LEFT JOIN branches ON branches.id = courses.branch_id
        LEFT JOIN faculty ON faculty.id = courses.faculty_id
        LEFT JOIN users ON users.id = faculty.user_id
        ORDER BY departments.name ASC, branches.name ASC, courses.semester ASC, courses.code ASC
      `
    )
    .all();

  return res.json({ departments, branches, faculty, subjects });
});

router.post("/departments", roleMiddleware("admin"), (req, res) => {
  const { name, code } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedCode = normalizeCode(code || name);

  if (!normalizedName || !normalizedCode) {
    return res.status(400).json({ message: "Department name and code are required." });
  }

  const existing = db.prepare("SELECT id FROM departments WHERE UPPER(code) = UPPER(?)").get(normalizedCode);
  if (existing) {
    return res.status(409).json({ message: "Department code already exists." });
  }

  const result = db
    .prepare("INSERT INTO departments (name, code) VALUES (?, ?)")
    .run(normalizedName, normalizedCode);

  return res.status(201).json({ message: "Department created successfully.", departmentId: result.lastInsertRowid });
});

router.post("/branches", roleMiddleware("admin"), (req, res) => {
  const { departmentId, name, code } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedCode = normalizeCode(code || name);

  if (!departmentId || !normalizedName || !normalizedCode) {
    return res.status(400).json({ message: "Department, branch name, and branch code are required." });
  }

  const department = db.prepare("SELECT id FROM departments WHERE id = ?").get(Number(departmentId));
  if (!department) {
    return res.status(404).json({ message: "Department not found." });
  }

  const existing = db.prepare("SELECT id FROM branches WHERE UPPER(code) = UPPER(?)").get(normalizedCode);
  if (existing) {
    return res.status(409).json({ message: "Branch code already exists." });
  }

  const result = db
    .prepare("INSERT INTO branches (department_id, name, code) VALUES (?, ?, ?)")
    .run(Number(departmentId), normalizedName, normalizedCode);

  return res.status(201).json({ message: "Branch created successfully.", branchId: result.lastInsertRowid });
});

router.post("/subjects", roleMiddleware("admin"), (req, res) => {
  const { departmentId, branchId, academicCourse, name, code, semester, credits, facultyId } = req.body;
  const normalizedName = String(name || "").trim();
  const normalizedCode = normalizeCode(code);
  const parsedSemester = Number(semester);
  const parsedCredits = Number(credits);

  if (!departmentId || !branchId || !normalizedName || !normalizedCode || !parsedSemester || !parsedCredits) {
    return res.status(400).json({ message: "Department, branch, subject, code, semester, and credits are required." });
  }

  const branch = db
    .prepare("SELECT id, name FROM branches WHERE id = ? AND department_id = ?")
    .get(Number(branchId), Number(departmentId));
  if (!branch) {
    return res.status(400).json({ message: "Branch does not belong to the selected department." });
  }

  const normalizedCourse = String(academicCourse || "").trim() || branch.name || normalizedName;

  if (parsedSemester < 1 || parsedSemester > 8) {
    return res.status(400).json({ message: "Semester must be between 1 and 8." });
  }

  if (!Number.isFinite(parsedCredits) || parsedCredits <= 0) {
    return res.status(400).json({ message: "Credits must be a valid positive number." });
  }

  const duplicate = db.prepare("SELECT id FROM courses WHERE UPPER(code) = UPPER(?)").get(normalizedCode);
  if (duplicate) {
    return res.status(409).json({ message: "Subject code already exists." });
  }

  let assignedFacultyId = facultyId ? Number(facultyId) : null;
  if (assignedFacultyId) {
    const faculty = db.prepare("SELECT id FROM faculty WHERE id = ?").get(assignedFacultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Selected faculty was not found." });
    }

    db.prepare("UPDATE faculty SET department_id = ?, branch_id = ? WHERE id = ?").run(
      Number(departmentId),
      Number(branchId),
      assignedFacultyId
    );
  }

  const result = db
    .prepare(
      `
        INSERT INTO courses (department_id, branch_id, faculty_id, academic_course, name, code, semester, credits)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `
    )
    .run(
      Number(departmentId),
      Number(branchId),
      assignedFacultyId,
      normalizedCourse,
      normalizedName,
      normalizedCode,
      parsedSemester,
      parsedCredits
    );

  return res.status(201).json({ message: "Subject created successfully.", subjectId: result.lastInsertRowid });
});

router.put("/subjects/:id/faculty", roleMiddleware("admin"), (req, res) => {
  const subjectId = Number(req.params.id);
  const facultyId = Number(req.body.facultyId);

  if (!subjectId || !facultyId) {
    return res.status(400).json({ message: "Subject and faculty are required." });
  }

  const subject = db
    .prepare("SELECT id, department_id, branch_id FROM courses WHERE id = ?")
    .get(subjectId);
  if (!subject) {
    return res.status(404).json({ message: "Subject not found." });
  }

  const faculty = db.prepare("SELECT id FROM faculty WHERE id = ?").get(facultyId);
  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found." });
  }

  db.prepare("UPDATE courses SET faculty_id = ? WHERE id = ?").run(facultyId, subjectId);
  db.prepare("UPDATE faculty SET department_id = ?, branch_id = ? WHERE id = ?").run(
    subject.department_id,
    subject.branch_id,
    facultyId
  );

  return res.json({ message: "Faculty assigned successfully." });
});

router.put("/faculty/:id/assignment", roleMiddleware("admin"), (req, res) => {
  const facultyId = Number(req.params.id);
  const { departmentId, branchId, salaryStatus } = req.body;

  if (!facultyId) {
    return res.status(400).json({ message: "Faculty selection is invalid." });
  }

  const faculty = db.prepare("SELECT id FROM faculty WHERE id = ?").get(facultyId);
  if (!faculty) {
    return res.status(404).json({ message: "Faculty not found." });
  }

  if (branchId) {
    const branch = db
      .prepare("SELECT id FROM branches WHERE id = ? AND department_id = ?")
      .get(Number(branchId), Number(departmentId));
    if (!branch) {
      return res.status(400).json({ message: "Branch does not belong to the selected department." });
    }
  }

  db.prepare(
    `
      UPDATE faculty
      SET department_id = COALESCE(?, department_id),
          branch_id = COALESCE(?, branch_id),
          salary_status = COALESCE(?, salary_status)
      WHERE id = ?
    `
  ).run(
    departmentId ? Number(departmentId) : null,
    branchId ? Number(branchId) : null,
    salaryStatus ? String(salaryStatus).trim().toLowerCase() : null,
    facultyId
  );

  return res.json({ message: "Faculty assignment updated successfully." });
});

module.exports = router;
