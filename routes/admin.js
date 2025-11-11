// import express from "express";
// import pool from "../config/db.js";
// import { protect } from "../middlewares/authMiddleware.js";
// import { authorizeRoles } from "../middlewares/authorizeRoles.js";

// const router = express.Router();

// // Protect all admin routes
// router.use(protect);
// router.use(authorizeRoles("admin"));

// routes/admin.js
import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/stats", async (req, res) => {
  try {
    // Total users
    const usersRes = await pool.query("SELECT COUNT(*) FROM users");
    const totalUsers = parseInt(usersRes.rows[0].count, 10);

    // Users by role
    const adminsRes = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='admin'"
    );
    const totalAdmins = parseInt(adminsRes.rows[0].count, 10);

    const coachesRes = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='coach'"
    );
    const totalCoaches = parseInt(coachesRes.rows[0].count, 10);

    const athletesRes = await pool.query(
      "SELECT COUNT(*) FROM users WHERE role='athlete'"
    );
    const totalAthletes = parseInt(athletesRes.rows[0].count, 10);

    // Camps stats
    const campsRes = await pool.query("SELECT COUNT(*) FROM camps");
    const totalCamps = parseInt(campsRes.rows[0].count, 10);

    const accreditedRes = await pool.query(
      "SELECT COUNT(*) FROM camps WHERE accreditation_status='accredited'"
    );
    const accreditedCamps = parseInt(accreditedRes.rows[0].count, 10);

    const revokedRes = await pool.query(
      "SELECT COUNT(*) FROM camps WHERE accreditation_status='revoked'"
    );
    const revokedCamps = parseInt(revokedRes.rows[0].count, 10);

    res.json({
      totalUsers,
      totalAdmins,
      totalCoaches,
      totalAthletes,
      totalCamps,
      accreditedCamps,
      revokedCamps,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error fetching admin stats" });
  }
});

export default router;
