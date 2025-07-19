import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import { createServer } from "http";

import {
  UserRouter,
  ChatRouter,
  MessageRouter,
  IncidentRouter,
} from "./api/routes/index.js";

// Importar WebSocket manager
import wsManager from "./config/websocket.js";

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
const server = createServer(app);

// Inicializar WebSocket
wsManager.initialize(server);

// Middleware
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Middleware para logging básico
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Middleware para agregar wsManager a req (para uso en controladores si es necesario)
app.use((req, res, next) => {
  req.wsManager = wsManager;
  next();
});

// Define routes
app.use("/api/v1/user", UserRouter);
app.use("/api/v1/chat", ChatRouter);
app.use("/api/v1/message", MessageRouter);
app.use("/api/v1/incident", IncidentRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    fcmInitialized: true,
    websocketEnabled: true,
    connectedUsers: wsManager.getConnectedUsers().length,
  });
});

// WebSocket info endpoint
app.get("/ws-info", (req, res) => {
  res.status(200).json({
    connectedUsers: wsManager.getConnectedUsers().length,
    connectedUsersList: wsManager.getConnectedUsers(),
    websocketEnabled: true,
    endpoints: {
      websocket: `ws://localhost:${process.env.PORT || 5000}`,
      http: `http://localhost:${process.env.PORT || 5000}`,
    },
  });
});

app.use("/", (req, res) => {
  res.send(`
    <h1>🚨 Alerta360 API RESTful + WebSocket</h1>
    <p>✅ Server is running</p>
    <p>🔥 FCM Service initialized</p>
    <p>🔌 WebSocket enabled</p>
    <p>💬 Real-time chat ready</p>
    <p>👥 Connected users: ${wsManager.getConnectedUsers().length}</p>
    <p>⏰ ${new Date().toISOString()}</p>
    <hr>
    <h3>📡 WebSocket Events:</h3>
    <ul>
      <li><strong>authenticate</strong> - Autenticar usuario</li>
      <li><strong>join_chat</strong> - Unirse a un chat</li>
      <li><strong>leave_chat</strong> - Salir de un chat</li>
      <li><strong>send_message</strong> - Enviar mensaje</li>
      <li><strong>typing_start/stop</strong> - Indicador de escritura</li>
    </ul>
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
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔥 FCM Service initialized and ready`);
  console.log(`🔌 WebSocket enabled on port ${PORT}`);
  console.log(`💬 Real-time chat ready`);
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
