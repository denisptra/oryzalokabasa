const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth');

// Semua fitur User Management butuh LOGIN & Role SUPER_ADMIN
router.use(protect);
router.use(authorize('SUPER_ADMIN'));

router.get('/users', userController.list);            // Daftar Admin
router.put('/user/:id', userController.update);      // Edit Admin
router.delete('/user/:id', userController.remove);   // Hapus Admin

module.exports = router;