const express = require("express");
const cors = require("cors"); // <== import cors
const urlRoutes = require("./routes/urlRoutes");
const { log } = require("../../LoggingMiddleware/logger");

const app = express();

app.use(cors()); // <== enable CORS globally

app.use(express.json());

// Logging middleware
app.use(async (req, res, next) => {
  await log({
    stack: "backend",
    level: "debug",
    pkg: "middleware",
    message: `Incoming request: ${req.method} ${req.originalUrl}`,
  });
  next();
});

// Routes
app.use("/", urlRoutes);

module.exports = app;
