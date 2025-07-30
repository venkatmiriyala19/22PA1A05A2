const Url = require("../models/Url");
const generateCode = require("../utils/generateCode");
const geoip = require("geoip-lite");
const { log } = require("../../../LoggingMiddleware/logger");

exports.createShortUrl = async (req, res) => {
  const { url, validity = 30, shortcode } = req.body;

  if (!url) {
    await log({
      stack: "backend",
      level: "error",
      pkg: "controller",
      message: "Missing URL in request body",
    });
    return res.status(400).json({ error: "URL is required" });
  }

  let code = shortcode || generateCode();

  const exists = await Url.findOne({ shortcode: code });
  if (exists) {
    await log({
      stack: "backend",
      level: "warn",
      pkg: "controller",
      message: `Shortcode collision for '${code}'`,
    });
    return res.status(409).json({ error: "Shortcode already in use" });
  }

  const expiry = new Date(Date.now() + validity * 60000);

  try {
    const newUrl = await Url.create({
      originalUrl: url,
      shortcode: code,
      expiry,
    });

    await log({
      stack: "backend",
      level: "info",
      pkg: "controller",
      message: `Short URL '${code}' created successfully. Expires at ${expiry.toISOString()}`,
    });

    res.status(201).json({
      shortLink: `http://${req.headers.host}/${code}`,
      expiry: expiry.toISOString(),
    });
  } catch (err) {
    await log({
      stack: "backend",
      level: "fatal",
      pkg: "controller",
      message: `Failed to create short URL: ${err.message}`,
    });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.redirectToLongUrl = async (req, res) => {
  const { shortcode } = req.params;

  const record = await Url.findOne({ shortcode });

  if (!record) {
    await log({
      stack: "backend",
      level: "warn",
      pkg: "controller",
      message: `Redirection failed — shortcode '${shortcode}' not found`,
    });
    return res.status(404).json({ error: "Shortcode not found" });
  }

  if (new Date() > new Date(record.expiry)) {
    await log({
      stack: "backend",
      level: "warn",
      pkg: "controller",
      message: `Redirection failed — shortcode '${shortcode}' expired`,
    });
    return res.status(410).json({ error: "Link has expired" });
  }

  const ip = req.ip;
  const geo = geoip.lookup(ip);
  const referrer = req.get("Referrer") || "direct";

  record.clicks.push({
    referrer,
    location: geo?.country || "unknown",
  });
  record.clickCount += 1;
  await record.save();

  await log({
    stack: "backend",
    level: "info",
    pkg: "controller",
    message: `Redirected from '${shortcode}' to '${record.originalUrl}'`,
  });

  res.redirect(record.originalUrl);
};

exports.getStats = async (req, res) => {
  const { shortcode } = req.params;
  const record = await Url.findOne({ shortcode });

  if (!record) {
    await log({
      stack: "backend",
      level: "error",
      pkg: "controller",
      message: `Stats requested for non-existent shortcode '${shortcode}'`,
    });
    return res.status(404).json({ error: "Shortcode not found" });
  }

  await log({
    stack: "backend",
    level: "info",
    pkg: "controller",
    message: `Stats retrieved for shortcode '${shortcode}'`,
  });

  res.json({
    originalUrl: record.originalUrl,
    createdAt: record.createdAt,
    expiry: record.expiry,
    clickCount: record.clickCount,
    clicks: record.clicks,
  });
};
