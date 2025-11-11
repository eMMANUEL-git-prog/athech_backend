import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";

const router = express.Router();

router.use(protect);
router.use(authorizeRoles("coach"));

// GET /api/coach/stats
router.get("/stats", (req, res) => {
  // Replace with real DB queries
  res.json({
    totalAthletes: 20,
    upcomingCamps: 3,
    completedCamps: 5,
    eventsToday: 2,
  });
});

export default router;
