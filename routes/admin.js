import express from "express";
import pool from "../config/db.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

// GET /admin/stats
// router.get("/stats", protect, authorizeRoles("admin"), async (req, res) => {
//   try {
//     const usersRes = await pool.query(
//       "SELECT role, COUNT(*) FROM users GROUP BY role"
//     );
//     const campsRes = await pool.query(
//       "SELECT accreditation_status, COUNT(*) FROM camps GROUP BY accreditation_status"
//     );
//     const totalUsers = usersRes.rows.reduce(
//       (sum, r) => sum + parseInt(r.count),
//       0
//     );
//     const totalAdmins =
//       usersRes.rows.find((r) => r.role === "admin")?.count || 0;
//     const totalCoaches =
//       usersRes.rows.find((r) => r.role === "coach")?.count || 0;
//     const totalAthletes =
//       usersRes.rows.find((r) => r.role === "athlete")?.count || 0;

//     const totalCamps = campsRes.rows.reduce(
//       (sum, r) => sum + parseInt(r.count),
//       0
//     );
//     const accreditedCamps =
//       campsRes.rows.find((r) => r.accreditation_status === "accredited")
//         ?.count || 0;
//     const revokedCamps =
//       campsRes.rows.find((r) => r.accreditation_status === "revoked")?.count ||
//       0;

//     res.json({
//       totalUsers,
//       totalAdmins: parseInt(totalAdmins),
//       totalCoaches: parseInt(totalCoaches),
//       totalAthletes: parseInt(totalAthletes),
//       totalCamps,
//       accreditedCamps: parseInt(accreditedCamps),
//       revokedCamps: parseInt(revokedCamps),
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// Protect all admin routes
router.use(protect);
router.use(authorizeRoles("admin"));

// GET /api/admin/stats
router.get("/stats", (req, res) => {
  // Replace with real queries to your DB
  res.json({
    totalUsers: 120,
    totalCoaches: 15,
    totalAthletes: 105,
    activeCamps: 4,
  });
});

// GET /api/alerts/recent
router.get("/alerts/recent", (req, res) => {
  // Replace with real DB query
  res.json([
    {
      id: "1",
      title: "Server Maintenance",
      body: "Scheduled maintenance tomorrow 10AM-12PM",
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "New Camp Added",
      body: "Winter training camp added for December",
      created_at: new Date().toISOString(),
    },
  ]);
});

export default router;
