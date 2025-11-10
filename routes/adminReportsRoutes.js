// routes/adminReportsRoutes.js
import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getAdminReports } from "../controllers/adminReportController.js";

const router = express.Router();

// Only admins can access
router.get("/", protect, authorizeRoles("admin"), getAdminReports);

export default router;
