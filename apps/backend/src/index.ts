import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { createServer } from "http";
import { env } from "./config/env";
import "./config/redis";
import { prisma } from "./config/prisma";
import authRoutes from "./auth/auth.routes"
import conversationRoutes from "./conversations/conversations.routes";
import messageRoutes from "./messages/messages.routes"
import { initSocket } from "./socket/socket.server";
import aiRoutes from "./ai/ai.routes";
import rateLimit from "express-rate-limit";
import { errorHandler } from "./middleware/error.middleware";
import { execSync } from "child_process";

const app = express();
const httpServer = createServer(app);

// ── Rate Limiters ──────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { message: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth routes
  message: { message: "Too many auth attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Gemini free tier is limited
  message: { message: "AI summary limit reached, please wait a moment" },
  standardHeaders: true,
  legacyHeaders: false,
});


// Middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      env.CLIENT_URL,
      "http://localhost:5173",
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" })); // Increased limit for base64 media uploads
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authLimiter,authRoutes);
app.use("/api/conversations", globalLimiter,conversationRoutes);
app.use("/api/messages", globalLimiter,messageRoutes);
app.use("/api/ai", aiLimiter,aiRoutes);

app.use(errorHandler)

// Start server
const PORT = parseInt(env.PORT);

const start = async () => {
  try {
    // Auto-run migrations on startup
    if (env.NODE_ENV === "production") {
      console.log("Running database migrations...");
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("Migrations complete");
    }


    await prisma.$connect();
    console.log("Database connected");

    await initSocket(httpServer);
    console.log("Socket initialized");

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();