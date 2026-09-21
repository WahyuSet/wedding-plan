import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import seserahanRoutes from "./routes/seserahan.routes.js";
import operasionalRoutes from "./routes/operasional.routes.js";
import kuaRoutes from "./routes/kua.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";

dotenv.config();

export const app = express();
const defaultOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
const rawOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : defaultOrigins;
const allowedOrigins = Array.from(new Set([...rawOrigins, ...defaultOrigins]));

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Root Endpoint
app.get("/", (_req, res) => {
  res.json({
    status: "online",
    message: "💍 Wedding Planner Backend API Server is Running!",
    version: "1.0.0",
    docs: {
      healthCheck: "/api/health",
      auth: "/api/auth",
      budget: "/api/budget",
      seserahan: "/api/seserahan",
      operasional: "/api/operasional",
      kua: "/api/kua",
      dashboard: "/api/dashboard/summary",
    },
    frontendApp: "http://localhost:5173",
  });
});

app.get("/api", (_req, res) => {
  res.json({
    status: "ok",
    message: "Wedding Planner API Root",
    endpoints: [
      "/api/health",
      "/api/auth/register",
      "/api/auth/login",
      "/api/auth/logout",
      "/api/auth/me",
      "/api/auth/profile",
      "/api/budget",
      "/api/seserahan",
      "/api/seserahan/templates",
      "/api/operasional",
      "/api/kua",
      "/api/dashboard/summary",
    ],
  });
});

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Wedding Planner Backend API",
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/budget", budgetRoutes);
app.use("/api/seserahan", seserahanRoutes);
app.use("/api/operasional", operasionalRoutes);
app.use("/api/kua", kuaRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/invitation", invitationRoutes);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    hint: "Gunakan prefix /api untuk mengakses API backend atau buka http://localhost:5173 untuk aplikasi frontend.",
  });
});

// Error Handler
app.use(errorHandler);

export default app;
