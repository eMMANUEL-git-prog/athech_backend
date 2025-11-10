import pool from "../config/db.js";

// @desc Log a new nutrition entry
// @route POST /api/nutrition
export const createNutritionLog = async (req, res) => {
  try {
    const { date, meals, supplements } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can log nutrition" });
    }

    // Get athlete_id
    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );

    if (athleteQuery.rows.length === 0) {
      return res.status(404).json({ message: "Athlete profile not found" });
    }

    const athlete_id = athleteQuery.rows[0].id;

    const { rows } = await pool.query(
      `INSERT INTO nutrition_logs (athlete_id, date, meals, supplements)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [athlete_id, date || new Date(), meals || null, supplements || null]
    );

    res
      .status(201)
      .json({ message: "Nutrition log created", nutrition: rows[0] });
  } catch (err) {
    console.error("Nutrition log error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all nutrition logs for logged-in athlete
// @route GET /api/nutrition
export const getNutritionLogs = async (req, res) => {
  try {
    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can view nutrition logs" });
    }

    const query = `
      SELECT 
        n.id AS nutrition_id,
        n.date,
        n.meals,
        n.supplements,
        a.id AS athlete_id,
        a.first_name,
        a.last_name,
        a.gender,
        a.county,
        a.club,
        a.unique_athlete_id
      FROM nutrition_logs n
      JOIN athletes a ON n.athlete_id = a.id
      WHERE a.user_id = $1
      ORDER BY n.date DESC
    `;

    const { rows } = await pool.query(query, [req.user.id]);
    res.json({ nutrition_logs: rows });
  } catch (err) {
    console.error("Get nutrition logs error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Update a nutrition log
// @route PUT /api/nutrition/:id
export const updateNutritionLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, meals, supplements } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can update nutrition logs" });
    }

    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );
    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    const updateQuery = `
      UPDATE nutrition_logs
      SET date = COALESCE($1, date),
          meals = COALESCE($2, meals),
          supplements = COALESCE($3, supplements)
      WHERE id = $4 AND athlete_id = $5
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      date,
      meals,
      supplements,
      id,
      athlete_id,
    ]);

    if (!rows.length)
      return res
        .status(404)
        .json({ message: "Nutrition log not found or not owned by athlete" });

    res.json({ message: "Nutrition log updated", nutrition: rows[0] });
  } catch (err) {
    console.error("Update nutrition log error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete a nutrition log
// @route DELETE /api/nutrition/:id
export const deleteNutritionLog = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can delete nutrition logs" });
    }

    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );
    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    const { rowCount } = await pool.query(
      "DELETE FROM nutrition_logs WHERE id = $1 AND athlete_id = $2",
      [id, athlete_id]
    );

    if (!rowCount)
      return res
        .status(404)
        .json({ message: "Nutrition log not found or not owned by athlete" });

    res.json({ message: "Nutrition log deleted successfully" });
  } catch (err) {
    console.error("Delete nutrition log error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
