import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("athlete"));

// GET /api/athlete/stats
router.get("/stats", (req, res) => {
  // Replace with real DB queries
  res.json({
    upcomingEvents: 2,
    completedEvents: 5,
    nutritionLogs: 12,
    injuries: 1,
  });
});

export default router;
