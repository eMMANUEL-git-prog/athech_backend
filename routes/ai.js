import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";
import OpenAI from "openai";

const router = express.Router();
router.use(protect);

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// GET /api/ai/coach-insights
router.get("/coach-insights", async (req, res) => {
  try {
    // 1. Fetch last 5 performances of all athletes for this coach
    const result = await pool.query(
      `
      SELECT a.first_name, a.last_name, p.event, p.result, p.date
      FROM performances p
      JOIN athletes a ON a.id = p.athlete_id
      JOIN athlete_camps ac ON ac.athlete_id = a.id
      JOIN camps c ON c.id = ac.camp_id
      WHERE c.coach_name = $1
      ORDER BY p.date DESC
      LIMIT 20
    `,
      [req.user.email]
    ); // assuming coach_name is the email or adjust as needed

    const performances = result.rows;

    if (performances.length === 0) {
      return res.json({ insights: ["No performance data available."] });
    }

    // 2. Create a prompt for the AI
    const prompt = `
You are an expert sports coach. Analyze the following athlete performance data and give concise recommendations per athlete:
${performances
  .map(
    (p) =>
      `- ${p.first_name} ${p.last_name}, Event: ${p.event}, Result: ${p.result}, Date: ${p.date}`
  )
  .join("\n")}
Provide 1-2 actionable insights per athlete.
`;

    // 3. Call OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const insights = response.choices[0].message.content
      .split("\n")
      .filter(Boolean);

    res.json({ insights });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
});

// GET /api/ai/admin-insights
router.get("/admin-insights", async (req, res) => {
  try {
    // only allow admins
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied" });
    }

    // Aggregate summary data from DB
    const [athletes, camps, injuries, performances] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM athletes`),
      pool.query(`SELECT COUNT(*) FROM camps`),
      pool.query(`SELECT COUNT(*) FROM injuries`),
      pool.query(`SELECT AVG(result) AS avg_performance FROM performances`),
    ]);

    const summary = `
System Overview:
- Total Athletes: ${athletes.rows[0].count}
- Total Camps: ${camps.rows[0].count}
- Reported Injuries: ${injuries.rows[0].count}
- Average Performance (last records): ${
      performances.rows[0].avg_performance || "N/A"
    }
`;

    const prompt = `
You are an AI analytics assistant for a national athletics management system.
Using the following system metrics, generate 4–5 concise insights for the admin.
Focus on:
- Detecting potential risks (e.g., high injury rates, underperformance)
- Highlighting opportunities (e.g., successful camps, top regions)
- Suggesting actions (policy, training, resource allocation)
- Predicting near-future trends (if possible)

Here’s the current data:
${summary}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
    });

    const insights = aiResponse.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim().length > 3);

    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI admin insight generation failed" });
  }
});

// GET /api/ai/athlete-insights
router.get("/athlete-insights", async (req, res) => {
  try {
    const athleteId = req.user.id;

    // Pull athlete’s recent activities
    const [performances, nutrition, injuries] = await Promise.all([
      pool.query(
        `SELECT event, result, date FROM performances
         WHERE athlete_id = $1 ORDER BY date DESC LIMIT 5`,
        [athleteId]
      ),
      pool.query(
        `SELECT date, meals, supplements FROM nutrition_logs
         WHERE athlete_id = $1 ORDER BY date DESC LIMIT 3`,
        [athleteId]
      ),
      pool.query(
        `SELECT type, severity, reported_at FROM injuries
         WHERE athlete_id = $1 ORDER BY reported_at DESC LIMIT 3`,
        [athleteId]
      ),
    ]);

    const summary = `
Recent Performance Data:
${
  performances.rows.length
    ? performances.rows
        .map(
          (p) =>
            `${p.event}: ${p.result} (${p.date.toISOString().split("T")[0]})`
        )
        .join("\n")
    : "No performance data"
}

Recent Nutrition Logs:
${
  nutrition.rows.length
    ? nutrition.rows
        .map(
          (n) =>
            `${n.date.toISOString().split("T")[0]} - Meals: ${JSON.stringify(
              n.meals
            )}`
        )
        .join("\n")
    : "No nutrition data"
}

Injuries:
${
  injuries.rows.length
    ? injuries.rows.map((i) => `${i.type} (${i.severity})`).join(", ")
    : "No injuries reported"
}
`;

    const prompt = `
You are an AI athletic coach.
Analyze the athlete's latest records and produce 3-5 short, personalized insights.
Focus on:
- Performance improvement
- Nutrition balance
- Injury risk prevention
- Motivation or next training steps

Here’s the athlete summary:
${summary}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const insights = aiResponse.choices[0].message.content
      .split("\n")
      .filter((line) => line.trim().length > 3);

    res.json({ insights });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "AI insight generation failed" });
  }
});

export default router;
