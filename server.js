import mongoose from "mongoose";
import express from "express";
import cors from "cors";

import {
  UserRouter,
  ChatRouter,
  MessageRouter,
  IncidentRouter,
} from "./api/routes/index.js";

import "dotenv/config.js";

// Connect with Mongo DB atlas

const dbURI = process.env.DB_CONNECTION;

await mongoose
  .connect(dbURI)
  .then(() => console.log("Database connected"))
  .catch((error) => console.error(error));

// Server creation

const app = express();

// Middleware
// const corsOptions = {
//   origin: "https://eco-conciencia.netlify.app",
//   optionsSuccessStatus: 200,
//   methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   allowedHeaders: "Content-Type,Authorization",
// };
app.use(
  cors({
    origin: "*",
  })
);
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));
app.use(express.json());

// Define routes
app.use("/api/v1", UserRouter);
app.use("/api/v1", ChatRouter);
app.use("/api/v1", MessageRouter);
app.use("/api/v1", IncidentRouter);

app.use("/", (req, res) => {
  res.send("Alerta360 API RESTful is running");
});

// Server initialization

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
