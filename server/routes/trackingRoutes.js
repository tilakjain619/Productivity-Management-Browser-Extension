const express = require("express");
const { trackWebsite, getDailyReport, deleteWebsiteRecord } = require("../controllers/trackingController");

const router = express.Router();

router.post("/track", trackWebsite);
router.get("/report/:userId", getDailyReport);
router.delete("/delete-record", deleteWebsiteRecord);

module.exports = router;