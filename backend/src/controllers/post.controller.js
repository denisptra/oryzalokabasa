const postService = require("../services/post.service");
const { recordLog } = require("../utils/logger");

/**
 * CREATE POST - Buat postingan baru
 * @route POST /api/post/create
 * @access ADMIN & SUPER_ADMIN
 */
exports.createPost = async (req, res) => {
  try {
    const post = await postService.createPost(req.body, req.user.id);

    // Catat aktivitas membuat post
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
    const { page = 1, limit = 10, status = "PUBLISHED" } = req.query;
    const posts = await postService.getAllPosts(page, limit, status);

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
    const post = await postService.updatePost(req.params.id, req.body);

    // Catat aktivitas mengubah post
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

    await postService.deletePost(postId);

    // Catat aktivitas menghapus post
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
