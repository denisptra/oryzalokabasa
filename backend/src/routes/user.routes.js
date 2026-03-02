const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.js");
const { authorize } = require("../middleware/role.js");

/**
 * CRUD USER - Hanya SUPER_ADMIN yang bisa akses
 * Mengapa hanya SUPER_ADMIN?
 * - Membuat user baru = privilege tinggi (bisa create fake account)
 * - Update user = bisa change role ke SUPER_ADMIN
 * - Delete user = bisa hapus data important
 */

// Proteksi: Authentikasi + Authorization SUPER_ADMIN only
router.post(
  "/user/create",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.createUser,
);

router.get(
  "/users",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.getAllUsers,
);

router.get(
  "/user/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.getUserById,
);

router.put(
  "/user/update/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.updateUser,
);

router.delete(
  "/user/delete/:id",
  authenticate,
  authorize("SUPER_ADMIN"),
  userController.deleteUser,
);

module.exports = router;
