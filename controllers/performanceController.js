import pool from "../config/db.js";

// @desc Create a new performance
// @route POST /api/performances
export const createPerformance = async (req, res) => {
  try {
    const { event, result, date, notes } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can create performances" });
    }

    // Get athlete_id from user_id
    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );

    if (athleteQuery.rows.length === 0) {
      return res.status(404).json({ message: "Athlete profile not found" });
    }

    const athlete_id = athleteQuery.rows[0].id;

    const { rows } = await pool.query(
      `INSERT INTO performances (athlete_id, event, result, date, notes)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [athlete_id, event, result, date, notes]
    );

    res
      .status(201)
      .json({ message: "Performance recorded", performance: rows[0] });
  } catch (err) {
    console.error("Performance create error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all performances for logged-in athlete
// @route GET /api/performances
export const getPerformances = async (req, res) => {
  try {
    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can view their performances" });
    }

    const query = `
      SELECT 
        p.id AS performance_id,
        p.event,
        p.result,
        p.date,
        p.notes,
        a.id AS athlete_id,
        a.first_name,
        a.last_name,
        a.gender,
        a.county,
        a.club,
        a.unique_athlete_id,
        a.photo_url
      FROM performances p
      JOIN athletes a ON p.athlete_id = a.id
      WHERE a.user_id = $1
      ORDER BY p.date DESC
    `;

    const { rows } = await pool.query(query, [req.user.id]);

    res.json({ performances: rows });
  } catch (err) {
    console.error("Performance get error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

export const updatePerformance = async (req, res) => {
  try {
    const { id } = req.params; // performance ID
    const { event, result, date, notes } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can update performances" });
    }

    // Get athlete_id from logged-in user
    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );

    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    // Update the performance
    const updateQuery = `
      UPDATE performances
      SET event = COALESCE($1, event),
          result = COALESCE($2, result),
          date = COALESCE($3, date),
          notes = COALESCE($4, notes)
      WHERE id = $5 AND athlete_id = $6
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      event,
      result,
      date,
      notes,
      id,
      athlete_id,
    ]);

    if (!rows.length)
      return res
        .status(404)
        .json({ message: "Performance not found or not owned by athlete" });

    res.json({ message: "Performance updated", performance: rows[0] });
  } catch (err) {
    console.error("Update performance error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete a performance
// @route DELETE /api/performances/:id
export const deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can delete performances" });
    }

    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );
    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    const { rowCount } = await pool.query(
      "DELETE FROM performances WHERE id = $1 AND athlete_id = $2",
      [id, athlete_id]
    );

    if (!rowCount)
      return res
        .status(404)
        .json({ message: "Performance not found or not owned by athlete" });

    res.json({ message: "Performance deleted successfully" });
  } catch (err) {
    console.error("Delete performance error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
