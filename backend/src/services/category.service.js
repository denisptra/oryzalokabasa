const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const slugify = require('slugify');

exports.createCategory = async (name) => {
    const existing = await prisma.category.findUnique({ where: { name } });
    if (existing) throw new Error('Nama kategori sudah digunakan');

    const slug = slugify(name, { lower: true });
    return await prisma.category.create({ data: { name, slug } });
};

exports.getAllCategories = async () => {
    return await prisma.category.findMany(); // Bisa diakses publik
};

exports.getCategoryById = async (id) => {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) throw new Error('Kategori tidak ditemukan');
    return category;
};

exports.updateCategory = async (id, name) => {
    const slug = slugify(name, { lower: true });
    return await prisma.category.update({
        where: { id },
        data: { name, slug }
    });
};

exports.deleteCategory = async (id) => {
    return await prisma.category.delete({ where: { id } });
};