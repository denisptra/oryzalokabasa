const express = require("express");
const router = express.Router();
const logController = require("../controllers/log.controller");
const { authenticate } = require("../middleware/auth.js");
const { authorize } = require("../middleware/role.js");

/**
 * LOG ROUTES - Audit trail for all activities
 * Hanya SUPER_ADMIN yang bisa melihat logs
 *
 * GET /api/logs - Lihat semua log (dengan filter module/action)
 * GET /api/log/:id - Lihat detail log berdasarkan id
 * GET /api/logs/user/:userId - Lihat semua log dari user tertentu
 */

// Semua routes di bawah memerlukan authentication dan SUPER_ADMIN role
router.use(authenticate, authorize("SUPER_ADMIN"));

// Get all logs dengan pagination dan filter
router.get("/logs", logController.getAllLogs);

// Get log by ID
router.get("/log/:id", logController.getLogById);

// Get logs by user
router.get("/logs/user/:userId", logController.getLogsByUser);

module.exports = router;
