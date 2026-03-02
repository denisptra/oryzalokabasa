const authService = require("../services/auth.service");
const { recordLog } = require("../utils/logger");

/**
 * REGISTER - Membuat akun user baru
 * Setiap user baru default menjadi ADMIN
 * SUPER_ADMIN bisa change role melalui CRUD user
 */
exports.register = async (req, res) => {
  try {
    const user = await authService.registerUser(req.body);

    // Catat aktivitas register
    await recordLog(req, {
      action: "REGISTER",
      module: "AUTH",
      entityId: user.id,
      details: { email: user.email, role: user.role },
    });

    res.status(201).json({
      status: "success",
      message: "Registrasi berhasil. Silakan login.",
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
 * LOGIN - Masuk dengan email dan password
 * Return token JWT yang berlaku 1 hari
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);

    // Pasang user data sementara untuk logger
    req.user = { id: result.user.id };

    // Catat aktivitas login
    await recordLog(req, {
      action: "LOGIN",
      module: "AUTH",
      entityId: result.user.id,
      details: {
        email: result.user.email,
        role: result.user.role,
        login_at: new Date(),
      },
    });

    res.status(200).json({
      status: "success",
      message: "Login berhasil",
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    res.status(401).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * LOGOUT - Keluar dari akun
 * Token dihapus di client (local storage, session, cookie, dll)
 */
exports.logout = async (req, res) => {
  try {
    // request harus sudah authenticated lewat middleware
    if (req.user) {
      // Catat aktivitas logout
      await recordLog(req, {
        action: "LOGOUT",
        module: "AUTH",
        entityId: req.user.id,
        details: { logout_at: new Date() },
      });
    }

    res.status(200).json({
      status: "success",
      message: "Logout berhasil. Hapus token dari client Anda.",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
