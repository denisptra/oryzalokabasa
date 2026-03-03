const express = require("express");
const router = express.Router();
const heroSliderController = require("../controllers/hero-slider.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadHeroSlider, setUploadType } = require("../middleware/upload");

// PUBLIC ENDPOINTS

// GET /api/hero-slider - Ambil semua slider (admin view, include inactive)
router.get("/hero-slider", heroSliderController.getAllSliders);

// GET /api/hero-slider/active - Ambil slider aktif saja (untuk website frontend)
router.get("/hero-slider/active", heroSliderController.getActiveSliders);

// GET /api/hero-slider/:id - Ambil detail slider
router.get("/hero-slider/:id", heroSliderController.getSliderById);

// PROTECTED ENDPOINTS (ADMIN+)

// POST /api/hero-slider/create - Buat slider baru (file upload)
router.post(
  "/hero-slider/create",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  setUploadType("hero-slider"),
  uploadHeroSlider.single("image"),
  heroSliderController.createSlider
);

// PUT /api/hero-slider/update/:id - Edit slider (optional new file)
router.put(
  "/hero-slider/update/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  setUploadType("hero-slider"),
  uploadHeroSlider.single("image"),
  heroSliderController.updateSlider
);

// PUT /api/hero-slider/toggle/:id - Aktifkan/nonaktifkan slider
router.put(
  "/hero-slider/toggle/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.toggleSliderStatus
);

// PUT /api/hero-slider/reorder - Ubah urutan slider
router.put(
  "/hero-slider/reorder",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.reorderSliders
);

// DELETE /api/hero-slider/delete/:id - Hapus slider
router.delete(
  "/hero-slider/delete/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  heroSliderController.deleteSlider
);

module.exports = router;
