const authService = require("../services/auth.service");

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validasi dasar agar tidak ada data kosong masuk ke service
    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Email, password, dan nama wajib diisi",
      });
    }

    const user = await authService.registerUser(req.body);

    res.status(201).json({
      success: true,
      message: "Registrasi Admin berhasil",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password tidak boleh kosong",
      });
    }

    const { user, token } = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login Berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    // Gunakan 401 (Unauthorized) untuk kegagalan login
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    // 1. Ambil ID user dari middleware 'protect'
    const userId = req.user.id;

    // 2. Jalankan logic logout di service
    await authService.logoutUser(userId);

    // 3. Hapus Cookie Refresh Token di browser (jika ada)
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Berhasil Logout. Silakan hapus token di client side.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
