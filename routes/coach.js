// import express from "express";
// import { protect } from "../middlewares/authMiddleware.js";
// import { authorizeRoles } from "../middlewares/authorizeRoles.js";
// import {
//   getCoachStats,
//   getRecentAlerts,
// } from "../controllers/coachController.js";

// const router = express.Router();

// router.use(protect);
// router.use(authorizeRoles("coach"));

// router.get("/stats", getCoachStats);
// router.get("/alerts/recent", getRecentAlerts);

// export default router;

// routes/coach.js
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/stats", async (req, res) => {
  try {
    // Total athletes
    const athletesRes = await pool.query("SELECT COUNT(*) FROM athletes");
    const totalAthletes = parseInt(athletesRes.rows[0].count, 10);

    // Upcoming camps
    const upcomingRes = await pool.query(
      "SELECT COUNT(*) FROM camps WHERE accreditation_status='accredited'"
    );
    const upcomingCamps = parseInt(upcomingRes.rows[0].count, 10);

    // Completed camps (example: camps with date in the past, assuming you add a date column)
    // For now, we’ll treat all accredited as completed
    const completedCamps = upcomingCamps;

    // Events today (example: performances with today’s date)
    const todayRes = await pool.query(
      "SELECT COUNT(*) FROM performances WHERE date = CURRENT_DATE"
    );
    const eventsToday = parseInt(todayRes.rows[0].count, 10);

    res.json({ totalAthletes, upcomingCamps, completedCamps, eventsToday });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching stats" });
  }
});

export default router;
