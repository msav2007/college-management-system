const jwt = require("jsonwebtoken");
const { getUserProfileById } = require("../config/db");

const JWT_SECRET = process.env.JWT_SECRET || "college-management-secret";

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = getUserProfileById(decoded.userId);

    if (!user) {
      return res.status(401).json({ message: "Your session is no longer valid." });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." });
  }
}

module.exports = authMiddleware;
