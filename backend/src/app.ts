import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/auth.routes.js";
import budgetRoutes from "./routes/budget.routes.js";
import seserahanRoutes from "./routes/seserahan.routes.js";
import operasionalRoutes from "./routes/operasional.routes.js";
import kuaRoutes from "./routes/kua.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import { adminRoutes, publicSettingsRoutes } from "./routes/admin.routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { getShareLanding } from "./controllers/share.controller.js";
import { uploadRoot } from "./controllers/upload.controller.js";
import { apiLimiter } from "./middleware/rateLimit.middleware.js";
import { maintenanceGuard } from "./middleware/flags.middleware.js";
import { createInvitationSite } from "./middleware/invitationSite.js";
import { env, isProduction } from "./config/env.js";

export const app = express();

if (isProduction) app.set("trust proxy", 1);

const devOrigins = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];
const configuredOrigins = env.CORS_ORIGIN ? env.CORS_ORIGIN.split(",").map((s) => s.trim()) : [];
const allowedOrigins = Array.from(
  new Set([env.FRONTEND_URL, ...configuredOrigins, ...(isProduction ? [] : devOrigins)])
);

const isLocalhost = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

// Middleware
app.use(
  helmet({
    // Foto/musik hasil upload dimuat dari origin frontend yang berbeda.
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        (!isProduction && isLocalhost(origin))
      ) {
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
app.use("/api", apiLimiter);
app.use("/api", maintenanceGuard);

// Domain undangan (bila INVITATION_URL diisi) dipilih dari header Host; host lain lewat begitu saja.
app.use(createInvitationSite());

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
      invitation: "/api/invitation",
    },
    frontendApp: env.FRONTEND_URL,
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
      "/api/invitation/config",
      "/api/invitation/public/:slug",
      "/api/settings/public",
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
app.use("/api/admin", adminRoutes);
app.use("/api/settings", publicSettingsRoutes);

// File unggahan (foto/musik). Nama file acak sehingga aman di-cache lama.
app.use(
  "/uploads",
  express.static(uploadRoot, { index: false, dotfiles: "ignore", maxAge: "7d", immutable: true })
);

// Halaman share (Open Graph) untuk pratinjau tautan di WhatsApp/sosmed
app.get("/share/:slug", apiLimiter, getShareLanding);
app.get("/share/:slug/:guestKey", apiLimiter, getShareLanding);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint tidak ditemukan: ${req.method} ${req.originalUrl}`,
    hint: `Gunakan prefix /api untuk mengakses API backend atau buka ${env.FRONTEND_URL} untuk aplikasi frontend.`,
  });
});

// Error Handler
app.use(errorHandler);

export default app;
