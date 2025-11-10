import pool from "../config/db.js";

// GET /api/admin/injuries
export const getAllInjuries = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT i.id, i.type, i.severity, i.reported_at, i.notes,
             a.id AS athlete_id, a.first_name, a.last_name, u.email AS athlete_email
      FROM injuries i
      LEFT JOIN athletes a ON i.athlete_id = a.id
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY i.reported_at DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching admin injuries:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc Report a new injury
// @route POST /api/injuries
export const createInjury = async (req, res) => {
  try {
    const { type, severity, notes, resolution } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can report injuries" });
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
      `INSERT INTO injuries (athlete_id, type, severity, notes, resolution)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [athlete_id, type, severity, notes, resolution || null]
    );

    res.status(201).json({ message: "Injury reported", injury: rows[0] });
  } catch (err) {
    console.error("Injury create error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Get all injuries for logged-in athlete
// @route GET /api/injuries
export const getInjuries = async (req, res) => {
  try {
    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can view injuries" });
    }

    const query = `
      SELECT 
        i.id AS injury_id,
        i.type,
        i.severity,
        i.reported_at,
        i.notes,
        i.resolution,
        a.id AS athlete_id,
        a.first_name,
        a.last_name,
        a.gender,
        a.county,
        a.club,
        a.unique_athlete_id
      FROM injuries i
      JOIN athletes a ON i.athlete_id = a.id
      WHERE a.user_id = $1
      ORDER BY i.reported_at DESC
    `;

    const { rows } = await pool.query(query, [req.user.id]);
    res.json({ injuries: rows });
  } catch (err) {
    console.error("Get injuries error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Update an injury
// @route PUT /api/injuries/:id
export const updateInjury = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, severity, notes, resolution } = req.body;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can update injuries" });
    }

    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );
    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    const updateQuery = `
      UPDATE injuries
      SET type = COALESCE($1, type),
          severity = COALESCE($2, severity),
          notes = COALESCE($3, notes),
          resolution = COALESCE($4, resolution)
      WHERE id = $5 AND athlete_id = $6
      RETURNING *;
    `;

    const { rows } = await pool.query(updateQuery, [
      type,
      severity,
      notes,
      resolution,
      id,
      athlete_id,
    ]);

    if (!rows.length)
      return res
        .status(404)
        .json({ message: "Injury not found or not owned by athlete" });

    res.json({ message: "Injury updated", injury: rows[0] });
  } catch (err) {
    console.error("Update injury error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

// @desc Delete an injury
// @route DELETE /api/injuries/:id
export const deleteInjury = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "athlete") {
      return res
        .status(403)
        .json({ message: "Only athletes can delete injuries" });
    }

    const athleteQuery = await pool.query(
      "SELECT id FROM athletes WHERE user_id = $1",
      [req.user.id]
    );
    if (!athleteQuery.rows.length)
      return res.status(404).json({ message: "Athlete profile not found" });

    const athlete_id = athleteQuery.rows[0].id;

    const { rowCount } = await pool.query(
      "DELETE FROM injuries WHERE id = $1 AND athlete_id = $2",
      [id, athlete_id]
    );

    if (!rowCount)
      return res
        .status(404)
        .json({ message: "Injury not found or not owned by athlete" });

    res.json({ message: "Injury deleted successfully" });
  } catch (err) {
    console.error("Delete injury error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
