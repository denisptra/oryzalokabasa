const express = require("express");
const router = express.Router();
const diagnostikController = require("../controllers/diagnostik.controller");

/**
 * DIAGNOSTIK ROUTES - Check system status
 */
router.get("/sidebar-stats", diagnostikController.getSidebarStats);
router.get("/status", diagnostikController.getDiagnostik);

module.exports = router;
