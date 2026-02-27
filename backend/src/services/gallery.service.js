const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class GalleryService {
  // CREATE GALLERY - Tambah foto ke galeri
  async createGallery(data) {
    const { title, image, categoryId, eventDate } = data;

    // Validasi input
    if (!title || !image || !categoryId) {
      throw new Error("Field title, image, dan categoryId tidak boleh kosong");
    }

    // Validasi category ada
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("Category tidak ditemukan");
    }

    // Validasi eventDate jika ada
    let parsedEventDate = null;
    if (eventDate) {
      const dateObj = new Date(eventDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error(
          "Format tanggal event tidak valid (gunakan YYYY-MM-DD)",
        );
      }
      parsedEventDate = dateObj;
    }

    const gallery = await prisma.gallery.create({
      data: {
        title,
        image,
        categoryId,
        eventDate: parsedEventDate,
      },
      include: {
        category: true,
      },
    });

    return gallery;
  }

  // GET ALL GALLERY - Ambil semua foto dengan pagination
  async getAllGallery(page = 1, limit = 12, categoryId = null) {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const whereCondition = categoryId ? { categoryId } : {};

    const gallery = await prisma.gallery.findMany({
      where: whereCondition,
      skip,
      take: limitNum,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.gallery.count({
      where: whereCondition,
    });

    const pages = Math.ceil(total / limitNum);

    return {
      data: gallery,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    };
  }

  // GET GALLERY BY CATEGORY - Ambil foto berdasarkan kategori
  async getGalleryByCategory(categoryId, page = 1, limit = 12) {
    if (!categoryId) {
      throw new Error("Category ID tidak boleh kosong");
    }

    // Validasi category ada
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new Error("Category tidak ditemukan");
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const gallery = await prisma.gallery.findMany({
      where: { categoryId },
      skip,
      take: limitNum,
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.gallery.count({
      where: { categoryId },
    });

    const pages = Math.ceil(total / limitNum);

    return {
      data: gallery,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    };
  }

  // GET GALLERY BY EVENT DATE - Ambil foto berdasarkan tanggal event
  async getGalleryByEventDate(eventDate, page = 1, limit = 12) {
    if (!eventDate) {
      throw new Error("Event date tidak boleh kosong");
    }

    // Parse date (format: YYYY-MM-DD atau YYYY-MM)
    const dateObj = new Date(eventDate + "T00:00:00Z");
    if (isNaN(dateObj.getTime())) {
      throw new Error(
        "Format tanggal tidak valid (gunakan YYYY-MM-DD atau YYYY-MM)",
      );
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Jika eventDate adalah YYYY-MM format, cari semua tanggal di bulan itu
    let startDate, endDate;

    if (eventDate.length === 7) {
      // YYYY-MM format
      startDate = new Date(`${eventDate}-01T00:00:00Z`);
      endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );
    } else {
      // YYYY-MM-DD format
      startDate = new Date(eventDate + "T00:00:00Z");
      endDate = new Date(eventDate + "T23:59:59Z");
    }

    const gallery = await prisma.gallery.findMany({
      where: {
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      skip,
      take: limitNum,
      include: {
        category: true,
      },
      orderBy: {
        eventDate: "desc",
      },
    });

    const total = await prisma.gallery.count({
      where: {
        eventDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const pages = Math.ceil(total / limitNum);

    return {
      data: gallery,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    };
  }

  // GET GALLERY BY ID - Ambil detail foto
  async getGalleryById(id) {
    if (!id) {
      throw new Error("Gallery ID tidak boleh kosong");
    }

    const gallery = await prisma.gallery.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!gallery) {
      throw new Error("Foto tidak ditemukan");
    }

    return gallery;
  }

  // UPDATE GALLERY - Edit info foto
  async updateGallery(id, data) {
    if (!id) {
      throw new Error("Gallery ID tidak boleh kosong");
    }

    // Validasi galeri ada
    const gallery = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new Error("Foto tidak ditemukan");
    }

    // Validasi category jika di-update
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: data.categoryId },
      });

      if (!category) {
        throw new Error("Category tidak ditemukan");
      }
    }

    // Validasi eventDate jika ada
    if (data.eventDate) {
      const dateObj = new Date(data.eventDate);
      if (isNaN(dateObj.getTime())) {
        throw new Error(
          "Format tanggal event tidak valid (gunakan YYYY-MM-DD)",
        );
      }
    }

    const updated = await prisma.gallery.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return updated;
  }

  // DELETE GALLERY - Hapus foto
  async deleteGallery(id) {
    if (!id) {
      throw new Error("Gallery ID tidak boleh kosong");
    }

    // Validasi galeri ada
    const gallery = await prisma.gallery.findUnique({
      where: { id },
    });

    if (!gallery) {
      throw new Error("Foto tidak ditemukan");
    }

    await prisma.gallery.delete({
      where: { id },
    });

    return true;
  }

  // GET GALLERY STATISTICS - Statistik galeri
  async getGalleryStats() {
    const total = await prisma.gallery.count();

    const categories = await prisma.category.findMany({
      include: {
        galleries: {
          select: {
            id: true,
          },
        },
      },
    });

    const categoryStats = categories
      .filter((cat) => cat.galleries.length > 0)
      .map((cat) => ({
        categoryId: cat.id,
        categoryName: cat.name,
        count: cat.galleries.length,
      }));

    const recentPhotos = await prisma.gallery.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 6,
      include: {
        category: {
          select: {
            name: true,
          },
        },
      },
    });

    const eventsThisMonth = await prisma.gallery.findMany({
      where: {
        eventDate: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          lte: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
        },
      },
      select: {
        id: true,
        title: true,
        eventDate: true,
      },
    });

    return {
      summary: {
        total,
        categories: categoryStats,
      },
      recentPhotos,
      eventsThisMonth,
    };
  }
}

module.exports = new GalleryService();
