import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";
const router = express.Router();

router.use(protect);

// GET /api/alerts/recent
router.get("/recent", async (req, res) => {
  try {
    const role = req.user.role; // from auth middleware
    const result = await pool.query(
      `SELECT id, title, body, created_at
       FROM alerts
       WHERE audience = $1 OR audience IS NULL
       ORDER BY created_at DESC
       LIMIT 5`,
      [role]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching recent alerts" });
  }
});

export default router;
