import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  createInjury,
  getInjuries,
  updateInjury,
  deleteInjury,
  getAllInjuries,
} from "../controllers/injuryController.js";

const router = express.Router();

// Athlete-only routes
router.use(protect, authorizeRoles("athlete"));

router.get("/", protect, authorizeRoles("admin"), getAllInjuries);

// Create injury
router.post("/", createInjury);

// Get athlete's own injuries
router.get("/", getInjuries);

// Update injury
router.put("/:id", updateInjury);

// Delete injury
router.delete("/:id", deleteInjury);

export default router;
