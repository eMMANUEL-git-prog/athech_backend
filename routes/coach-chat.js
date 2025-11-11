import express from "express";
import pool from "../config/db.js"; // your db.js

const router = express.Router();

// Make sure Express parses JSON
// app.use(express.json()) must be in server.js

// POST /coach-chat
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "userId and message required" });
    }

    // For demo: store messages in memory or DB
    // Here we'll just echo the message as AI reply
    const aiReply = `Coach reply to: "${message}"`;

    // Optional: save chat in DB if you want
    /*
    await pool.query(
      "INSERT INTO coach_chats (athlete_id, message, role) VALUES ($1, $2, $3)",
      [userId, message, "user"]
    );
    await pool.query(
      "INSERT INTO coach_chats (athlete_id, message, role) VALUES ($1, $2, $3)",
      [userId, aiReply, "coach"]
    );
    */

    res.json({ reply: aiReply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
