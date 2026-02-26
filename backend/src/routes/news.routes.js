// const express = require('express');
// const router = express.Router();
// const newsController = require('../controllers/news.controller');
// const { protect, authorize } = require('../middleware/auth');

// // --- PUBLIC (Bisa diakses siapa saja) ---
// router.get('/news', newsController.getAll);           // Ambil list berita
// router.get('/:slug', newsController.getSingle);   // Detail berita pakai SLUG

// // --- ADMIN (Wajib Login) ---
// router.post('/news/create', protect, authorize('ADMIN', 'SUPER_ADMIN'), newsController.create);
// router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), newsController.update);
// router.delete('/:id', protect, authorize('SUPER_ADMIN'), newsController.remove);

// module.exports = router;