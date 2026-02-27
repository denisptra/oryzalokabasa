const express = require("express");
const router = express.Router();
const contactController = require("../controllers/contact.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

// PUBLIC ENDPOINTS

// POST /api/contact/send - Pengunjung submit form kontak
router.post("/send", contactController.createMessage);

// PROTECTED ENDPOINTS (ADMIN+)

// GET /api/contact/messages - Admin lihat semua pesan dengan filter status
router.get(
  "/messages",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.getAllMessages,
);

// GET /api/contact/stats - Admin lihat statistik pesan
router.get(
  "/stats",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.getStats,
);

// GET /api/contact/:id - Admin lihat detail pesan
router.get(
  "/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.getMessageById,
);

// PUT /api/contact/mark-read/:id - Admin tandai pesan sudah dibaca
router.put(
  "/mark-read/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.markAsRead,
);

// PUT /api/contact/archive/:id - Admin arsip pesan
router.put(
  "/archive/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.markAsArchived,
);

// DELETE /api/contact/delete/:id - Super admin hapus pesan (SUPER_ADMIN ONLY)
router.delete(
  "/delete/:id",
  authenticate,
  authorize("ADMIN", "SUPER_ADMIN"),
  contactController.deleteMessage,
);

module.exports = router;
