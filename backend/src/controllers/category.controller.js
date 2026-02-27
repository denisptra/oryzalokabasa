const categoryService = require("../services/category.service");
const { recordLog } = require("../utils/logger");

/**
 * CREATE - Tambah kategori baru
 */
exports.addCategory = async (req, res) => {
  try {
    const category = await categoryService.createCategory(req.body.name);

    // Catat aktivitas membuat kategori
    await recordLog(req, {
      action: "CREATE",
      module: "CATEGORY",
      entityId: category.id,
      details: { name: category.name },
    });

    res.status(201).json({
      status: "success",
      message: "Kategori berhasil dibuat",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * READ ALL - Ambil semua kategori
 */
exports.getCategories = async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * READ BY ID - Ambil kategori berdasarkan ID
 */
exports.getCategoryById = async (req, res) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);
    res.status(200).json({
      status: "success",
      data: category,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * UPDATE - Ubah nama kategori
 */
exports.updateCategory = async (req, res) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body.name,
    );

    // Catat aktivitas mengubah kategori
    await recordLog(req, {
      action: "UPDATE",
      module: "CATEGORY",
      entityId: category.id,
      details: { old_name: req.body.old_name, new_name: category.name },
    });

    res.status(200).json({
      status: "success",
      message: "Kategori berhasil diubah",
      data: category,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE - Hapus kategori
 */
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const category = await categoryService.getCategoryById(categoryId);

    await categoryService.deleteCategory(categoryId);

    // Catat aktivitas menghapus kategori
    await recordLog(req, {
      action: "DELETE",
      module: "CATEGORY",
      entityId: categoryId,
      details: { deleted_name: category.name },
    });

    res.status(200).json({
      status: "success",
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
