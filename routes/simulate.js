import express from "express";
import pool from "../config/db.js";

const router = express.Router();

/* 🏃‍♂️ 1. Simulate new athlete performance */
router.post("/simulate-performance", async (req, res) => {
  try {
    const {
      athlete_id,
      event = "100m sprint",
      result = "10.42s",
      notes = "",
    } = req.body;

    const newPerf = await pool.query(
      `INSERT INTO performances (athlete_id, event, result, date, notes)
       VALUES ($1, $2, $3, CURRENT_DATE, $4)
       RETURNING *`,
      [athlete_id, event, result, notes]
    );

    req.app
      .get("io")
      ?.emit("dataUpdated", { table: "performances", athlete_id });
    res.json({ success: true, newPerf: newPerf.rows[0] });
  } catch (error) {
    console.error("Performance simulation error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* 🏥 2. Simulate injury report */
router.post("/simulate-injury", async (req, res) => {
  try {
    const {
      athlete_id,
      type = "Hamstring strain",
      severity = "medium",
      notes = "",
    } = req.body;

    const newInjury = await pool.query(
      `INSERT INTO injuries (athlete_id, type, severity, reported_at, notes)
       VALUES ($1, $2, $3, NOW(), $4)
       RETURNING *`,
      [athlete_id, type, severity, notes]
    );

    req.app.get("io")?.emit("dataUpdated", { table: "injuries", athlete_id });
    res.json({ success: true, newInjury: newInjury.rows[0] });
  } catch (error) {
    console.error("Injury simulation error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* 🏕️ 3. Simulate new camp */
router.post("/simulate-camp", async (req, res) => {
  try {
    const {
      name = `Training Camp ${Math.floor(Math.random() * 1000)}`,
      location = "Eldoret",
      coach_name = "Coach Kip",
      contact = "+254700000000",
      created_by = null,
    } = req.body;

    const newCamp = await pool.query(
      `INSERT INTO camps (name, location, coach_name, contact, accreditation_status, created_by)
       VALUES ($1, $2, $3, $4, 'pending', $5)
       RETURNING *`,
      [name, location, coach_name, contact, created_by]
    );

    req.app.get("io")?.emit("dataUpdated", { table: "camps" });
    res.json({ success: true, newCamp: newCamp.rows[0] });
  } catch (error) {
    console.error("Camp simulation error:", error);
    res.status(500).json({ error: error.message });
  }
});

/* 🔔 4. Simulate new alert */
router.post("/simulate-alert", async (req, res) => {
  try {
    const {
      title = "Training Update",
      body = "Tomorrow’s session will start at 6am.",
      audience = "athletes",
      channel = "app",
      created_by = null,
    } = req.body;

    const newAlert = await pool.query(
      `INSERT INTO alerts (title, body, audience, channel, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [title, body, audience, channel, created_by]
    );

    req.app.get("io")?.emit("dataUpdated", { table: "alerts" });
    res.json({ success: true, newAlert: newAlert.rows[0] });
  } catch (error) {
    console.error("Alert simulation error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
