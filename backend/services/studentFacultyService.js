const { db } = require("../config/db");

const timetableOrderClause = `
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
`;

function createHttpError(message, status) {
  return Object.assign(new Error(message), { status });
}

function parsePositiveId(value, fieldName) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw createHttpError(`${fieldName} is invalid.`, 400);
  }

  return parsed;
}

function getStudentById(studentId) {
  return db
    .prepare(
      `
        SELECT
          students.id,
          students.user_id,
          students.department_id,
          students.branch_id,
          students.semester,
          students.section,
          students.faculty_id,
          students.advisor_faculty_id,
          users.full_name,
          users.email
        FROM students
        JOIN users ON users.id = students.user_id
        WHERE students.id = ?
      `
    )
    .get(studentId);
}

function getFacultyById(facultyId) {
  return db
    .prepare(
      `
        SELECT faculty.id, faculty.user_id, users.full_name, users.email
        FROM faculty
        JOIN users ON users.id = faculty.user_id
        WHERE faculty.id = ?
      `
    )
    .get(facultyId);
}

function getAssignedFacultyId(student) {
  const resolvedFacultyId = Number(student?.faculty_id || student?.advisor_faculty_id || 0);
  return Number.isInteger(resolvedFacultyId) && resolvedFacultyId > 0 ? resolvedFacultyId : null;
}

function assignStudentToFaculty({ studentId, facultyId }) {
  const parsedStudentId = parsePositiveId(studentId, "Student");
  const parsedFacultyId = parsePositiveId(facultyId, "Faculty");

  const student = getStudentById(parsedStudentId);
  if (!student) {
    throw createHttpError("Student not found.", 404);
  }

  const faculty = getFacultyById(parsedFacultyId);
  if (!faculty) {
    throw createHttpError("Faculty not found.", 404);
  }

  db.prepare("UPDATE students SET faculty_id = ?, advisor_faculty_id = ? WHERE id = ?").run(
    parsedFacultyId,
    parsedFacultyId,
    parsedStudentId
  );

  return {
    studentId: parsedStudentId,
    facultyId: parsedFacultyId,
    student,
    faculty
  };
}

function getFacultyTimetable(facultyId) {
  return db
    .prepare(
      `
        SELECT
          timetable.id,
          timetable.day_of_week,
          timetable.start_time,
          timetable.end_time,
          timetable.room_no,
          timetable.faculty_id,
          courses.id AS course_id,
          courses.name AS course_name,
          courses.code AS course_code,
          departments.name AS department_name,
          branches.name AS branch_name,
          faculty_users.full_name AS faculty_name
        FROM timetable
        JOIN courses ON courses.id = timetable.course_id
        LEFT JOIN departments ON departments.id = timetable.department_id
        LEFT JOIN branches ON branches.id = courses.branch_id
        LEFT JOIN faculty ON faculty.id = timetable.faculty_id
        LEFT JOIN users faculty_users ON faculty_users.id = faculty.user_id
        WHERE timetable.faculty_id = ?
        ORDER BY ${timetableOrderClause}
      `
    )
    .all(facultyId);
}

function getCourseTrackTimetable(student) {
  return db
    .prepare(
      `
        SELECT
          timetable.id,
          timetable.day_of_week,
          timetable.start_time,
          timetable.end_time,
          timetable.room_no,
          timetable.faculty_id,
          courses.id AS course_id,
          courses.name AS course_name,
          courses.code AS course_code,
          departments.name AS department_name,
          branches.name AS branch_name,
          faculty_users.full_name AS faculty_name
        FROM timetable
        JOIN courses ON courses.id = timetable.course_id
        LEFT JOIN departments ON departments.id = timetable.department_id
        LEFT JOIN branches ON branches.id = courses.branch_id
        LEFT JOIN faculty ON faculty.id = timetable.faculty_id
        LEFT JOIN users faculty_users ON faculty_users.id = faculty.user_id
        WHERE timetable.department_id = ?
          AND COALESCE(courses.branch_id, ?) = ?
          AND courses.semester = ?
        ORDER BY ${timetableOrderClause}
      `
    )
    .all(student.department_id, student.branch_id || null, student.branch_id || null, student.semester);
}

function getStudentTimetable(studentId) {
  const parsedStudentId = parsePositiveId(studentId, "Student");
  const student = getStudentById(parsedStudentId);

  if (!student) {
    throw createHttpError("Student not found.", 404);
  }

  const assignedFacultyId = getAssignedFacultyId(student);
  if (assignedFacultyId) {
    const timetable = getFacultyTimetable(assignedFacultyId);
    if (timetable.length) {
      return {
        student,
        assignedFacultyId,
        timetable,
        source: "faculty"
      };
    }
  }

  return {
    student,
    assignedFacultyId,
    timetable: getCourseTrackTimetable(student),
    source: "course"
  };
}

module.exports = {
  assignStudentToFaculty,
  getAssignedFacultyId,
  getFacultyById,
  getStudentById,
  getStudentTimetable
};
