const heroSliderService = require("../services/hero-slider.service");
const { recordLog } = require("../utils/logger");

/**
 * HERO SLIDER CONTROLLER
 * Mengelola banner/slider utama di halaman depan website
 */

/**
 * CREATE HERO SLIDER - Buat slider baru
 * @route POST /api/hero-slider/create
 * @access ADMIN & SUPER_ADMIN
 */
exports.createSlider = async (req, res) => {
  try {
    const slider = await heroSliderService.createSlider(req.body);

    await recordLog(req, {
      action: "CREATE",
      module: "HERO_SLIDER",
      entityId: slider.id,
      details: { title: slider.title, order: slider.order },
    });

    res.status(201).json({
      status: "success",
      message: "Slider berhasil dibuat",
      data: slider,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL SLIDERS - Ambil semua slider (sorted by order)
 * @route GET /api/hero-slider
 * @access PUBLIC
 */
exports.getAllSliders = async (req, res) => {
  try {
    const sliders = await heroSliderService.getAllSliders();

    res.status(200).json({
      status: "success",
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ACTIVE SLIDERS - Ambil slider yang aktif saja (untuk frontend)
 * @route GET /api/hero-slider/active
 * @access PUBLIC
 */
exports.getActiveSliders = async (req, res) => {
  try {
    const sliders = await heroSliderService.getActiveSliders();

    res.status(200).json({
      status: "success",
      data: sliders,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET SLIDER BY ID - Ambil detail slider
 * @route GET /api/hero-slider/:id
 * @access PUBLIC
 */
exports.getSliderById = async (req, res) => {
  try {
    const slider = await heroSliderService.getSliderById(req.params.id);

    res.status(200).json({
      status: "success",
      data: slider,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * UPDATE SLIDER - Edit slider info
 * @route PUT /api/hero-slider/update/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.updateSlider = async (req, res) => {
  try {
    const slider = await heroSliderService.updateSlider(
      req.params.id,
      req.body,
    );

    await recordLog(req, {
      action: "UPDATE",
      module: "HERO_SLIDER",
      entityId: slider.id,
      details: { title: slider.title, updated_fields: Object.keys(req.body) },
    });

    res.status(200).json({
      status: "success",
      message: "Slider berhasil diperbarui",
      data: slider,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * TOGGLE SLIDER STATUS - Aktifkan/nonaktifkan slider
 * @route PUT /api/hero-slider/toggle/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.toggleSliderStatus = async (req, res) => {
  try {
    const slider = await heroSliderService.toggleSliderStatus(req.params.id);

    await recordLog(req, {
      action: "UPDATE",
      module: "HERO_SLIDER",
      entityId: slider.id,
      details: { isActive: slider.isActive },
    });

    res.status(200).json({
      status: "success",
      message: `Slider ${slider.isActive ? "diaktifkan" : "dinonaktifkan"}`,
      data: slider,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * REORDER SLIDERS - Ubah urutan tampilan slider
 * @route PUT /api/hero-slider/reorder
 * @access ADMIN & SUPER_ADMIN
 */
exports.reorderSliders = async (req, res) => {
  try {
    const sliders = await heroSliderService.reorderSliders(req.body);

    await recordLog(req, {
      action: "UPDATE",
      module: "HERO_SLIDER",
      details: { action: "reorder", sliders_updated: sliders.length },
    });

    res.status(200).json({
      status: "success",
      message: "Urutan slider berhasil diperbarui",
      data: sliders,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE SLIDER - Hapus slider
 * @route DELETE /api/hero-slider/delete/:id
 * @access ADMIN & SUPER_ADMIN
 */
exports.deleteSlider = async (req, res) => {
  try {
    const sliderId = req.params.id;
    const slider = await heroSliderService.getSliderById(sliderId);

    await heroSliderService.deleteSlider(sliderId);

    await recordLog(req, {
      action: "DELETE",
      module: "HERO_SLIDER",
      entityId: sliderId,
      details: { deleted_title: slider.title },
    });

    res.status(200).json({
      status: "success",
      message: "Slider berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
