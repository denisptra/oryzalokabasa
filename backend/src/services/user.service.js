const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword } = require('../utils/jwt');

// Tambah User Baru oleh Admin
const createUser = async (userData) => {
    const existing = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existing) throw new Error('Email sudah terdaftar');

    const hashedPassword = await hashPassword(userData.password);
    return await prisma.user.create({
        data: {
            ...userData,
            password: hashedPassword
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
};

const getAllUsers = async () => {
    return await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
};

const getUserById = async (id) => {
    const user = await prisma.user.findUnique({
        where: { id },
        select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    if (!user) throw new Error('User tidak ditemukan');
    return user;
};

const updateUser = async (id, updateData) => {
    if (updateData.password) {
        updateData.password = await hashPassword(updateData.password);
    }
    return await prisma.user.update({
        where: { id },
        data: updateData,
        select: { id: true, name: true, email: true, role: true }
    });
};

const deleteUser = async (id) => {
    return await prisma.user.delete({ where: { id } });
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser };