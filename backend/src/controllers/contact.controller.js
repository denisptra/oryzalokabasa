const contactService = require("../services/contact.service");
const { recordLog } = require("../utils/logger");

/**
 * CONTACT MESSAGE CONTROLLER
 * Mengelola pesan kontak dari pengunjung website
 */

/**
 * CREATE MESSAGE - Pengunjung submit form kontak
 * @route POST /api/contact/send
 * @access PUBLIC - Tidak perlu token
 */
exports.createMessage = async (req, res) => {
  try {
    const message = await contactService.createMessage(req.body, req.ip);

    // Log tidak perlu karena belum authenticated user
    // Tapi bisa track di database langsung

    res.status(201).json({
      status: "success",
      message: "Pesan Anda berhasil dikirim. Terima kasih!",
      data: {
        id: message.id,
        email: message.email,
        createdAt: message.createdAt,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL MESSAGES - Admin lihat semua pesan
 * @route GET /api/contact/messages
 * @access ADMIN & SUPER_ADMIN only
 */
exports.getAllMessages = async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query;
    const messages = await contactService.getAllMessages(page, limit, status || null);

    res.status(200).json({
      status: "success",
      data: messages.data,
      pagination: messages.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET MESSAGE BY ID - Admin lihat detail pesan
 * @route GET /api/contact/:id
 * @access ADMIN & SUPER_ADMIN only
 */
exports.getMessageById = async (req, res) => {
  try {
    const message = await contactService.getMessageById(req.params.id);

    // Update status ke READ jika belum
    if (message.status === "UNREAD") {
      await contactService.updateMessageStatus(req.params.id, "READ");
    }

    res.status(200).json({
      status: "success",
      data: message,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * MARK AS READ - Admin tandai pesan sudah dibaca
 * @route PUT /api/contact/mark-read/:id
 * @access ADMIN & SUPER_ADMIN only
 */
exports.markAsRead = async (req, res) => {
  try {
    const message = await contactService.updateMessageStatus(
      req.params.id,
      "READ",
    );

    await recordLog(req, {
      action: "UPDATE",
      module: "CONTACT",
      entityId: req.params.id,
      details: { status: "READ", from: message.email },
    });

    res.status(200).json({
      status: "success",
      message: "Pesan ditandai sebagai sudah dibaca",
      data: message,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * MARK AS ARCHIVED - Admin arsip pesan
 * @route PUT /api/contact/archive/:id
 * @access ADMIN & SUPER_ADMIN only
 */
exports.markAsArchived = async (req, res) => {
  try {
    const message = await contactService.updateMessageStatus(
      req.params.id,
      "ARCHIVED",
    );

    await recordLog(req, {
      action: "UPDATE",
      module: "CONTACT",
      entityId: req.params.id,
      details: { status: "ARCHIVED" },
    });

    res.status(200).json({
      status: "success",
      message: "Pesan diarsip",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE MESSAGE - Admin hapus pesan
 * @route DELETE /api/contact/delete/:id
 * @access SUPER_ADMIN only
 */
exports.deleteMessage = async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await contactService.getMessageById(messageId);

    await contactService.deleteMessage(messageId);

    await recordLog(req, {
      action: "DELETE",
      module: "CONTACT",
      entityId: messageId,
      details: { from: message.email, topic: message.topic },
    });

    res.status(200).json({
      status: "success",
      message: "Pesan berhasil dihapus",
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET STATISTICS - Admin lihat statistik pesan
 * @route GET /api/contact/stats
 * @access ADMIN & SUPER_ADMIN only
 */
exports.getStats = async (req, res) => {
  try {
    const stats = await contactService.getStats();

    res.status(200).json({
      status: "success",
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
