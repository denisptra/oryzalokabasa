const prisma = require('../config/db');
const bcrypt = require('bcrypt');

// Ambil semua user (Password di-exclude/dibuang)
const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });
};

// Update User (Ganti Role atau Password)
const updateUser = async (id, data, adminId) => {
  const updateData = { ...data };

  // Jika admin ganti password user lain, hash dulu
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData
  });

  // CATAT LOG AKTIVITAS
  await prisma.log.create({
    data: {
      userId: adminId,
      action: "UPDATE_USER",
      module: "USERS",
      entityId: id,
      details: { targetEmail: updated.email }
    }
  });

  return updated;
};

// Hapus User
const deleteUser = async (id, adminId) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new Error("User tidak ditemukan");

  await prisma.user.delete({ where: { id } });

  // CATAT LOG AKTIVITAS
  await prisma.log.create({
    data: {
      userId: adminId,
      action: "DELETE_USER",
      module: "USERS",
      entityId: id,
      details: { deletedEmail: user.email }
    }
  });

  return true;
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser
};