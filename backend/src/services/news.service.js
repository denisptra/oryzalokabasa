// const prisma = require('../config/db');
// const generateSlug = require('../utils/slugify');

// // --- UNTUK PENGUNJUNG (PUBLIC) ---

// const getPublishedNews = async () => {
//   return await prisma.news.findMany({
//     where: { status: 'PUBLISHED' },
//     include: {
//       category: { select: { name: true, slug: true } },
//       author: { select: { name: true } },
//       tags: { select: { name: true } }
//     },
//     orderBy: { createdAt: 'desc' }
//   });
// };

// const getNewsBySlug = async (slug) => {
//   return await prisma.news.update({
//     where: { slug },
//     data: { views: { increment: 1 } }, // Otomatis nambah view tiap dibaca
//     include: {
//       category: true,
//       author: { select: { name: true } },
//       tags: true
//     }
//   });
// };

// // --- UNTUK ADMIN (CMS) ---

// const createNews = async (data, authorId) => {
//   let slug = generateSlug(data.title);

//   // Cek duplikat slug biar gak error
//   const existing = await prisma.news.findUnique({ where: { slug } });
//   if (existing) slug = `${slug}-${Date.now()}`;

//   const news = await prisma.news.create({
//     data: {
//       title: data.title,
//       slug: slug,
//       content: data.content,
//       thumbnail: data.thumbnail,
//       metaTitle: data.metaTitle || data.title,
//       metaDescription: data.metaDescription,
//       status: data.status || 'DRAFT',
//       categoryId: data.categoryId,
//       authorId: authorId,
//       // Jika ada tags (asumsi many-to-many implicit)
//       tags: data.tags ? { connect: data.tags.map(id => ({ id })) } : undefined
//     }
//   });

//   // LOG AKTIVITAS
//   await prisma.log.create({
//     data: {
//       userId: authorId,
//       action: "CREATE_NEWS",
//       module: "NEWS",
//       entityId: news.id,
//       details: { title: news.title }
//     }
//   });

//   return news;
// };

// const updateNews = async (id, data, adminId) => {
//   const current = await prisma.news.findUnique({ where: { id } });
//   if (!current) throw new Error("Berita tidak ditemukan");

//   const updateData = { ...data };

//   // Jika judul ganti, slug juga ganti (SEO Friendly)
//   if (data.title && data.title !== current.title) {
//     let newSlug = generateSlug(data.title);
//     const duplicate = await prisma.news.findFirst({ where: { slug: newSlug, id: { not: id } } });
//     if (duplicate) newSlug = `${newSlug}-${Date.now()}`;
//     updateData.slug = newSlug;
//   }

//   const updated = await prisma.news.update({
//     where: { id },
//     data: updateData
//   });

//   await prisma.log.create({
//     data: {
//       userId: adminId,
//       action: "UPDATE_NEWS",
//       module: "NEWS",
//       entityId: id,
//       details: { title: updated.title }
//     }
//   });

//   return updated;
// };

// const deleteNews = async (id, adminId) => {
//   await prisma.news.delete({ where: { id } });
//   await prisma.log.create({
//     data: { userId: adminId, action: "DELETE_NEWS", module: "NEWS", entityId: id }
//   });
//   return true;
// };

// module.exports = {
//   getPublishedNews,
//   getNewsBySlug,
//   createNews,
//   updateNews,
//   deleteNews
// };