const express = require("express");
const router = express.Router();
const heroSliderController = require("../controllers/hero-slider.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// PUBLIC ENDPOINTS

// GET /api/hero-slider - Ambil semua slider (admin view, include inactive)
router.get("/", heroSliderController.getAllSliders);

// GET /api/hero-slider/active - Ambil slider aktif saja (untuk website frontend)
router.get("/active", heroSliderController.getActiveSliders);

// GET /api/hero-slider/:id - Ambil detail slider
router.get("/:id", heroSliderController.getSliderById);

// PROTECTED ENDPOINTS (ADMIN+)

// POST /api/hero-slider/create - Buat slider baru
router.post(
  "/create",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.createSlider,
);

// PUT /api/hero-slider/update/:id - Edit slider
router.put(
  "/update/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.updateSlider,
);

// PUT /api/hero-slider/toggle/:id - Aktifkan/nonaktifkan slider
router.put(
  "/toggle/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.toggleSliderStatus,
);

// PUT /api/hero-slider/reorder - Ubah urutan slider
router.put(
  "/reorder",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.reorderSliders,
);

// DELETE /api/hero-slider/delete/:id - Hapus slider
router.delete(
  "/delete/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.deleteSlider,
);

module.exports = router;
