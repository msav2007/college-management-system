const express = require("express");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { getFacultyProfileByUserId } = require("../config/db");
const { assignStudentToFaculty, getStudentTimetable } = require("../services/studentFacultyService");

const router = express.Router();

router.use(authMiddleware);

router.post("/assign-student", roleMiddleware("admin", "faculty"), (req, res) => {
  const studentId = req.body.student_id || req.body.studentId;
  const requestedFacultyId = req.body.faculty_id || req.body.facultyId;

  if (!studentId) {
    return res.status(400).json({ message: "Student is required." });
  }

  try {
    let facultyId = requestedFacultyId;

    if (req.user.role === "faculty") {
      const faculty = getFacultyProfileByUserId(req.user.id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty profile not found." });
      }

      if (requestedFacultyId && Number(requestedFacultyId) !== faculty.id) {
        return res.status(403).json({ message: "Faculty can only assign students to themselves." });
      }

      facultyId = faculty.id;
    }

    if (!facultyId) {
      return res.status(400).json({ message: "Faculty is required." });
    }

    const assignment = assignStudentToFaculty({ studentId, facultyId });
    return res.json({
      message: "Student assigned successfully.",
      studentId: assignment.studentId,
      facultyId: assignment.facultyId
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/timetable/:studentId", roleMiddleware("admin", "faculty", "student"), (req, res) => {
  try {
    const studentId = Number(req.params.studentId);

    if (!studentId) {
      return res.status(400).json({ message: "Student is required." });
    }

    if (req.user.role === "student" && req.user.studentProfile?.id !== studentId) {
      return res.status(403).json({ message: "You can only view your own timetable." });
    }

    const timetableData = getStudentTimetable(studentId);

    if (req.user.role === "faculty") {
      const faculty = getFacultyProfileByUserId(req.user.id);
      if (!faculty) {
        return res.status(404).json({ message: "Faculty profile not found." });
      }

      if (timetableData.assignedFacultyId !== faculty.id) {
        return res.status(403).json({ message: "You can only view timetable data for your assigned students." });
      }
    }

    return res.json({
      timetable: timetableData.timetable,
      studentId: timetableData.student.id,
      facultyId: timetableData.assignedFacultyId,
      source: timetableData.source
    });
  } catch (error) {
    return res.status(error.status || 500).json({ message: error.message });
  }
});

module.exports = router;
