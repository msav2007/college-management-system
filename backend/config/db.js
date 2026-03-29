const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const initSqlJs = require("sql.js");

const databaseDir = path.join(__dirname, "..", "..", "database");
const databasePath = path.join(databaseDir, "cms.db");
const schemaPath = path.join(databaseDir, "cms.sql");
const uploadsDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

class StatementWrapper {
  constructor(driver, sql) {
    this.driver = driver;
    this.sql = sql;
  }

  get(...params) {
    this.driver.ensureReady();
    const statement = this.driver.database.prepare(this.sql);

    try {
      const normalized = this.driver.normalizeParams(params);
      if (normalized !== undefined) {
        statement.bind(normalized);
      }

      if (statement.step()) {
        return statement.getAsObject();
      }

      return undefined;
    } finally {
      statement.free();
    }
  }

  all(...params) {
    this.driver.ensureReady();
    const statement = this.driver.database.prepare(this.sql);

    try {
      const normalized = this.driver.normalizeParams(params);
      if (normalized !== undefined) {
        statement.bind(normalized);
      }

      const rows = [];
      while (statement.step()) {
        rows.push(statement.getAsObject());
      }
      return rows;
    } finally {
      statement.free();
    }
  }

  run(...params) {
    this.driver.ensureReady();
    const statement = this.driver.database.prepare(this.sql);

    try {
      const normalized = this.driver.normalizeParams(params);
      if (normalized !== undefined) {
        statement.run(normalized);
      } else {
        statement.run();
      }
    } finally {
      statement.free();
    }

    const result = {
      lastInsertRowid: this.driver.getLastInsertRowid(),
      changes: this.driver.getRowsModified()
    };

    this.driver.persistIfNeeded();
    return result;
  }
}

class SQLDriver {
  constructor() {
    this.database = null;
    this.inTransaction = 0;
  }

  attachDatabase(database) {
    this.database = database;
  }

  ensureReady() {
    if (!this.database) {
      throw new Error("Database has not been initialized.");
    }
  }

  normalizeParams(params) {
    if (!params.length) {
      return undefined;
    }

    if (
      params.length === 1 &&
      (Array.isArray(params[0]) || (params[0] && typeof params[0] === "object" && !Buffer.isBuffer(params[0])))
    ) {
      return params[0];
    }

    return params;
  }

  pragma(statement) {
    this.ensureReady();
    this.database.exec(`PRAGMA ${statement}`);
  }

  exec(sql) {
    this.ensureReady();
    this.database.exec(sql);
    this.persistIfNeeded();
  }

  prepare(sql) {
    this.ensureReady();
    return new StatementWrapper(this, sql);
  }

  transaction(fn) {
    return (...args) => {
      this.ensureReady();
      this.database.exec("BEGIN");
      this.inTransaction += 1;

      try {
        const result = fn(...args);
        this.database.exec("COMMIT");
        this.inTransaction -= 1;
        this.persistIfNeeded(true);
        return result;
      } catch (error) {
        try {
          this.database.exec("ROLLBACK");
        } catch (_rollbackError) {
          // Ignore rollback errors and rethrow the original issue.
        }

        this.inTransaction = Math.max(0, this.inTransaction - 1);
        throw error;
      }
    };
  }

  getLastInsertRowid() {
    const result = this.database.exec("SELECT last_insert_rowid() AS id");
    return result[0]?.values?.[0]?.[0] ?? 0;
  }

  getRowsModified() {
    return this.database.getRowsModified();
  }

  persistIfNeeded(force = false) {
    if (!this.database) {
      return;
    }

    if (!force && this.inTransaction > 0) {
      return;
    }

    const buffer = Buffer.from(this.database.export());
    fs.writeFileSync(databasePath, buffer);
  }
}

const db = new SQLDriver();

