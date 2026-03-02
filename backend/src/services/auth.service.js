const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/jwt");

/**
 * AUTH SERVICE
 * Mengelola operasi authentication: register, login, logout
 */

/**
 * REGISTER - Buat akun user baru
 * Default role: ADMIN
 * SUPER_ADMIN hanya bisa dibuat oleh SUPER_ADMIN melalui create user endpoint
 */
exports.registerUser = async (data) => {
  // 1. Cek apakah email sudah ada
  const existing = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existing) {
    const error = new Error(
      "Email sudah terdaftar. Gunakan email lain atau login dengan email ini.",
    );
    error.statusCode = 409;
    throw error;
  }

  // 2. Validasi password
  if (!data.password || data.password.length < 8) {
    const error = new Error("Password minimal 8 karakter");
    error.statusCode = 400;
    throw error;
  }

  // 3. Hash password sebelum simpan
  const hashedPassword = await hashPassword(data.password);

  // 4. Simpan ke database (default role: ADMIN)
  // CATATAN: Hanya SUPER_ADMIN bisa membuat user dengan role SUPER_ADMIN
  const userRole = data.role === "SUPER_ADMIN" ? "ADMIN" : data.role || "ADMIN";

  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: userRole,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  });
};

/**
 * LOGIN - Masuk dengan email dan password
 */
exports.loginUser = async (email, password) => {
  // 1. Cari user berdasarkan email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  // PERBAIKAN: Jika user TIDAK ditemukan, kirim error 401
  if (!user) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // 2. Bandingkan password
  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error("Email atau password salah");
    error.statusCode = 401; // Unauthorized
    throw error;
  }

  // 3. Generate JWT Token
  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

/**
 * LOGOUT - Logout user
 * Operasi logout dihandle di client dengan menghapus token
 * Di server, kita hanya catat log activity
 */
exports.logoutUser = () => {
  return { message: "Logout berhasil" };
};
