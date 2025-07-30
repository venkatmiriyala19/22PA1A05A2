const axios = require("axios");
require("dotenv").config();

const stacks = ["backend", "frontend"];
const levels = ["debug", "info", "warn", "error", "fatal"];
const backendPackages = [
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
  "handler",
  "repository",
  "route",
  "service",
];
const frontendPackages = ["api", "component", "hook", "page", "state", "style"];
const sharedPackages = ["auth", "config", "middleware", "utils"];

const LOG_API_URL = process.env.LOG_API_URL;

const AUTH_TOKEN = process.env.AUTH_TOKEN;

function isValidLogData(stack, level, pkg) {
  if (!stacks.includes(stack)) return false;
  if (!levels.includes(level)) return false;

  if (sharedPackages.includes(pkg)) return true;

  if (stack === "backend" && backendPackages.includes(pkg)) return true;
  if (stack === "frontend" && frontendPackages.includes(pkg)) return true;

  return false;
}

async function log({ stack, level, pkg, message }) {
  stack = stack.toLowerCase();
  level = level.toLowerCase();
  pkg = pkg.toLowerCase();

  if (!isValidLogData(stack, level, pkg)) {
    throw new Error("Invalid log data: check stack, level, or package values");
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const response = await axios.post(LOG_API_URL, payload, {
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Log submitted:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to submit log:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { log };
