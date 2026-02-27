const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// PUBLIC ENDPOINTS

// GET /api/settings/key/:key - Ambil setting by key
router.get("/key/:key", settingsController.getSettingByKey);

// POST /api/settings/batch - Ambil multiple settings
router.post("/batch", settingsController.getMultipleSettings);

// GET /api/settings/summary - Ringkasan setting untuk frontend
router.get("/summary", settingsController.getSettingsSummary);

// PROTECTED ENDPOINTS (SUPER_ADMIN only)

// GET /api/settings - Ambil semua setting
router.get(
  "/",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.getAllSettings,
);

// POST /api/settings/save - Buat/update setting
router.post(
  "/save",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.saveSetting,
);

// DELETE /api/settings/delete/:key - Hapus setting
router.delete(
  "/delete/:key",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.deleteSetting,
);

// DELETE /api/settings/reset - Reset semua setting (CAUTION!)
router.delete(
  "/reset",
  authenticate,
  authorize("SUPER_ADMIN"),
  settingsController.resetAllSettings,
);

module.exports = router;
