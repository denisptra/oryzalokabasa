const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class ContactService {
  // CREATE MESSAGE - Simpan pesan kontak dari pengunjung
  async createMessage(data, ipAddress) {
    const { name, email, topic, message } = data;

    // Validasi input
    if (!name || !email || !topic || !message) {
      throw new Error(
        "Field name, email, topic, dan message tidak boleh kosong",
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Format email tidak valid");
    }

    // Validasi panjang message
    if (message.length < 10) {
      throw new Error("Pesan minimal 10 karakter");
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        topic,
        message,
        ipAddress,
        status: "UNREAD",
      },
    });

    return contactMessage;
  }

  // GET ALL MESSAGES - Ambil semua pesan dengan pagination
  async getAllMessages(page = 1, limit = 10, status = "UNREAD") {
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;

    // Validasi status
    const validStatuses = ["UNREAD", "READ", "ARCHIVED"];
    const filterStatus = validStatuses.includes(status) ? status : "UNREAD";

    const skip = (pageNum - 1) * limitNum;

    const messages = await prisma.contactMessage.findMany({
      where: {
        status: filterStatus,
      },
      skip,
      take: limitNum,
      orderBy: {
        createdAt: "desc",
      },
    });

    const total = await prisma.contactMessage.count({
      where: {
        status: filterStatus,
      },
    });

    const pages = Math.ceil(total / limitNum);

    return {
      data: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages,
      },
    };
  }

  // GET MESSAGE BY ID - Ambil pesan berdasarkan ID
  async getMessageById(id) {
    if (!id) {
      throw new Error("Message ID tidak boleh kosong");
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new Error("Pesan tidak ditemukan");
    }

    return message;
  }

  // UPDATE MESSAGE STATUS - Ubah status pesan
  async updateMessageStatus(id, newStatus) {
    if (!id) {
      throw new Error("Message ID tidak boleh kosong");
    }

    const validStatuses = ["UNREAD", "READ", "ARCHIVED"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Status harus salah satu dari: UNREAD, READ, ARCHIVED");
    }

    // Validasi pesan ada
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new Error("Pesan tidak ditemukan");
    }

    const updated = await prisma.contactMessage.update({
      where: { id },
      data: {
        status: newStatus,
      },
    });

    return updated;
  }

  // DELETE MESSAGE - Hapus pesan
  async deleteMessage(id) {
    if (!id) {
      throw new Error("Message ID tidak boleh kosong");
    }

    // Validasi pesan ada
    const message = await prisma.contactMessage.findUnique({
      where: { id },
    });

    if (!message) {
      throw new Error("Pesan tidak ditemukan");
    }

    await prisma.contactMessage.delete({
      where: { id },
    });

    return true;
  }

  // GET STATISTICS - Tampilkan statistik pesan
  async getStats() {
    const total = await prisma.contactMessage.count();

    const unread = await prisma.contactMessage.count({
      where: {
        status: "UNREAD",
      },
    });

    const read = await prisma.contactMessage.count({
      where: {
        status: "READ",
      },
    });

    const archived = await prisma.contactMessage.count({
      where: {
        status: "ARCHIVED",
      },
    });

    const recentMessages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        topic: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      summary: {
        total,
        unread,
        read,
        archived,
      },
      recentMessages,
    };
  }
}

module.exports = new ContactService();
