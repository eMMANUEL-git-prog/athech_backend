import pool from "../config/db.js";

export const listPerformances = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        p.id,
        p.athlete_id,
        u.email AS athlete_email,
        a.first_name,
        a.last_name,
        p.event,
        p.result,
        p.date,
        p.notes
      FROM performances p
      JOIN athletes a ON a.id = p.athlete_id
      JOIN users u ON u.id = a.user_id
      ORDER BY p.date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
