const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { authenticate } = require("../middleware/auth.js");
const { authorize } = require("../middleware/role.js");

/**
 * CATEGORY ROUTES
 *
 * GET /categories - PUBLIC (tanpa token)
 * GET /category/:id - PUBLIC (tanpa token)
 * POST /category/create - ADMIN & SUPER_ADMIN only
 * PUT /category/update/:id - ADMIN & SUPER_ADMIN only
 * DELETE /category/delete/:id - ADMIN & SUPER_ADMIN only
 */

// --- PUBLIC ROUTES (Tidak perlu token) ---
router.get("/categories", categoryController.getCategories);
router.get("/category/:id", categoryController.getCategoryById);

// --- PROTECTED ROUTES (Perlu token) ---
// Semua routes di bawah ini memerlukan authentication
router.use(authenticate);

// --- ADMIN & SUPER_ADMIN ONLY ---
router.post(
  "/category/create",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  categoryController.addCategory,
);

router.put(
  "/category/update/:id",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  categoryController.updateCategory,
);

router.delete(
  "/category/delete/:id",
  authorize(["ADMIN", "SUPER_ADMIN"]),
  categoryController.deleteCategory,
);

module.exports = router;
