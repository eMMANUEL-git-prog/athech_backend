import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

// GET /alerts/recent
// router.get("/recent", protect, async (req, res) => {
//   try {
//     const result = await pool.query(
//       "SELECT id, title, body, created_at FROM alerts ORDER BY created_at DESC LIMIT 5"
//     );
//     res.json(result.rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

router.use(protect);

// GET /api/alerts/recent
router.get("/recent", (req, res) => {
  // Replace with DB queries filtered by user or global alerts
  res.json([
    {
      id: "1",
      title: "Update Training Schedule",
      body: "Training session tomorrow moved to 6AM",
      created_at: new Date().toISOString(),
    },
  ]);
});

export default router;
