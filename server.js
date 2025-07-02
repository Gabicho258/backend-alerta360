import mongoose from "mongoose";
import express from "express";
import cors from "cors";

import {
  UserRouter,
  ChatRouter,
  MessageRouter,
  IncidentRouter,
} from "./api/routes/index.js";

// Importar el servicio FCM para inicializarlo
import { fcmService } from "./api/services/index.js";

import "dotenv/config.js";

// Connect with Mongo DB atlas
const dbURI = process.env.DB_CONNECTION;

await mongoose
  .connect(dbURI)
  .then(() => console.log("🗄️  Database connected"))
  .catch((error) => console.error("❌ Database connection error:", error));

// Server creation
const app = express();

// Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "10mb" })); // Aumentar límite para evidencias
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Define routes
app.use("/api/v1", UserRouter);
app.use("/api/v1", ChatRouter);
app.use("/api/v1", MessageRouter);
app.use("/api/v1", IncidentRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    fcmInitialized: true,
  });
});

app.use("/", (req, res) => {
  res.send(`
    <h1>🚨 Alerta360 API RESTful</h1>
    <p>✅ Server is running</p>
    <p>🔥 FCM Service initialized</p>
    <p>📱 Ready to send push notifications</p>
    <p>⏰ ${new Date().toISOString()}</p>
  `);
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("💥 Server error:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Server initialization
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔥 FCM Service initialized and ready`);
  console.log(`📱 Push notifications enabled`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🔄 Shutting down gracefully...");
  mongoose.connection.close(() => {
    console.log("✅ Database connection closed");
    process.exit(0);
  });
});
