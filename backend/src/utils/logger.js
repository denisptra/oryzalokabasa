const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const recordLog = async (req, { action, module, entityId, details }) => {
    try {
        await prisma.log.create({
            data: {
                userId: req.user ? req.user.id : null, // ID user dari token
                action,     // Contoh: 'CREATE', 'LOGIN'
                module,     // Contoh: 'AUTH', 'NEWS'
                entityId,   // ID data yang dimanipulasi
                details,    // Data lama/baru dalam bentuk JSON
                userAgent: req.headers['user-agent'],
                ipAddress: req.ip || req.connection.remoteAddress
            }
        });
    } catch (error) {
        console.error("Gagal mencatat log:", error.message);
    }
};

module.exports = { recordLog };