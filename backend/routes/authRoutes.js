const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");
const { db, getUserAccountByEmail, getUserProfileById } = require("../config/db");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "college-management-secret";
const JWT_EXPIRES_IN = "8h";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRedirectPage(role) {
  return {
    admin: "dashboard.html",
    faculty: "dashboard.html",
    student: "dashboard.html"
  }[role];
}

function buildAuthPayload(user) {
  return {
    id: user.id,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
    departmentName: user.departmentName,
    studentProfile: user.studentProfile,
    facultyProfile: user.facultyProfile
  };
}

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  if (!emailPattern.test(String(email).trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const userAccount = getUserAccountByEmail(String(email).trim().toLowerCase());
  if (!userAccount) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const passwordMatches = bcrypt.compareSync(password, userAccount.password_hash);
  if (!passwordMatches) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const userProfile = getUserProfileById(userAccount.id);
  const token = jwt.sign({ userId: userAccount.id, role: userAccount.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  return res.json({
    message: "Login successful.",
    token,
    role: userAccount.role,
    redirectTo: getRedirectPage(userAccount.role),
    user: buildAuthPayload(userProfile)
  });
});

router.post("/forgot-password", (req, res) => {
  const { email } = req.body;

  if (!email || !emailPattern.test(String(email).trim())) {
    return res.status(400).json({ message: "Please provide a valid email address." });
  }

  const user = getUserAccountByEmail(String(email).trim().toLowerCase());
  if (!user) {
    return res.status(404).json({ message: "No account found for that email address." });
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString();

  db.prepare(
    `
      UPDATE users
      SET password_reset_token = ?, password_reset_expires_at = ?
      WHERE id = ?
    `
  ).run(resetToken, expiresAt, user.id);

  const resetLink = `http://localhost:3000/reset-password.html?token=${resetToken}`;
  console.log(`Password reset link for ${user.email}: ${resetLink}`);

  return res.json({
    message: "Reset link generated (demo mode)",
    resetLink
  });
});

router.post("/reset-password", (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({ message: "Token, password, and confirmation are required." });
  }

  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Password confirmation does not match." });
  }

  const user = db
    .prepare(
      `
        SELECT id, password_reset_expires_at
        FROM users
        WHERE password_reset_token = ?
      `
    )
    .get(token);

  if (!user) {
    return res.status(400).json({ message: "The reset token is invalid." });
  }

  if (!user.password_reset_expires_at || new Date(user.password_reset_expires_at) < new Date()) {
    return res.status(400).json({ message: "The reset token has expired." });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  db.prepare(
    `
      UPDATE users
      SET password_hash = ?, password_reset_token = NULL, password_reset_expires_at = NULL
      WHERE id = ?
    `
  ).run(passwordHash, user.id);

  return res.json({ message: "Password reset successfully." });
});

router.get("/me", authMiddleware, (req, res) => {
  return res.json({ user: buildAuthPayload(req.user) });
});

module.exports = router;
