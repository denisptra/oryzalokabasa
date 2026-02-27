const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/gallery.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// PUBLIC ENDPOINTS

// GET /api/gallery - Ambil semua foto
router.get("/", galleryController.getAllGallery);

// GET /api/gallery/stats - Statistik galeri
router.get("/stats", galleryController.getGalleryStats);

// GET /api/gallery/category/:categoryId - Ambil foto by kategori
router.get("/category/:categoryId", galleryController.getGalleryByCategory);

// GET /api/gallery/event/:eventDate - Ambil foto by event date
router.get("/event/:eventDate", galleryController.getGalleryByEventDate);

// GET /api/gallery/:id - Ambil detail foto
router.get("/:id", galleryController.getGalleryById);

// PROTECTED ENDPOINTS (ADMIN+)

// POST /api/gallery/upload - Admin upload foto
router.post(
  "/upload",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  galleryController.uploadImage,
);

// PUT /api/gallery/update/:id - Admin edit foto info
router.put(
  "/update/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  galleryController.updateGallery,
);

// DELETE /api/gallery/delete/:id - Admin hapus foto
router.delete(
  "/delete/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  galleryController.deleteGallery,
);

module.exports = router;
