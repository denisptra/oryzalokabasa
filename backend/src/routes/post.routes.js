const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");
const { authenticate } = require("../middleware/auth.js");
const { authorize } = require("../middleware/role.js");
const { uploadPost, setUploadType } = require("../middleware/upload");

/**
 * POST ROUTES
 */

// --- PUBLIC ROUTES ---
router.get("/posts", postController.getAllPosts);
router.get("/post/:id", postController.getPostById);
router.get("/post/slug/:slug", postController.getPostBySlug);
router.get("/posts/category/:categoryId", postController.getPostsByCategory);
router.get("/posts/search/:keyword", postController.searchPosts);

// --- PROTECTED ROUTES ---

// Create post (with thumbnail upload)
router.post(
  "/post/create",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  setUploadType("posts"),
  uploadPost.single("thumbnailFile"),
  postController.createPost
);

// Update post (with optional thumbnail upload)
router.put(
  "/post/update/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  setUploadType("posts"),
  uploadPost.single("thumbnailFile"),
  postController.updatePost
);

// Delete post
router.delete(
  "/post/delete/:id",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  postController.deletePost
);

module.exports = router;
