import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getAnyAthleteDashboard } from "../controllers/adminController.js";

const router = express.Router();

// Admin Dashboard Route
router.get("/dashboard", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalAthletesResult = await pool.query(
      "SELECT COUNT(*) FROM athletes"
    );
    const totalCoachesResult = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role = 'coach'"
    );
    const totalPerformancesResult = await pool.query(
      "SELECT COUNT(*) FROM performances"
    );
    const totalInjuriesResult = await pool.query(
      "SELECT COUNT(*) FROM injuries"
    );

    const userGrowth = [
      { name: "Jan", users: 45 },
      { name: "Feb", users: 62 },
      { name: "Mar", users: 78 },
      { name: "Apr", users: 95 },
      { name: "May", users: 128 },
      { name: "Jun", users: 156 },
    ];

    const systemHealth = [
      { name: "Mon", uptime: 99.9 },
      { name: "Tue", uptime: 99.95 },
      { name: "Wed", uptime: 99.85 },
      { name: "Thu", uptime: 100 },
      { name: "Fri", uptime: 99.9 },
      { name: "Sat", uptime: 99.8 },
      { name: "Sun", uptime: 99.95 },
    ];

    const teams = [
      { name: "Eldoret Runners", teams: 8 },
      { name: "Kaptagat Speedsters", teams: 6 },
      { name: "Nairobi Track Club", teams: 5 },
      { name: "Kericho Champs", teams: 4 },
    ];

    res.json({
      totalAthletes: parseInt(totalAthletesResult.rows[0].count),
      totalCoaches: parseInt(totalCoachesResult.rows[0].count),
      totalPerformances: parseInt(totalPerformancesResult.rows[0].count),
      totalInjuries: parseInt(totalInjuriesResult.rows[0].count),
      userGrowth,
      systemHealth,
      teams,
    });
  } catch (err) {
    console.error("Dashboard Error:", err.message);
    res.status(500).json({ message: "Failed to fetch dashboard data" });
  }
});

/// =========================
// Get all users (admin only)
// =========================
router.get("/users", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.created_at,
        a.first_name,
        a.last_name
      FROM users u
      LEFT JOIN athletes a ON a.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// ===========================
// Delete a user by ID (admin)
// ===========================
router.delete(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  async (req, res) => {
    const { id } = req.params;
    try {
      // Prevent admin from deleting themselves
      if (id === req.user.id) {
        return res.status(400).json({ message: "You cannot delete yourself" });
      }

      // Delete user from users table
      await pool.query("DELETE FROM users WHERE id = $1", [id]);
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to delete user" });
    }
  }
);

// ===========================
// Update a user by ID (admin)
// ===========================
router.put("/users/:id", protect, authorizeRoles("admin"), async (req, res) => {
  const { id } = req.params;
  const { email, role } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET email = $1, role = $2 WHERE id = $3 RETURNING *",
      [email, role, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Admin/Coach: Get any athlete dashboard
router.get(
  "/athletes/:athlete_id/dashboard",
  protect,
  authorizeRoles("admin", "coach"),
  getAnyAthleteDashboard
);

export default router;
