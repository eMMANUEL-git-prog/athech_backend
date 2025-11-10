import pool from "../config/db.js";

// @desc Get any athlete dashboard (admin/coach only)
// @route GET /api/admin/athletes/:athlete_id/dashboard
// controllers/adminController.js
export const getAnyAthleteDashboard = async (req, res) => {
  try {
    const { athlete_id } = req.params;

    // 1️⃣ Fetch athlete profile
    const athleteQuery = await pool.query(
      `SELECT id AS athlete_id, first_name, last_name, dob, gender, county, club,
              unique_athlete_id, photo_url, created_at
       FROM athletes
       WHERE id = $1`,
      [athlete_id]
    );

    if (!athleteQuery.rows.length) {
      return res.status(404).json({ message: "Athlete not found" });
    }

    const athlete = athleteQuery.rows[0];

    // 2️⃣ Fetch performances
    const performancesQuery = await pool.query(
      `SELECT id AS performance_id, event, result, date, notes
       FROM performances
       WHERE athlete_id = $1
       ORDER BY date DESC`,
      [athlete_id]
    );

    // 3️⃣ Fetch injuries
    const injuriesQuery = await pool.query(
      `SELECT id AS injury_id, type, severity, reported_at, notes, resolution
       FROM injuries
       WHERE athlete_id = $1
       ORDER BY reported_at DESC`,
      [athlete_id]
    );

    // 4️⃣ Fetch nutrition logs
    const nutritionQuery = await pool.query(
      `SELECT id AS nutrition_id, date, meals, supplements
       FROM nutrition_logs
       WHERE athlete_id = $1
       ORDER BY date DESC`,
      [athlete_id]
    );

    res.json({
      athlete,
      performances: performancesQuery.rows,
      injuries: injuriesQuery.rows,
      nutrition_logs: nutritionQuery.rows,
    });
  } catch (err) {
    console.error("Admin dashboard error:", err.message);
    res.status(500).json({ message: "Server error: " + err.message });
  }
};
