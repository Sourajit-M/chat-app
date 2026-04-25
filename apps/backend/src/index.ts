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

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: "10mb" })); // 10mb for base64 images
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});


app.use("/api/auth", authRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
// app.use("/api/ai", aiRoutes);

// Start server
const PORT = parseInt(env.PORT);

const start = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected");

    httpServer.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

start();

//httpServer is there because the Express app is only the request handler. Wrapping it with createServer(app) gives you the underlying Node HTTP server, which is needed if you want to attach socket.io, handle WebSockets, or manage server-level events like graceful shutdown later.