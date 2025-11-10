import pool from "../config/db.js";

export const listInjuries = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        i.id,
        i.athlete_id,
        u.email AS athlete_email,
        a.first_name,
        a.last_name,
        i.type,
        i.severity,
        i.reported_at,
        i.notes
      FROM injuries i
      JOIN athletes a ON a.id = i.athlete_id
      JOIN users u ON u.id = a.user_id
      ORDER BY i.reported_at DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
