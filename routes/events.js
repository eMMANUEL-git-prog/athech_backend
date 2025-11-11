import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// Get event details by ID
router.get("/:eventId", async (req, res) => {
  const { eventId } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, name, fee_amount FROM events WHERE id = $1",
      [eventId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Event not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
