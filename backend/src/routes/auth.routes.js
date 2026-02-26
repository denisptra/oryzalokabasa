const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

// URL: /api/v1/manage-oryza/auth/register
router.post("/auth/register", authController.register);

// URL: /api/v1/manage-oryza/auth/login
router.post("/auth/login", authController.login);

router.post("/auth/logout", protect, authController.logout);

module.exports = router;
