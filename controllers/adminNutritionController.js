import pool from "../config/db.js";

export const listNutrition = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT 
        n.id,
        n.athlete_id,
        u.email AS athlete_email,
        a.first_name,
        a.last_name,
        n.date,
        n.meals,
        n.supplements
      FROM nutrition_logs n
      JOIN athletes a ON a.id = n.athlete_id
      JOIN users u ON u.id = a.user_id
      ORDER BY n.date DESC
    `);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
