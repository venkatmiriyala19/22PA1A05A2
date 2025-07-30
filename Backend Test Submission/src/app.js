const express = require("express");
const urlRoutes = require("./routes/urlRoutes");
const { log } = require("../../LoggingMiddleware/logger");

const app = express();

app.use(express.json());

app.use(async (req, res, next) => {
  await log({
    stack: "backend",
    level: "debug",
    pkg: "middleware",
    message: `Incoming request: ${req.method} ${req.originalUrl}`,
  });
  next();
});

app.use("/", urlRoutes);

module.exports = app;
