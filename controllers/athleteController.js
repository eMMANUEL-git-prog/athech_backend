import pool from "../config/db.js";

// @desc Get athlete dashboard (profile + performances + injuries + nutrition logs)
// @route GET /api/athletes/dashboard
export const getAthleteDashboard = async (req, res) => {
  try {
    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can access their dashboard" });
    }

    // 1️⃣ Fetch athlete profile
    const athleteQuery = await pool.query(
      `SELECT id AS athlete_id, first_name, last_name, dob, gender, county, club,
              unique_athlete_id, photo_url, created_at, updated_at
       FROM athletes
       WHERE user_id = $1`,
      [req.user.id]
    );

    if (athleteQuery.rows.length === 0) {
      return res.status(404).json({ message: "Athlete profile not found" });
    }

    const athlete = athleteQuery.rows[0];

    // 2️⃣ Fetch performances
    const performancesQuery = await pool.query(
      `SELECT id AS performance_id, event, result, date, notes
       FROM performances
       WHERE athlete_id = $1
       ORDER BY date DESC`,
      [athlete.athlete_id]
    );

    // 3️⃣ Fetch injuries
    const injuriesQuery = await pool.query(
      `SELECT id AS injury_id, type, severity, reported_at, notes, resolution
       FROM injuries
       WHERE athlete_id = $1
       ORDER BY reported_at DESC`,
      [athlete.athlete_id]
    );

    // 4️⃣ Fetch nutrition logs
    const nutritionQuery = await pool.query(
      `SELECT id AS nutrition_id, date, meals, supplements
       FROM nutrition_logs
       WHERE athlete_id = $1
       ORDER BY date DESC`,
      [athlete.athlete_id]
    );

    // 5️⃣ Return combined dashboard
    res.json({
      athlete,
      performances: performancesQuery.rows,
      injuries: injuriesQuery.rows,
      nutrition_logs: nutritionQuery.rows,
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
