const prisma = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// LOGIC REGISTER
exports.registerUser = async (data) => {
  // 1. Cek apakah email sudah terdaftar sebelumnya
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new Error("Email sudah digunakan, silakan gunakan email lain");
  }

  // 2. Hash password (Salt round 10 sudah cukup aman)
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // 3. Simpan ke database
  return await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role || "ADMIN", // Default ke ADMIN jika tidak diisi
    },
    // select digunakan agar password tidak ikut dikembalikan dalam objek 'user'
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
};

// LOGIC LOGIN
exports.loginUser = async (email, password) => {
  // 1. Cari usernya berdasarkan email
  const user = await prisma.user.findUnique({ where: { email } });

  // Keamanan: Jangan beri tahu spesifik apakah email atau password yang salah
  // Tapi untuk kemudahan dev, kita pakai pesan umum
  if (!user) {
    throw new Error("Kredensial yang Anda masukkan salah");
  }

  // 2. Bandingkan password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Kredensial yang Anda masukkan salah");
  }

  // 3. Buat Token (JWT)
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }, // Expired dalam 1 hari
  );

  return { user, token };
};

exports.logoutUser = async (userId) => {
  // Catat aktivitas logout ke dalam Log
  await prisma.log.create({
    data: {
      userId: userId,
      action: "LOGOUT",
      module: "AUTH",
      details: { message: "Admin logged out" },
    },
  });

  return true;
};
