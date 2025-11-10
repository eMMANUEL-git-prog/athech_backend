import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getAthleteDashboard } from "../controllers/athleteController.js";

const router = express.Router();

// Athlete-only dashboard
router.get(
  "/dashboard",
  protect,
  authorizeRoles("athlete"),
  getAthleteDashboard
);

export default router;
