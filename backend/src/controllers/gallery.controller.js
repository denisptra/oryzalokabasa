const galleryService = require("../services/gallery.service");
const { recordLog } = require("../utils/logger");
const path = require("path");
const fs = require("fs");

/**
 * GALLERY CONTROLLER
 * Mengelola foto/gambar dari galeri website
 */

/**
 * CREATE GALLERY IMAGE - Admin upload foto ke galeri
 * @route POST /api/gallery/upload
 * @access ADMIN & SUPER_ADMIN
 */
exports.uploadImage = async (req, res) => {
  try {
    // Get image path from uploaded file
    let imagePath = "";
    if (req.file) {
      imagePath = `/uploads/gallery/${req.file.filename}`;
    } else if (req.body.image) {
      imagePath = req.body.image;
    } else {
      return res.status(400).json({
        status: "error",
        message: "File gambar harus diupload",
      });
    }

    const data = {
      title: req.body.title,
      image: imagePath,
      eventDate: req.body.eventDate ? new Date(req.body.eventDate) : null,
      categoryId: req.body.categoryId,
    };

    const gallery = await galleryService.createGallery(data);

    await recordLog(req, {
      action: "CREATE",
      module: "GALLERY",
      entityId: gallery.id,
      details: { title: gallery.title, image: gallery.image },
    });

    res.status(201).json({
      status: "success",
      message: "Foto berhasil ditambahkan ke galeri",
      data: gallery,
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/gallery", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL GALLERY IMAGES - Ambil semua foto
 * @route GET /api/galleris
 * @access PUBLIC
 */
exports.getAllGallery = async (req, res) => {
  try {
    const { page = 1, limit = 12, categoryId } = req.query;
    const gallery = await galleryService.getAllGallery(page, limit, categoryId);

    res.status(200).json({
      status: "success",
      data: gallery.data,
      pagination: gallery.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET GALLERY BY CATEGORY
 * @route GET /api/gallery/category/:categoryId
 * @access PUBLIC
 */
exports.getGalleryByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const gallery = await galleryService.getGalleryByCategory(
      req.params.categoryId,
      page,
      limit
    );

    res.status(200).json({
      status: "success",
      data: gallery.data,
      pagination: gallery.pagination,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET GALLERY BY EVENT DATE
 * @route GET /api/gallery/event/:eventDate
 * @access PUBLIC
 */
exports.getGalleryByEventDate = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const gallery = await galleryService.getGalleryByEventDate(
      req.params.eventDate,
      page,
      limit
    );

    res.status(200).json({
      status: "success",
      data: gallery.data,
      pagination: gallery.pagination,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET GALLERY BY ID
 * @route GET /api/gallery/:id
 * @access PUBLIC
 */
exports.getGalleryById = async (req, res) => {
  try {
    const gallery = await galleryService.getGalleryById(req.params.id);

    res.status(200).json({
      status: "success",
      data: gallery,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * UPDATE GALLERY - Edit foto info + optional new file
 * @route PUT /api/gallery/update/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.updateGallery = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // If a new file was uploaded, update the image path
    if (req.file) {
      updateData.image = `/uploads/gallery/${req.file.filename}`;

      // Delete old image file if it's a local upload
      try {
        const old = await galleryService.getGalleryById(req.params.id);
        if (old.image && old.image.startsWith("/uploads/")) {
          const oldPath = path.join(__dirname, "../..", old.image);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      } catch (e) {
        console.log("Could not delete old image:", e.message);
      }
    }

    if (updateData.eventDate) {
      updateData.eventDate = new Date(updateData.eventDate);
    }

    const gallery = await galleryService.updateGallery(
      req.params.id,
      updateData
    );

    await recordLog(req, {
      action: "UPDATE",
      module: "GALLERY",
      entityId: gallery.id,
      details: { title: gallery.title, updated_fields: Object.keys(req.body) },
    });

    res.status(200).json({
      status: "success",
      message: "Foto berhasil diperbarui",
      data: gallery,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE GALLERY - Hapus foto dari galeri
 * @route DELETE /api/gallery/delete/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.deleteGallery = async (req, res) => {
  try {
    const galleryId = req.params.id;
    const gallery = await galleryService.getGalleryById(galleryId);

    // Delete image file if local
    if (gallery.image && gallery.image.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../..", gallery.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await galleryService.deleteGallery(galleryId);

    await recordLog(req, {
      action: "DELETE",
      module: "GALLERY",
      entityId: galleryId,
      details: { deleted_title: gallery.title },
    });

    res.status(200).json({
      status: "success",
      message: "Foto berhasil dihapus dari galeri",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET GALLERY STATISTICS
 * @route GET /api/gallery/stats
 * @access PUBLIC
 */
exports.getGalleryStats = async (req, res) => {
  try {
    const stats = await galleryService.getGalleryStats();

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
