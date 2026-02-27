const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * LOG CONTROLLER
 * Untuk melihat audit trail dari semua aktivitas user
 * Hanya bisa diakses SUPER_ADMIN
 */

/**
 * GET ALL LOGS - Ambil semua log (dengan pagination)
 * @route GET /api/logs
 * @access SUPER_ADMIN
 */
exports.getAllLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, module, action } = req.query;
    const skip = (page - 1) * limit;

    // Build filter
    const where = {};
    if (module) where.module = module;
    if (action) where.action = action;

    const logs = await prisma.log.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.log.count({ where });

    res.status(200).json({
      status: "success",
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET LOG BY ID - Ambil log berdasarkan ID
 * @route GET /api/log/:id
 * @access SUPER_ADMIN
 */
exports.getLogById = async (req, res) => {
  try {
    const log = await prisma.log.findUnique({
      where: { id: req.params.id },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        status: "error",
        message: "Log tidak ditemukan",
      });
    }

    res.status(200).json({
      status: "success",
      data: log,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET LOGS BY USER - Ambil semua log dari user tertentu
 * @route GET /api/logs/user/:userId
 * @access SUPER_ADMIN
 */
exports.getLogsByUser = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;

    const logs = await prisma.log.findMany({
      where: { userId: req.params.userId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: parseInt(skip),
      take: parseInt(limit),
    });

    const total = await prisma.log.count({
      where: { userId: req.params.userId },
    });

    res.status(200).json({
      status: "success",
      data: logs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
