import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createNutritionLog,
  getNutritionLogs,
  updateNutritionLog,
  deleteNutritionLog,
} from "../controllers/nutritionController.js";

const router = express.Router();

// Athlete-only routes
router.use(protect, authorizeRoles("athlete"));

// Create nutrition log
router.post("/", createNutritionLog);

// Get athlete's own nutrition logs
router.get("/", getNutritionLogs);

// Update nutrition log
router.put("/:id", updateNutritionLog);

// Delete nutrition log
router.delete("/:id", deleteNutritionLog);

export default router;
