// import express from "express";
// import { protect } from "../middlewares/authMiddleware.js";
// import { authorizeRoles } from "../middlewares/authorizeRoles.js";
// import {
//   getAthleteStats,
//   getRecentAlerts,
// } from "../controllers/athleteController.js";

// const router = express.Router();

// router.use(protect);
// router.use(authorizeRoles("athlete"));

// router.get("/stats", getAthleteStats);
// router.get("/alerts/recent", getRecentAlerts);

// export default router;

import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(protect);

// GET /api/athlete/stats
router.get("/stats", async (req, res) => {
  try {
    const athleteId = req.user.id;

    // Upcoming events
    const upcomingEvents = await pool.query(
      `SELECT COUNT(*) AS total
       FROM performances
       WHERE athlete_id = $1
         AND date >= CURRENT_DATE`,
      [athleteId]
    );

    // Completed events
    const completedEvents = await pool.query(
      `SELECT COUNT(*) AS total
       FROM performances
       WHERE athlete_id = $1
         AND date < CURRENT_DATE`,
      [athleteId]
    );

    // Nutrition logs
    const nutritionLogs = await pool.query(
      `SELECT COUNT(*) AS total
       FROM nutrition_logs
       WHERE athlete_id = $1`,
      [athleteId]
    );

    // Injuries
    const injuries = await pool.query(
      `SELECT COUNT(*) AS total
       FROM injuries
       WHERE athlete_id = $1`,
      [athleteId]
    );

    res.json({
      upcomingEvents: Number(upcomingEvents.rows[0].total),
      completedEvents: Number(completedEvents.rows[0].total),
      nutritionLogs: Number(nutritionLogs.rows[0].total),
      injuries: Number(injuries.rows[0].total),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
