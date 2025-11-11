// server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import pool from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import performanceRoutes from "./routes/performanceRoutes.js";
import injuryRoutes from "./routes/injuryRoutes.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import adminPerformanceRoutes from "./routes/adminPerformanceRoutes.js";
import adminInjuryRoutes from "./routes/adminInjuryRoutes.js";
import adminNutritionRoutes from "./routes/adminNutritionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminReportsRoutes from "./routes/adminReportsRoutes.js";
import adminRouter from "./routes/admin.js";
import coachRouter from "./routes/coach.js";
import athleteRouter from "./routes/athlete.js";
import alertsRouter from "./routes/alerts.js";
import simulateRouter from "./routes/simulate.js";
import coachChatRouter from "./routes/coach-chat.js";

dotenv.config();

const app = express();
app.use(cookieParser());
const allowedOrigins = ["http://localhost:3000", "https://athech.vercel.app"];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`❌ Blocked by CORS: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

//Example: emit after performance added
app.post("/api/performances", async (req, res) => {
  const { athlete_id, result } = req.body;
  const newPerf = await pool.query(
    `INSERT INTO performances (athlete_id, result) VALUES ($1, $2) RETURNING *`,
    [athlete_id, result]
  );

  // Notify all dashboards
  io.emit("dataUpdated", { table: "performances", athlete_id });
  res.json(newPerf.rows[0]);
});

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
app.use("/api/admin", adminRoutes);
app.use("/api/admin/performances", adminPerformanceRoutes);
app.use("/api/admin/injuries", adminInjuryRoutes);
app.use("/api/admin/nutrition", adminNutritionRoutes);
app.use("/api/admin/reports", adminReportsRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/coach", coachRouter);
app.use("/api/athlete", athleteRouter);
app.use("/api/alerts", alertsRouter);
app.use("/api/ai", aiRoutes);
app.use("/api/test", simulateRouter);
app.use("/api/coach-chat", coachChatRouter);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // your frontend origin
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
