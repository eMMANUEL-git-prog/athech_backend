import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { listInjuries } from "../controllers/adminInjuryController.js";

const router = express.Router();

// GET /api/admin/injuries → list all injuries
router.get("/", protect, authorizeRoles("admin"), listInjuries);

export default router;
