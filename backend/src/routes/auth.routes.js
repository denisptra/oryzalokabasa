const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { validateRegister, validateLogin } = require("../middleware/validation");
const { loginLimiter } = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/auth");

/**
 * AUTH ROUTES
 * - REGISTER: Untuk sign up user baru
 * - LOGIN: Untuk sign in dengan email dan password
 * - LOGOUT: Untuk sign out (logout)
 */

// Public routes (Tidak perlu token)
router.post("/auth/register", validateRegister, authController.register);
router.post("/auth/login", loginLimiter, validateLogin, authController.login);

// Protected routes (Perlu token untuk akses)
router.post("/auth/logout", authenticate, authController.logout);

module.exports = router;
