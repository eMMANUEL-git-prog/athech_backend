import pool from "../config/db.js";

// GET /coach/stats
export const getCoachStats = async (req, res) => {
  try {
    const coachId = req.user.id;

    // Total athletes under this coach's camps
    const athletesResult = await pool.query(
      `SELECT COUNT(DISTINCT ac.athlete_id) AS total
       FROM athlete_camps ac
       JOIN camps c ON ac.camp_id = c.id
       WHERE c.created_by = $1`,
      [coachId]
    );

    // Upcoming camps
    const upcomingCampsResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM camps
       WHERE created_by = $1 AND created_at >= CURRENT_DATE`,
      [coachId]
    );

    // Completed camps
    const completedCampsResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM camps
       WHERE created_by = $1 AND created_at < CURRENT_DATE`,
      [coachId]
    );

    // Events today (performances of athletes today)
    const eventsTodayResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM performances p
       JOIN athletes a ON p.athlete_id = a.id
       JOIN athlete_camps ac ON a.id = ac.athlete_id
       JOIN camps c ON ac.camp_id = c.id
       WHERE c.created_by = $1 AND p.date = CURRENT_DATE`,
      [coachId]
    );

    res.json({
      totalAthletes: Number(athletesResult.rows[0].total),
      upcomingCamps: Number(upcomingCampsResult.rows[0].total),
      completedCamps: Number(completedCampsResult.rows[0].total),
      eventsToday: Number(eventsTodayResult.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching coach stats" });
  }
};

// GET /coach/alerts/recent
export const getRecentAlerts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, body, created_at
       FROM alerts
       WHERE audience = 'coach' OR audience IS NULL
       ORDER BY created_at DESC
       LIMIT 5`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching recent alerts" });
  }
};