function mapUserProfile(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    email: row.email,
    departmentId: row.department_id,
    departmentName: row.department_name || null,
    createdAt: row.created_at,
    branchId: row.branch_id || null,
    branchName: row.branch_name || null,
    studentProfile: row.student_profile_id
      ? {
          id: row.student_profile_id,
          rollNumber: row.roll_number,
          registrationNumber: row.registration_number,
          semester: row.student_semester,
          section: row.section,
          advisorFacultyId: row.advisor_faculty_id,
          branchId: row.student_branch_id || row.branch_id || null,
          branchName: row.student_branch_name || row.branch_name || null
        }
      : null,
    facultyProfile: row.faculty_profile_id
      ? {
          id: row.faculty_profile_id,
          employeeCode: row.employee_code,
          designation: row.designation,
          branchId: row.faculty_branch_id || row.branch_id || null,
          branchName: row.faculty_branch_name || row.branch_name || null
        }
      : null
  };
}

function getUserProfileById(userId) {
  const row = db
    .prepare(
      `
        SELECT
          u.id,
          u.role,
          u.full_name,
          u.email,
          u.department_id,
          u.created_at,
          d.name AS department_name,
          branch_lookup.id AS branch_id,
          branch_lookup.name AS branch_name,
          s.id AS student_profile_id,
          s.roll_number,
          s.registration_number,
          s.semester AS student_semester,
          s.section,
          s.advisor_faculty_id,
          s.branch_id AS student_branch_id,
          student_branch.name AS student_branch_name,
          f.id AS faculty_profile_id,
          f.employee_code,
          f.designation,
          f.branch_id AS faculty_branch_id,
          faculty_branch.name AS faculty_branch_name
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN faculty f ON f.user_id = u.id
        LEFT JOIN departments d ON d.id = COALESCE(s.department_id, f.department_id, u.department_id)
        LEFT JOIN branches branch_lookup ON branch_lookup.id = COALESCE(s.branch_id, f.branch_id)
        LEFT JOIN branches student_branch ON student_branch.id = s.branch_id
        LEFT JOIN branches faculty_branch ON faculty_branch.id = f.branch_id
        WHERE u.id = ?
      `
    )
    .get(userId);

  return mapUserProfile(row);
}

function getUserAccountByEmail(email) {
  return db
    .prepare(
      `
        SELECT
          u.*,
          d.name AS department_name,
          branch_lookup.id AS branch_id,
          branch_lookup.name AS branch_name,
          s.id AS student_profile_id,
          s.roll_number,
          s.registration_number,
          s.semester AS student_semester,
          s.section,
          s.advisor_faculty_id,
          s.branch_id AS student_branch_id,
          student_branch.name AS student_branch_name,
          f.id AS faculty_profile_id,
          f.employee_code,
          f.designation,
          f.branch_id AS faculty_branch_id,
          faculty_branch.name AS faculty_branch_name
        FROM users u
        LEFT JOIN students s ON s.user_id = u.id
        LEFT JOIN faculty f ON f.user_id = u.id
        LEFT JOIN departments d ON d.id = COALESCE(s.department_id, f.department_id, u.department_id)
        LEFT JOIN branches branch_lookup ON branch_lookup.id = COALESCE(s.branch_id, f.branch_id)
        LEFT JOIN branches student_branch ON student_branch.id = s.branch_id
        LEFT JOIN branches faculty_branch ON faculty_branch.id = f.branch_id
        WHERE LOWER(u.email) = LOWER(?)
      `
    )
    .get(email);
}

function getStudentProfileByUserId(userId) {
  return db
    .prepare(
      `
        SELECT s.*, u.full_name, u.email, d.name AS department_name, b.name AS branch_name, b.code AS branch_code
        FROM students s
        JOIN users u ON u.id = s.user_id
        JOIN departments d ON d.id = s.department_id
        LEFT JOIN branches b ON b.id = s.branch_id
        WHERE s.user_id = ?
      `
    )
    .get(userId);
}

function getFacultyProfileByUserId(userId) {
  return db
    .prepare(
      `
        SELECT f.*, u.full_name, u.email, d.name AS department_name, b.name AS branch_name, b.code AS branch_code
        FROM faculty f
        JOIN users u ON u.id = f.user_id
        JOIN departments d ON d.id = f.department_id
        LEFT JOIN branches b ON b.id = f.branch_id
        WHERE f.user_id = ?
      `
    )
    .get(userId);
}

