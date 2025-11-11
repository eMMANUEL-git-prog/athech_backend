import pool from "../config/db.js";

// GET /athlete/stats
export const getAthleteStats = async (req, res) => {
  try {
    const athleteId = req.user.id;

    // Upcoming events
    const upcomingEventsResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM performances
       WHERE athlete_id = $1 AND date >= CURRENT_DATE`,
      [athleteId]
    );

    // Completed events
    const completedEventsResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM performances
       WHERE athlete_id = $1 AND date < CURRENT_DATE`,
      [athleteId]
    );

    // Nutrition logs
    const nutritionLogsResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM nutrition_logs
       WHERE athlete_id = $1`,
      [athleteId]
    );

    // Injuries
    const injuriesResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM injuries
       WHERE athlete_id = $1`,
      [athleteId]
    );

    res.json({
      upcomingEvents: Number(upcomingEventsResult.rows[0].total),
      completedEvents: Number(completedEventsResult.rows[0].total),
      nutritionLogs: Number(nutritionLogsResult.rows[0].total),
      injuries: Number(injuriesResult.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching athlete stats" });
  }
};

// GET /athlete/alerts/recent
export const getRecentAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, body, created_at
       FROM alerts
       WHERE audience = 'athlete' OR audience IS NULL
       ORDER BY created_at DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching recent alerts" });
  }
};
