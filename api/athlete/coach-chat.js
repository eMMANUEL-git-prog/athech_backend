// server/routes/athlete/coach-chat.js
import express from "express";
import { apiClient } from "@/lib/api-client"; // optional wrapper if needed
import OpenAI from "openai";

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Example: store recent messages in memory (replace with DB for persistence)
let chatHistory = {};

router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message)
    return res.status(400).json({ error: "Missing userId or message" });

  // fetch athlete data to give context
  const athleteData = await req.db.query(
    "SELECT first_name, last_name, performances, injuries, nutrition_logs FROM athletes WHERE user_id = $1",
    [userId]
  );

  const context = athleteData.rows[0] || {};

  // prepare messages for GPT
  const messages = [
    {
      role: "system",
      content: `You are a personal AI coach for an athlete. Use their performance, injury, and nutrition data to give tailored advice.`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // store in memory history (optional)
    if (!chatHistory[userId]) chatHistory[userId] = [];
    chatHistory[userId].push({ user: message, ai: reply });

    res.json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
