const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class HeroSliderService {
  // CREATE SLIDER - Buat slider baru
  async createSlider(data) {
    const { title, subtitle, image, link, isActive, order } = data;

    // Validasi input
    if (!title || !image) {
      throw new Error("Field title dan image tidak boleh kosong");
    }

    // Tentukan order - jika kosong, gunakan order terbesar + 1
    let orderValue = parseInt(order) || 0;

    if (!order) {
      const maxOrder = await prisma.heroSlider.aggregate({
        _max: {
          order: true,
        },
      });
      orderValue = (maxOrder._max.order || 0) + 1;
    }

    const slider = await prisma.heroSlider.create({
      data: {
        title,
        subtitle: subtitle || null,
        image,
        link: link || null,
        isActive: isActive !== undefined ? isActive : true,
        order: orderValue,
      },
    });

    return slider;
  }

  // GET ALL SLIDERS - Ambil semua slider sorted by order
  async getAllSliders() {
    const sliders = await prisma.heroSlider.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return sliders;
  }

  // GET ACTIVE SLIDERS ONLY - Ambil slider yang aktif (untuk frontend)
  async getActiveSliders() {
    const sliders = await prisma.heroSlider.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return sliders;
  }

  // GET SLIDER BY ID - Ambil detail slider
  async getSliderById(id) {
    if (!id) {
      throw new Error("Slider ID tidak boleh kosong");
    }

    const slider = await prisma.heroSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      throw new Error("Slider tidak ditemukan");
    }

    return slider;
  }

  // UPDATE SLIDER - Edit slider info
  async updateSlider(id, data) {
    if (!id) {
      throw new Error("Slider ID tidak boleh kosong");
    }

    // Validasi slider ada
    const slider = await prisma.heroSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      throw new Error("Slider tidak ditemukan");
    }

    // Validasi order jika di-update
    if (data.order !== undefined) {
      const orderValue = parseInt(data.order);
      if (isNaN(orderValue)) {
        throw new Error("Order harus berupa angka");
      }
    }

    const updated = await prisma.heroSlider.update({
      where: { id },
      data,
    });

    return updated;
  }

  // TOGGLE SLIDER STATUS - Aktifkan/nonaktifkan slider
  async toggleSliderStatus(id) {
    if (!id) {
      throw new Error("Slider ID tidak boleh kosong");
    }

    // Ambil status saat ini
    const slider = await prisma.heroSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      throw new Error("Slider tidak ditemukan");
    }

    // Toggle status
    const updated = await prisma.heroSlider.update({
      where: { id },
      data: {
        isActive: !slider.isActive,
      },
    });

    return updated;
  }

  // REORDER SLIDERS - Ubah urutan beberapa slider sekaligus
  async reorderSliders(data) {
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Data reorder harus berupa array dengan minimal 1 item");
    }

    // Update order untuk setiap slider
    const updates = data.map((item) => {
      if (!item.id || item.order === undefined) {
        throw new Error("Setiap item harus punya id dan order");
      }

      return prisma.heroSlider.update({
        where: { id: item.id },
        data: { order: parseInt(item.order) },
      });
    });

    const results = await Promise.all(updates);

    return results;
  }

  // DELETE SLIDER - Hapus slider
  async deleteSlider(id) {
    if (!id) {
      throw new Error("Slider ID tidak boleh kosong");
    }

    // Validasi slider ada
    const slider = await prisma.heroSlider.findUnique({
      where: { id },
    });

    if (!slider) {
      throw new Error("Slider tidak ditemukan");
    }

    await prisma.heroSlider.delete({
      where: { id },
    });

    return true;
  }
}

module.exports = new HeroSliderService();