function getTableColumns(tableName) {
  return db.prepare(`PRAGMA table_info(${tableName})`).all().map((column) => column.name);
}

function ensureColumn(tableName, columnName, definition) {
  if (!getTableColumns(tableName).includes(columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function getOrCreateDepartment(name, code) {
  const existing = db.prepare("SELECT id FROM departments WHERE UPPER(code) = UPPER(?)").get(code);
  if (existing) {
    return existing.id;
  }

  return db.prepare("INSERT INTO departments (name, code) VALUES (?, ?)").run(name, code).lastInsertRowid;
}

function getOrCreateBranch(departmentId, name, code) {
  const existing = db.prepare("SELECT id FROM branches WHERE UPPER(code) = UPPER(?)").get(code);
  if (existing) {
    return existing.id;
  }

  return db.prepare("INSERT INTO branches (department_id, name, code) VALUES (?, ?, ?)").run(departmentId, name, code)
    .lastInsertRowid;
}

function ensureAcademicSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS branches (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      department_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      code TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS exams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      exam_name TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      exam_time TEXT NOT NULL,
      created_by INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE
    );
  `);

  ensureColumn("faculty", "branch_id", "INTEGER");
  ensureColumn("faculty", "salary_status", "TEXT NOT NULL DEFAULT 'pending'");
  ensureColumn("students", "branch_id", "INTEGER");
  ensureColumn("courses", "branch_id", "INTEGER");
  ensureColumn("courses", "academic_course", "TEXT NOT NULL DEFAULT 'Core Curriculum'");
}

function resolveAcademicTrack(code) {
  const normalized = String(code || "").toUpperCase();

  if (normalized.startsWith("CSE")) {
    return { departmentCode: "BTECH", branchCode: "CSE-CORE", academicCourse: "Computer Science Engineering" };
  }

  if (normalized.startsWith("ECE")) {
    return { departmentCode: "BTECH", branchCode: "ECE", academicCourse: "Electronics and Communication Engineering" };
  }

  if (normalized.startsWith("BBA") || normalized.startsWith("MBA")) {
    return { departmentCode: "MBA", branchCode: "MBA-FIN", academicCourse: "Business Administration" };
  }

  if (normalized.startsWith("MCA")) {
    return { departmentCode: "MCA", branchCode: "MCA-APP", academicCourse: "Computer Applications" };
  }

  return { departmentCode: "BTECH", branchCode: "CSE-CORE", academicCourse: "Computer Science Engineering" };
}

function ensureAcademicSeedData() {
  const departmentIds = {
    BTECH: getOrCreateDepartment("BTech", "BTECH"),
    MTECH: getOrCreateDepartment("MTech", "MTECH"),
    MBA: getOrCreateDepartment("MBA", "MBA"),
    MCA: getOrCreateDepartment("MCA", "MCA")
  };

  const branchIds = {
    "CSE-CORE": getOrCreateBranch(departmentIds.BTECH, "CSE Core", "CSE-CORE"),
    "CSE-AIML": getOrCreateBranch(departmentIds.BTECH, "CSE AIML", "CSE-AIML"),
    ECE: getOrCreateBranch(departmentIds.BTECH, "ECE", "ECE"),
    "MTECH-CSE": getOrCreateBranch(departmentIds.MTECH, "CSE Research", "MTECH-CSE"),
    "MBA-FIN": getOrCreateBranch(departmentIds.MBA, "Finance", "MBA-FIN"),
    "MBA-MKT": getOrCreateBranch(departmentIds.MBA, "Marketing", "MBA-MKT"),
    "MCA-APP": getOrCreateBranch(departmentIds.MCA, "Application Development", "MCA-APP")
  };

  const legacyDepartments = db
    .prepare(
      `
        SELECT id, code
        FROM departments
        WHERE UPPER(code) IN ('CSE', 'ECE', 'BBA')
      `
    )
    .all();

  legacyDepartments.forEach((department) => {
    const track = resolveAcademicTrack(department.code);
    const mappedDepartmentId = departmentIds[track.departmentCode];
    const mappedBranchId = branchIds[track.branchCode];

    db.prepare("UPDATE users SET department_id = ? WHERE department_id = ?").run(mappedDepartmentId, department.id);
    db.prepare("UPDATE faculty SET department_id = ?, branch_id = COALESCE(branch_id, ?) WHERE department_id = ?").run(
      mappedDepartmentId,
      mappedBranchId,
      department.id
    );
    db.prepare("UPDATE students SET department_id = ?, branch_id = COALESCE(branch_id, ?) WHERE department_id = ?").run(
      mappedDepartmentId,
      mappedBranchId,
      department.id
    );
    db.prepare(
      "UPDATE courses SET department_id = ?, branch_id = COALESCE(branch_id, ?), academic_course = COALESCE(NULLIF(academic_course, ''), ?) WHERE department_id = ?"
    ).run(mappedDepartmentId, mappedBranchId, track.academicCourse, department.id);
    db.prepare("UPDATE timetable SET department_id = ? WHERE department_id = ?").run(mappedDepartmentId, department.id);
  });

  const courses = db.prepare("SELECT id, code FROM courses").all();
  courses.forEach((course) => {
    const track = resolveAcademicTrack(course.code);
    const mappedDepartmentId = departmentIds[track.departmentCode];
    const mappedBranchId = branchIds[track.branchCode];

    db.prepare(
      `
        UPDATE courses
        SET department_id = ?,
            branch_id = COALESCE(branch_id, ?),
            academic_course = COALESCE(NULLIF(academic_course, ''), ?)
        WHERE id = ?
      `
    ).run(mappedDepartmentId, mappedBranchId, track.academicCourse, course.id);

    db.prepare("UPDATE timetable SET department_id = ? WHERE course_id = ?").run(mappedDepartmentId, course.id);
  });
}

function createUserIfMissing({ role, fullName, email, password, departmentId = null }) {
  const existing = db.prepare("SELECT id FROM users WHERE LOWER(email) = LOWER(?)").get(email);

  if (existing) {
    return existing.id;
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const result = db
    .prepare(
      `
        INSERT INTO users (role, full_name, email, password_hash, department_id)
        VALUES (?, ?, ?, ?, ?)
      `
    )
    .run(role, fullName, email, passwordHash, departmentId);

  return result.lastInsertRowid;
}

function ensureSeedUsers() {
  const btechDepartment = db.prepare("SELECT id FROM departments WHERE code = ?").get("BTECH");
  const cseBranch = db.prepare("SELECT id FROM branches WHERE code = ?").get("CSE-CORE");
  const cseDepartmentId = btechDepartment ? btechDepartment.id : null;
  const cseBranchId = cseBranch ? cseBranch.id : null;

  const adminUserId = createUserIfMissing({
    role: "admin",
    fullName: "System Administrator",
    email: "admin@college.edu",
    password: "Admin@123"
  });

  const facultyUserId = createUserIfMissing({
    role: "faculty",
    fullName: "Dr. Priya Nair",
    email: "faculty@college.edu",
    password: "Faculty@123",
    departmentId: cseDepartmentId
  });

  const studentUserId = createUserIfMissing({
    role: "student",
    fullName: "Aarav Sharma",
    email: "student@college.edu",
    password: "Student@123",
    departmentId: cseDepartmentId
  });

  const facultyProfile = db.prepare("SELECT id FROM faculty WHERE user_id = ?").get(facultyUserId);
  let facultyId = facultyProfile ? facultyProfile.id : null;

  if (!facultyId) {
    const result = db
      .prepare(
        `
          INSERT INTO faculty (user_id, employee_code, designation, department_id, branch_id, salary_status)
          VALUES (?, ?, ?, ?, ?, ?)
        `
      )
      .run(facultyUserId, "FAC001", "Associate Professor", cseDepartmentId, cseBranchId, "credited");
    facultyId = result.lastInsertRowid;
  } else {
    db.prepare("UPDATE faculty SET department_id = ?, branch_id = COALESCE(branch_id, ?), salary_status = COALESCE(NULLIF(salary_status, ''), 'credited') WHERE id = ?")
      .run(cseDepartmentId, cseBranchId, facultyId);
  }

  const studentProfile = db.prepare("SELECT id FROM students WHERE user_id = ?").get(studentUserId);
  let studentId = studentProfile ? studentProfile.id : null;

  if (!studentId) {
    const result = db
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
      .run(studentUserId, "CSE2024-001", "REG2024-001", cseDepartmentId, cseBranchId, 5, "A", facultyId);
    studentId = result.lastInsertRowid;
  } else {
    db.prepare("UPDATE students SET department_id = ?, branch_id = COALESCE(branch_id, ?) WHERE id = ?")
      .run(cseDepartmentId, cseBranchId, studentId);
  }

  db.prepare("UPDATE courses SET faculty_id = ?, department_id = ?, branch_id = COALESCE(branch_id, ?), academic_course = COALESCE(NULLIF(academic_course, ''), 'Computer Science Engineering') WHERE semester = 5 AND code LIKE 'CSE%'")
    .run(facultyId, cseDepartmentId, cseBranchId);

  seedFees(studentId);
  seedTimetable(cseDepartmentId, facultyId);
  seedAttendance(studentId, facultyId, cseDepartmentId);
  seedResults(studentId, facultyId, cseDepartmentId);
  seedNotices(adminUserId);
  seedAssignments(studentId, facultyId);
  seedMaterials(facultyId);
  seedOutingRequests(studentId);
}

function seedFees(studentId) {
  const feeExists = db.prepare("SELECT id FROM fees WHERE student_id = ? AND semester = ?").get(studentId, 5);

  if (!feeExists) {
    db.prepare(
      `
        INSERT INTO fees (student_id, semester, total_amount, paid_amount, due_date, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(studentId, 5, 85000, 60000, "2026-04-10", "partial");
  }
}

function seedTimetable(departmentId, facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM timetable WHERE department_id = ?").get(departmentId);

  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id, code FROM courses WHERE department_id = ? AND semester = 5 ORDER BY id")
    .all(departmentId);

  const entries = [
    { day: "Monday", courseCode: "CSE501", start: "09:00", end: "10:00", room: "Lab-201" },
    { day: "Monday", courseCode: "CSE502", start: "10:15", end: "11:15", room: "A-203" },
    { day: "Tuesday", courseCode: "CSE503", start: "09:00", end: "10:00", room: "B-104" },
    { day: "Wednesday", courseCode: "CSE501", start: "11:30", end: "12:30", room: "Lab-201" },
    { day: "Thursday", courseCode: "CSE502", start: "13:30", end: "14:30", room: "A-203" },
    { day: "Friday", courseCode: "CSE503", start: "10:15", end: "11:15", room: "B-104" }
  ];

  const insert = db.prepare(
    `
      INSERT INTO timetable (department_id, course_id, faculty_id, day_of_week, start_time, end_time, room_no)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
  );

  for (const entry of entries) {
    const course = courseRows.find((row) => row.code === entry.courseCode);
    if (!course) {
      continue;
    }
    insert.run(departmentId, course.id, facultyId, entry.day, entry.start, entry.end, entry.room);
  }
}

function seedAttendance(studentId, facultyId, departmentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM attendance WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id FROM courses WHERE semester = 5 AND department_id = ? ORDER BY id")
    .all(departmentId);
  const dates = ["2026-03-17", "2026-03-18", "2026-03-19", "2026-03-20", "2026-03-23"];
  const statuses = ["present", "present", "absent", "present", "late"];
  const insert = db.prepare(
    `
      INSERT INTO attendance (student_id, course_id, faculty_id, date, status)
      VALUES (?, ?, ?, ?, ?)
    `
  );

  courseRows.forEach((course, index) => {
    insert.run(studentId, course.id, facultyId, dates[index % dates.length], statuses[index % statuses.length]);
    insert.run(studentId, course.id, facultyId, dates[(index + 1) % dates.length], "present");
  });
}

function seedResults(studentId, facultyId, departmentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM results WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  const courseRows = db
    .prepare("SELECT id, code FROM courses WHERE semester = 5 AND department_id = ? ORDER BY id")
    .all(departmentId);
  const seed = [
    { code: "CSE501", examType: "Mid Semester", marks: 42, maxMarks: 50, grade: "A" },
    { code: "CSE502", examType: "Internal", marks: 38, maxMarks: 50, grade: "B+" },
    { code: "CSE503", examType: "Quiz", marks: 18, maxMarks: 20, grade: "A+" }
  ];

  const insert = db.prepare(
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
  );

  seed.forEach((result) => {
    const course = courseRows.find((row) => row.code === result.code);
    if (!course) {
      return;
    }
    insert.run(
      studentId,
      course.id,
      facultyId,
      result.examType,
      result.marks,
      result.maxMarks,
      result.grade,
      "Consistent academic performance."
    );
  });
}

function seedNotices(adminUserId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM notices").get();
  if (count.total > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO notices (title, content, posted_by, audience)
      VALUES (?, ?, ?, ?)
    `
  ).run(
    "Mid-Semester Review Meeting",
    "All CSE semester 5 students must attend the academic review meeting on March 30 at 11:00 AM in Seminar Hall 2.",
    adminUserId,
    "all"
  );
}

function seedAssignments(studentId, facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM assignments").get();
  if (count.total === 0) {
    const course = db.prepare("SELECT id FROM courses WHERE code = ?").get("CSE501");
    if (course) {
      db.prepare(
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
      ).run(
        course.id,
        facultyId,
        "Normalization Case Study",
        "Design a third-normal-form schema for the supplied admissions workflow and document your assumptions.",
        "2026-04-05T23:59:00",
        "/uploads/seed-assignment-brief.txt",
        "seed-assignment-brief.txt"
      );
    }
  }

  const assignment = db.prepare("SELECT id FROM assignments ORDER BY id LIMIT 1").get();
  const existingSubmission = db
    .prepare("SELECT id FROM submissions WHERE assignment_id = ? AND student_id = ?")
    .get(assignment ? assignment.id : 0, studentId);

  if (assignment && !existingSubmission) {
    db.prepare(
      `
        INSERT INTO submissions (
          assignment_id,
          student_id,
          notes,
          file_path,
          file_name,
          status
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `
    ).run(
      assignment.id,
      studentId,
      "Initial submission uploaded for review.",
      "/uploads/seed-submission-answer.txt",
      "seed-submission-answer.txt",
      "submitted"
    );
  }
}

function seedMaterials(facultyId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM materials").get();
  if (count.total > 0) {
    return;
  }

  const course = db.prepare("SELECT id FROM courses WHERE code = ?").get("CSE501");
  if (!course) {
    return;
  }

  db.prepare(
    `
      INSERT INTO materials (course_id, faculty_id, title, description, file_path, file_name)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(
    course.id,
    facultyId,
    "Database Revision Notes",
    "Concise notes covering ER modeling, normalization, indexing, and transactions.",
    "/uploads/seed-db-handbook.txt",
    "seed-db-handbook.txt"
  );
}

function seedOutingRequests(studentId) {
  const count = db.prepare("SELECT COUNT(*) AS total FROM outing_requests WHERE student_id = ?").get(studentId);
  if (count.total > 0) {
    return;
  }

  db.prepare(
    `
      INSERT INTO outing_requests (student_id, purpose, destination, outing_date, return_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `
  ).run(studentId, "Medical appointment", "City Health Centre", "2026-03-29", "2026-03-29", "pending");
}

async function initializeDatabase() {
  if (db.database) {
    return;
  }

  const SQL = await initSqlJs({
    locateFile: (file) => path.join(__dirname, "..", "..", "node_modules", "sql.js", "dist", file)
  });

  const existingBuffer =
    fs.existsSync(databasePath) && fs.statSync(databasePath).size > 0 ? fs.readFileSync(databasePath) : null;
  const database = existingBuffer ? new SQL.Database(existingBuffer) : new SQL.Database();

  db.attachDatabase(database);
  db.pragma("foreign_keys = ON");

  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
  ensureAcademicSchema();
  ensureAcademicSeedData();
  ensureSeedUsers();
  db.persistIfNeeded(true);
}

module.exports = {
  db,
  getUserAccountByEmail,
  getUserProfileById,
  getStudentProfileByUserId,
  getFacultyProfileByUserId,
  initializeDatabase
};
