import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createPerformance,
  getPerformances,
  updatePerformance,
  deletePerformance,
} from "../controllers/performanceController.js";

const router = express.Router();

// Athlete-only routes
router.use(protect, authorizeRoles("athlete"));

// Create performance
router.post("/", createPerformance);

// Get athlete's own performances
router.get("/", getPerformances);

// Update performance
router.put("/:id", updatePerformance);

// Delete performance
router.delete("/:id", deletePerformance);

export default router;
