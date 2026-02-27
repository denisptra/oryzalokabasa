const settingsService = require("../services/settings.service");
const { recordLog } = require("../utils/logger");

/**
 * SETTINGS CONTROLLER
 * Mengelola konfigurasi global website (key-value pairs)
 */

/**
 * CREATE/UPDATE SETTING - Buat atau update setting
 * @route POST /api/settings/save
 * @access SUPER_ADMIN only
 */
exports.saveSetting = async (req, res) => {
  try {
    const setting = await settingsService.saveSetting(req.body);

    await recordLog(req, {
      action: "CREATE/UPDATE",
      module: "SETTINGS",
      entityId: setting.id,
      details: { key: setting.key },
    });

    res.status(200).json({
      status: "success",
      message: "Setting berhasil disimpan",
      data: setting,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL SETTINGS - Ambil semua setting
 * @route GET /api/settings
 * @access SUPER_ADMIN only
 */
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await settingsService.getAllSettings();

    res.status(200).json({
      status: "success",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET SETTING BY KEY - Ambil setting berdasarkan key
 * @route GET /api/settings/:key
 * @access PUBLIC - tapi biasanya diakses dari frontend untuk config umum
 */
exports.getSettingByKey = async (req, res) => {
  try {
    const setting = await settingsService.getSettingByKey(req.params.key);

    res.status(200).json({
      status: "success",
      data: setting,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET MULTIPLE SETTINGS - Ambil beberapa setting by key
 * @route POST /api/settings/batch
 * @access PUBLIC
 * @body { keys: ["blog_title", "blog_desc", ...] }
 */
exports.getMultipleSettings = async (req, res) => {
  try {
    const { keys } = req.body;

    if (!keys || !Array.isArray(keys) || keys.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Field 'keys' harus berupa array minimal 1 item",
      });
    }

    const settings = await settingsService.getMultipleSettings(keys);

    res.status(200).json({
      status: "success",
      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE SETTING - Hapus setting
 * @route DELETE /api/settings/delete/:key
 * @access SUPER_ADMIN only
 */
exports.deleteSetting = async (req, res) => {
  try {
    const key = req.params.key;

    await settingsService.deleteSetting(key);

    await recordLog(req, {
      action: "DELETE",
      module: "SETTINGS",
      details: { deleted_key: key },
    });

    res.status(200).json({
      status: "success",
      message: "Setting berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * RESET ALL SETTINGS - Hapus semua setting (caution!)
 * @route DELETE /api/settings/reset
 * @access SUPER_ADMIN only
 */
exports.resetAllSettings = async (req, res) => {
  try {
    const count = await settingsService.resetAllSettings();

    await recordLog(req, {
      action: "DELETE",
      module: "SETTINGS",
      details: { action: "reset_all", deleted_count: count },
    });

    res.status(200).json({
      status: "success",
      message: `${count} setting berhasil dihapus`,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET SETTINGS SUMMARY - Ringkasan setting tertentu untuk frontend
 * @route GET /api/settings/summary
 * @access PUBLIC
 */
exports.getSettingsSummary = async (req, res) => {
  try {
    const summary = await settingsService.getSettingsSummary();

    res.status(200).json({
      status: "success",
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
