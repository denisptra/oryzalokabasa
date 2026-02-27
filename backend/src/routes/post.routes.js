const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { authenticate } = require("../middleware/auth.js");
const { authorize } = require("../middleware/role.js");

/**
 * POST ROUTES
 *
 * Menggantikan News routes - untuk manage blog posts/articles
 *
 * GET /api/posts - PUBLIC - List all posts (published)
 * GET /api/post/:id - PUBLIC - Get post by ID
 * GET /api/post/slug/:slug - PUBLIC - Get post by slug
 * GET /api/posts/category/:categoryId - PUBLIC - Get posts by category
 * GET /api/posts/search/:keyword - PUBLIC - Search posts
 * POST /api/post/create - ADMIN & SUPER_ADMIN - Create post
 * PUT /api/post/update/:id - ADMIN & SUPER_ADMIN - Update post
 * DELETE /api/post/delete/:id - ADMIN & SUPER_ADMIN - Delete post
 */

// --- PUBLIC ROUTES (Tidak perlu token) ---

// Get all posts dengan pagination & filter
router.get("/posts", postController.getAllPosts);

// Get post by ID
router.get("/post/:id", postController.getPostById);

// Get post by slug
router.get("/post/slug/:slug", postController.getPostBySlug);

// Get posts by category
router.get("/posts/category/:categoryId", postController.getPostsByCategory);

// Search posts
router.get("/posts/search/:keyword", postController.searchPosts);

// --- PROTECTED ROUTES (Perlu token) ---
// Semua routes di bawah ini memerlukan authentication
router.use(authenticate);

// --- ADMIN & SUPER_ADMIN ONLY ---

// Create post
router.post(
  "/post/create",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  postController.createPost,
);

// Update post
router.put(
  "/post/update/:id",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  postController.updatePost,
);

// Delete post
router.delete(
  "/post/delete/:id",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  postController.deletePost,
);

module.exports = router;
