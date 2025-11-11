// routes/coach-chat.js
import express from "express";
import pool from "../config/db.js"; // make sure path is correct

const router = express.Router();

// POST /coach-chat
router.post("/", async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res.status(400).json({ message: "Missing userId or message" });
    }

    // Optional: store user message in DB (for history)
    await pool.query(
      "INSERT INTO coach_chats (athlete_id, message, role) VALUES ($1, $2, 'user')",
      [userId, message]
    );

    // Simple AI reply logic (replace with OpenAI call if you want real AI)
    const reply = `Coach AI reply: I received your message "${message}"`;

    // Optional: store AI reply in DB
    await pool.query(
      "INSERT INTO coach_chats (athlete_id, message, role) VALUES ($1, $2, 'ai')",
      [userId, reply]
    );

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
