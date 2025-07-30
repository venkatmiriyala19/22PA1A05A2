const app = require("./app");
const mongoose = require("mongoose");
const { log } = require("../../LoggingMiddleware/logger");

const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;

mongoose
  .connect(MONGO_URI)
  .then(async () => {
    await log({
      stack: "backend",
      level: "info",
      pkg: "db",
      message: "MongoDB connected successfully",
    });
    app.listen(PORT, async () => {
      await log({
        stack: "backend",
        level: "info",
        pkg: "route",
        message: `Server running on http://localhost:${PORT}`,
      });
    });
  })
  .catch(async (err) => {
    await log({
      stack: "backend",
      level: "fatal",
      pkg: "db",
      message: `MongoDB connection error: ${err.message}`,
    });
    process.exit(1);
  });
