const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const slugify = require("slugify");

/**
 * POST SERVICE
 * Mengelola operasi untuk Post (formerly News)
 */

/**
 * CREATE - Buat post baru
 */
const createPost = async (postData, authorId) => {
  // Validasi required fields
  if (!postData.title || !postData.content || !postData.categoryId) {
    throw new Error("Title, content, dan categoryId wajib diisi");
  }

  // Cek apakah slug sudah ada
  let slug = slugify(postData.title, { lower: true });
  const existing = await prisma.post.findUnique({ where: { slug } });

  if (existing) {
    // Jika slug sudah ada, tambahkan timestamp
    slug = `${slug}-${Date.now()}`;
  }

  // Format tags: comma-separated string
  const tags = postData.tags
    ? postData.tags
        .split(",")
        .map((t) => t.trim())
        .join(", ")
    : null;

  return await prisma.post.create({
    data: {
      title: postData.title,
      slug,
      content: postData.content,
      thumbnail: postData.thumbnail || null,
      metaTitle: postData.metaTitle || null,
      metaDescription: postData.metaDescription || null,
      tags,
      status: postData.status || "DRAFT",
      categoryId: postData.categoryId,
      authorId,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });
};

/**
 * GET ALL - Ambil semua post dengan pagination & filter
 */
const getAllPosts = async (page = 1, limit = 10, status = "PUBLISHED") => {
  const skip = (page - 1) * limit;

  const where = {};
  if (status) {
    where.status = status;
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.post.count({ where });

  return {
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * GET BY ID - Ambil post berdasarkan ID
 */
const getPostById = async (id) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  return post;
};

/**
 * GET BY SLUG - Ambil post berdasarkan slug
 */
const getPostBySlug = async (slug) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });

  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  return post;
};

/**
 * UPDATE - Edit post
 */
const updatePost = async (id, updateData) => {
  // Cek post ada
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  // Update slug jika title berubah
  let slug = post.slug;
  if (updateData.title && updateData.title !== post.title) {
    slug = slugify(updateData.title, { lower: true });

    // Cek slug baru sudah ada
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      slug = `${slug}-${Date.now()}`;
    }
  }

  // Format tags jika ada
  if (updateData.tags && typeof updateData.tags === "string") {
    updateData.tags = updateData.tags
      .split(",")
      .map((t) => t.trim())
      .join(", ");
  }

  return await prisma.post.update({
    where: { id },
    data: {
      title: updateData.title || undefined,
      slug: slug !== post.slug ? slug : undefined,
      content: updateData.content || undefined,
      thumbnail: updateData.thumbnail || undefined,
      metaTitle: updateData.metaTitle || undefined,
      metaDescription: updateData.metaDescription || undefined,
      tags: updateData.tags || undefined,
      status: updateData.status || undefined,
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true, email: true } },
    },
  });
};

/**
 * DELETE - Hapus post
 */
const deletePost = async (id) => {
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) {
    throw new Error("Post tidak ditemukan");
  }

  return await prisma.post.delete({ where: { id } });
};

/**
 * GET BY CATEGORY - Ambil post berdasarkan kategori
 */
const getPostsByCategory = async (categoryId, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: { categoryId, status: "PUBLISHED" },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.post.count({
    where: { categoryId, status: "PUBLISHED" },
  });

  return {
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * SEARCH - Cari post berdasarkan keyword
 */
const searchPosts = async (keyword, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const posts = await prisma.post.findMany({
    where: {
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
        { tags: { contains: keyword, mode: "insensitive" } },
      ],
      status: "PUBLISHED",
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    skip,
    take: parseInt(limit),
  });

  const total = await prisma.post.count({
    where: {
      OR: [
        { title: { contains: keyword, mode: "insensitive" } },
        { content: { contains: keyword, mode: "insensitive" } },
        { tags: { contains: keyword, mode: "insensitive" } },
      ],
      status: "PUBLISHED",
    },
  });

  return {
    data: posts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * INCREMENT VIEWS - Tambah jumlah views
 */
const incrementViews = async (id) => {
  return await prisma.post.update({
    where: { id },
    data: { views: { increment: 1 } },
  });
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePost,
  deletePost,
  getPostsByCategory,
  searchPosts,
  incrementViews,
};
