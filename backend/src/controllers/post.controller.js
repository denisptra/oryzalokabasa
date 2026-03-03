const postService = require("../services/post.service");
const { recordLog } = require("../utils/logger");
const path = require("path");
const fs = require("fs");

/**
 * CREATE POST - Buat postingan baru
 * @route POST /api/post/create
 * @access ADMIN & SUPER_ADMIN
 */
exports.createPost = async (req, res) => {
  try {
    const data = { ...req.body };

    // Handle thumbnail file upload
    if (req.file) {
      data.thumbnail = `/uploads/posts/${req.file.filename}`;
    }

    const post = await postService.createPost(data, req.user.id);

    await recordLog(req, {
      action: "CREATE",
      module: "POST",
      entityId: post.id,
      details: { title: post.title, slug: post.slug, tags: post.tags },
    });

    res.status(201).json({
      status: "success",
      message: "Post berhasil dibuat",
      data: post,
    });
  } catch (error) {
    if (req.file) {
      const filePath = path.join(__dirname, "../../uploads/posts", req.file.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL POSTS - Ambil semua post
 * @route GET /api/posts
 * @access PUBLIC
 */
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, status = "PUBLISHED", categoryId, search } = req.query;
    const posts = await postService.getAllPosts(page, limit, status, categoryId, search);

    res.status(200).json({
      status: "success",
      data: posts.data,
      pagination: posts.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET POST BY ID - Ambil post berdasarkan ID
 * @route GET /api/post/:id
 * @access PUBLIC
 */
exports.getPostById = async (req, res) => {
  try {
    const post = await postService.getPostById(req.params.id);

    // Increment views
    await postService.incrementViews(req.params.id);

    res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET POST BY SLUG - Ambil post berdasarkan slug
 * @route GET /api/post/slug/:slug
 * @access PUBLIC
 */
exports.getPostBySlug = async (req, res) => {
  try {
    const post = await postService.getPostBySlug(req.params.slug);

    // Increment views
    await postService.incrementViews(post.id);

    res.status(200).json({
      status: "success",
      data: post,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * UPDATE POST - Edit post
 * @route PUT /api/post/update/:id
 * @access ADMIN & SUPER_ADMIN (Only own posts or SUPER_ADMIN)
 */
exports.updatePost = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle thumbnail file upload
    if (req.file) {
      updateData.thumbnail = `/uploads/posts/${req.file.filename}`;
      // Delete old thumbnail
      try {
        const old = await postService.getPostById(req.params.id);
        if (old.thumbnail && old.thumbnail.startsWith("/uploads/")) {
          const oldPath = path.join(__dirname, "../..", old.thumbnail);
          if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
      } catch (e) { console.log("Could not delete old thumbnail:", e.message); }
    }

    const post = await postService.updatePost(req.params.id, updateData);

    await recordLog(req, {
      action: "UPDATE",
      module: "POST",
      entityId: post.id,
      details: { title: post.title, updated_fields: Object.keys(req.body) },
    });

    res.status(200).json({
      status: "success",
      message: "Post berhasil diperbarui",
      data: post,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE POST - Hapus post
 * @route DELETE /api/post/delete/:id
 * @access ADMIN & SUPER_ADMIN (Only own posts or SUPER_ADMIN)
 */
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await postService.getPostById(postId);

    // Delete thumbnail file if local
    if (post.thumbnail && post.thumbnail.startsWith("/uploads/")) {
      const filePath = path.join(__dirname, "../..", post.thumbnail);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await postService.deletePost(postId);

    await recordLog(req, {
      action: "DELETE",
      module: "POST",
      entityId: postId,
      details: { deleted_title: post.title },
    });

    res.status(200).json({
      status: "success",
      message: "Post berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET POSTS BY CATEGORY - Ambil post berdasarkan kategori
 * @route GET /api/posts/category/:categoryId
 * @access PUBLIC
 */
exports.getPostsByCategory = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await postService.getPostsByCategory(
      req.params.categoryId,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      data: posts.data,
      pagination: posts.pagination,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * SEARCH POSTS - Cari post berdasarkan keyword
 * @route GET /api/posts/search/:keyword
 * @access PUBLIC
 */
exports.searchPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const posts = await postService.searchPosts(
      req.params.keyword,
      page,
      limit,
    );

    res.status(200).json({
      status: "success",
      data: posts.data,
      pagination: posts.pagination,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
