const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const { initializeDatabase } = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const facultyRoutes = require("./routes/facultyRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const resultRoutes = require("./routes/resultRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const materialRoutes = require("./routes/materialRoutes");
const noticeRoutes = require("./routes/noticeRoutes");
const outingRoutes = require("./routes/outingRoutes");
const academicRoutes = require("./routes/academicRoutes");

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const frontendDir = path.join(__dirname, "..", "frontend");
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
);
app.use(cors({ origin: "*" }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(uploadsDir));
app.use(express.static(frontendDir));

app.use("/api", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/notices", noticeRoutes);
app.use("/api/outing", outingRoutes);
app.use("/api/academics", academicRoutes);

app.get("/", (_req, res) => {
  res.sendFile(path.join(frontendDir, "login.html"));
});

app.use("/api", (_req, res) => {
  res.status(404).json({ message: "API route not found." });
});

app.use((err, _req, res, _next) => {
  const status = err.status || 500;
  const message =
    status >= 500 ? "Something went wrong while processing your request." : err.message;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ message });
});

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`College Management System API running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start the College Management System server.", error);
  process.exit(1);
});
