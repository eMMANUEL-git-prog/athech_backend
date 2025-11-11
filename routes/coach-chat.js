import express from "express";
import OpenAI from "openai";
import pool from "../config/db.js"; // your db.js

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Optional: in-memory chat history (can move to DB later)
let chatHistory = {};

router.post("/", async (req, res) => {
  const { userId, message } = req.body;
  if (!userId || !message)
    return res.status(400).json({ error: "Missing userId or message" });

  try {
    // Fetch athlete personal info
    const athleteRes = await pool.query(
      `SELECT id, first_name, last_name, dob, gender, county, club
       FROM athletes
       WHERE user_id = $1`,
      [userId]
    );
    const athlete = athleteRes.rows[0];

    // Fetch recent performances
    const perfRes = await pool.query(
      `SELECT event, result, date
       FROM performances
       WHERE athlete_id = $1
       ORDER BY date DESC
       LIMIT 5`,
      [athlete.id]
    );

    // Fetch recent injuries
    const injRes = await pool.query(
      `SELECT type, severity, reported_at
       FROM injuries
       WHERE athlete_id = $1
       ORDER BY reported_at DESC
       LIMIT 5`,
      [athlete.id]
    );

    // Fetch recent nutrition logs
    const nutritionRes = await pool.query(
      `SELECT date, meals, supplements
       FROM nutrition_logs
       WHERE athlete_id = $1
       ORDER BY date DESC
       LIMIT 5`,
      [athlete.id]
    );

    // Prepare context for GPT
    const context = `
Athlete Info:
Name: ${athlete.first_name} ${athlete.last_name}
DOB: ${athlete.dob}
Gender: ${athlete.gender}
County: ${athlete.county}
Club: ${athlete.club}

Recent Performances: ${JSON.stringify(perfRes.rows)}
Recent Injuries: ${JSON.stringify(injRes.rows)}
Recent Nutrition Logs: ${JSON.stringify(nutritionRes.rows)}
`;

    const messages = [
      {
        role: "system",
        content: `You are an AI coach for an athlete. Use their data below to provide personalized advice.\n${context}`,
      },
      {
        role: "user",
        content: message,
      },
    ];

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Store in memory history
    if (!chatHistory[userId]) chatHistory[userId] = [];
    chatHistory[userId].push({ user: message, ai: reply });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI request failed" });
  }
});

export default router;
