// const newsService = require('../services/news.service');

// const getAll = async (req, res) => {
//   try {
//     const data = await newsService.getPublishedNews();
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const getSingle = async (req, res) => {
//   try {
//     const data = await newsService.getNewsBySlug(req.params.slug);
//     if (!data) return res.status(404).json({ message: "Berita tidak ditemukan" });
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// const create = async (req, res) => {
//   try {
//     const data = await newsService.createNews(req.body, req.user.id);
//     res.status(201).json({ success: true, data });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// const update = async (req, res) => {
//   try {
//     const data = await newsService.updateNews(req.params.id, req.body, req.user.id);
//     res.status(200).json({ success: true, data });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// const remove = async (req, res) => {
//   try {
//     await newsService.deleteNews(req.params.id, req.user.id);
//     res.status(200).json({ success: true, message: "Berita dihapus" });
//   } catch (error) {
//     res.status(400).json({ success: false, message: error.message });
//   }
// };

// module.exports = { getAll, getSingle, create, update, remove };