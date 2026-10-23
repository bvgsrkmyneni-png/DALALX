
const pool = require("../config/db");

const requireAdmin = async (req, res, next) => {
  try {
    // authenticateToken must run before this middleware.
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required"
      });
    }

    // Check the latest role directly from PostgreSQL.
    const result = await pool.query(
      "SELECT role FROM users WHERE user_id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: "User not found"
      });
    }

    if (result.rows[0].role !== "ADMIN") {
      return res.status(403).json({
        message: "Access denied. Admin only."
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      message: "Server error"
    });
  }
};

module.exports = requireAdmin;
