import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { listPerformances } from "../controllers/adminPerformanceController.js";

const router = express.Router();

// GET /api/admin/performances → list all performances
router.get("/", protect, authorizeRoles("admin"), listPerformances);

export default router;
