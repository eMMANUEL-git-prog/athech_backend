// server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import injuryRoutes from "./routes/injuryRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import athleteRoutes from "./routes/athleteRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminPerformanceRoutes from "./routes/adminPerformanceRoutes.js";
import adminInjuryRoutes from "./routes/adminInjuryRoutes.js";
import adminNutritionRoutes from "./routes/adminNutritionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminReportsRoutes from "./routes/adminReportsRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
// app.use(
//   cors({
//     origin: "http://localhost:3000", // your frontend URL
//     credentials: true,
//   })
// );
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("🏃 Athletics Backend API is running...");
});

// DB Test route
app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ connected: true, server_time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/performances", performanceRoutes);
app.use("/api/injuries", injuryRoutes);
app.use("/api/nutrition", nutritionRoutes);
app.use("/api/athletes", athleteRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/performances", adminPerformanceRoutes);
app.use("/api/admin/injuries", adminInjuryRoutes);
app.use("/api/admin/nutrition", adminNutritionRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/ai", aiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
