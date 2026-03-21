const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const authRoutes    = require("./routes/auth.routes");
const patientRoutes = require("./routes/patient.routes");
const bedRoutes     = require("./routes/bed.routes");
const taskRoutes    = require("./routes/task.routes");

const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Hospital Workflow Tracker API is running",
  });
});

// All routes
app.use("/api/auth",     authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/beds",     bedRoutes);
app.use("/api/tasks",    taskRoutes);

// 404 handler — if no route matched, return a clean error
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

module.exports = app;
