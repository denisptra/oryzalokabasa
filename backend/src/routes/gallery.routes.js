const express = require("express");
const router = express.Router();
const galleryController = require("../controllers/gallery.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { uploadGallery, setUploadType } = require("../middleware/upload");

// PUBLIC ENDPOINTS

// GET /api/galleris - Ambil semua foto
router.get("/galleris", galleryController.getAllGallery);

// GET /api/gallery/stats - Statistik galeri
router.get("/gallery/stats", galleryController.getGalleryStats);

// GET /api/gallery/category/:categoryId - Ambil foto by kategori
router.get(
  "/gallery/category/:categoryId",
  galleryController.getGalleryByCategory
);

// GET /api/gallery/event/:eventDate - Ambil foto by event date
router.get(
  "/gallery/event/:eventDate",
  galleryController.getGalleryByEventDate
);

// GET /api/gallery/:id - Ambil detail foto
router.get("/gallery/:id", galleryController.getGalleryById);

// PROTECTED ENDPOINTS (ADMIN+)

// POST /api/gallery/upload - Admin upload foto (file upload)
router.post(
  "/gallery/upload",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  setUploadType("gallery"),
  uploadGallery.single("image"),
  galleryController.uploadImage
);

// PUT /api/gallery/update/:id - Admin update foto
router.put(
  "/gallery/update/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  setUploadType("gallery"),
  uploadGallery.single("image"),
  galleryController.updateGallery
);

// DELETE /api/gallery/delete/:id - Admin hapus foto
router.delete(
  "/gallery/delete/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  galleryController.deleteGallery
);

module.exports = router;
