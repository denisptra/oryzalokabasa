const userService = require("../services/user.service");
const { recordLog } = require("../utils/logger");

/**
 * CREATE - Tambah user baru (SUPER_ADMIN only)
 * @route POST /api/user/create
 * @access SUPER_ADMIN
 */
exports.createUser = async (req, res) => {
  try {
    const user = await userService.createUser(req.body);

    // Catat aktivitas admin membuat user baru
    await recordLog(req, {
      action: "CREATE",
      module: "USER",
      entityId: user.id,
      details: { created_user_email: user.email, role: user.role },
    });

    res.status(201).json({
      status: "success",
      message: "User berhasil dibuat",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * READ ALL - Ambil semua user (SUPER_ADMIN only)
 * @route GET /api/users
 * @access SUPER_ADMIN
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * READ BY ID - Ambil user berdasarkan ID (SUPER_ADMIN only)
 * @route GET /api/user/:id
 * @access SUPER_ADMIN
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await userService.getUserById(req.params.id);
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * UPDATE - Edit user (SUPER_ADMIN only)
 * @route PUT /api/user/update/:id
 * @access SUPER_ADMIN
 */
exports.updateUser = async (req, res) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);

    // Catat aktivitas mengubah user
    await recordLog(req, {
      action: "UPDATE",
      module: "USER",
      entityId: user.id,
      details: {
        updated_user_email: user.email,
        updated_fields: Object.keys(req.body),
      },
    });

    res.status(200).json({
      status: "success",
      message: "User berhasil diperbarui",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE - Hapus user (SUPER_ADMIN only)
 * @route DELETE /api/user/delete/:id
 * @access SUPER_ADMIN
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    await userService.deleteUser(userId);

    // Catat aktivitas menghapus user
    await recordLog(req, {
      action: "DELETE",
      module: "USER",
      entityId: userId,
      details: {
        deleted_user_email: user.email,
        deleted_user_role: user.role,
      },
    });

    res.status(200).json({
      status: "success",
      message: "User berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
