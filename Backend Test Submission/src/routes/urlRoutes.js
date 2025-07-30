const express = require("express");
const router = express.Router();
const {
  createShortUrl,
  redirectToLongUrl,
  getStats,
} = require("../controllers/urlController.js");

router.post("/shorturls", createShortUrl);
router.get("/shorturls/:shortcode", getStats);
router.get("/:shortcode", redirectToLongUrl);

module.exports = router;
