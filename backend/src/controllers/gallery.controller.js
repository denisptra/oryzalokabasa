const galleryService = require("../services/gallery.service");
const { recordLog } = require("../utils/logger");

/**
 * GALLERY CONTROLLER
 * Mengelola foto/gambar dari galeri website
 */

/**
 * CREATE GALLERY IMAGE - Admin tambah foto ke galeri
 * @route POST /api/gallery/upload
 * @access ADMIN & SUPER_ADMIN
 */
exports.uploadImage = async (req, res) => {
  try {
    const gallery = await galleryService.createGallery(req.body);

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
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL GALLERY IMAGES - Ambil semua foto
 * @route GET /api/gallery
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
 * GET GALLERY BY CATEGORY - Ambil foto berdasarkan kategori
 * @route GET /api/gallery/category/:categoryId
 * @access PUBLIC
 */
exports.getGalleryByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const gallery = await galleryService.getGalleryByCategory(
      req.params.categoryId,
      page,
      limit,
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
 * GET GALLERY BY EVENT DATE - Ambil foto berdasarkan tanggal event
 * @route GET /api/gallery/event/:eventDate
 * @access PUBLIC
 */
exports.getGalleryByEventDate = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const gallery = await galleryService.getGalleryByEventDate(
      req.params.eventDate,
      page,
      limit,
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
 * GET GALLERY BY ID - Ambil detail foto
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
 * UPDATE GALLERY - Edit foto info
 * @route PUT /api/gallery/update/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.updateGallery = async (req, res) => {
  try {
    const gallery = await galleryService.updateGallery(req.params.id, req.body);

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
 * GET GALLERY STATISTICS - Ambil statistik galeri
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
