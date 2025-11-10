import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { listNutrition } from "../controllers/adminNutritionController.js";

const router = express.Router();

// GET /api/admin/nutrition → list all nutrition logs
router.get("/", protect, authorizeRoles("admin"), listNutrition);

export default router;
