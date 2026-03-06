const teamService = require("../services/team.service");
const { recordLog } = require("../utils/logger");
const path = require("path");
const fs = require("fs");

/**
 * TEAM CONTROLLER
 * Mengelola anggota tim di halaman About Us
 */

/**
 * CREATE MEMBER - Buat anggota baru
 * @route POST /api/team/create
 */
exports.createMember = async (req, res) => {
    try {
        let imagePath = "";
        if (req.file) {
            imagePath = req.file.path && req.file.path.startsWith("http")
                ? req.file.path
                : `/uploads/team/${req.file.filename}`;
        } else if (req.body.image) {
            imagePath = req.body.image;
        }

        const data = {
            name: req.body.name,
            role: req.body.role,
            image: imagePath,
            isActive: req.body.isActive === "true" || req.body.isActive === true,
            order: parseInt(req.body.order) || 0,
        };

        const member = await teamService.createMember(data);

        await recordLog(req, {
            action: "CREATE",
            module: "TEAM",
            entityId: member.id,
            details: { name: member.name, order: member.order },
        });

        res.status(201).json({
            status: "success",
            message: "Anggota tim berhasil ditambahkan",
            data: member,
        });
    } catch (error) {
        if (req.file && (!req.file.path || !req.file.path.startsWith("http"))) {
            const filePath = path.join(__dirname, "../../uploads/team", req.file.filename);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * GET ALL MEMBERS - Ambil semua anggota (sorted by order)
 * @route GET /api/team
 */
exports.getAllMembers = async (req, res) => {
    try {
        const members = await teamService.getAllMembers();

        res.status(200).json({
            status: "success",
            data: members,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * GET ACTIVE MEMBERS - Ambil anggota yang aktif saja (untuk frontend)
 * @route GET /api/team/active
 */
exports.getActiveMembers = async (req, res) => {
    try {
        const members = await teamService.getActiveMembers();

        res.status(200).json({
            status: "success",
            data: members,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * GET MEMBER BY ID - Ambil detail anggota
 * @route GET /api/team/:id
 */
exports.getMemberById = async (req, res) => {
    try {
        const member = await teamService.getMemberById(req.params.id);

        res.status(200).json({
            status: "success",
            data: member,
        });
    } catch (error) {
        res.status(404).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * UPDATE MEMBER - Edit anggota info
 * @route PUT /api/team/update/:id
 */
exports.updateMember = async (req, res) => {
    try {
        const updateData = { ...req.body };

        // Handle file upload
        if (req.file) {
            updateData.image = req.file.path && req.file.path.startsWith("http")
                ? req.file.path
                : `/uploads/team/${req.file.filename}`;
            // Delete old image
            try {
                const old = await teamService.getMemberById(req.params.id);
                if (old.image && old.image.startsWith("/uploads/")) {
                    const oldPath = path.join(__dirname, "../..", old.image);
                    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
                }
            } catch (e) { console.log("Could not delete old image:", e.message); }
        }

        // Parse boolean/int from form data
        if (updateData.isActive !== undefined) {
            updateData.isActive = updateData.isActive === "true" || updateData.isActive === true;
        }
        if (updateData.order !== undefined) {
            updateData.order = parseInt(updateData.order) || 0;
        }

        const member = await teamService.updateMember(req.params.id, updateData);

        await recordLog(req, {
            action: "UPDATE",
            module: "TEAM",
            entityId: member.id,
            details: { name: member.name, updated_fields: Object.keys(req.body) },
        });

        res.status(200).json({
            status: "success",
            message: "Anggota tim berhasil diperbarui",
            data: member,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * TOGGLE MEMBER STATUS - Aktifkan/nonaktifkan anggota
 * @route PUT /api/team/toggle/:id
 */
exports.toggleMemberStatus = async (req, res) => {
    try {
        const member = await teamService.toggleMemberStatus(req.params.id);

        await recordLog(req, {
            action: "UPDATE",
            module: "TEAM",
            entityId: member.id,
            details: { isActive: member.isActive },
        });

        res.status(200).json({
            status: "success",
            message: `Anggota ${member.isActive ? "diaktifkan" : "dinonaktifkan"}`,
            data: member,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * REORDER MEMBERS - Ubah urutan tampilan anggota
 * @route PUT /api/team/reorder
 */
exports.reorderMembers = async (req, res) => {
    try {
        const members = await teamService.reorderMembers(req.body);

        await recordLog(req, {
            action: "UPDATE",
            module: "TEAM",
            details: { action: "reorder", members_updated: members.length },
        });

        res.status(200).json({
            status: "success",
            message: "Urutan anggota tim berhasil diperbarui",
            data: members,
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};

/**
 * DELETE MEMBER - Hapus anggota
 * @route DELETE /api/team/delete/:id
 */
exports.deleteMember = async (req, res) => {
    try {
        const memberId = req.params.id;
        const member = await teamService.getMemberById(memberId);

        // Delete image file if local
        if (member.image && member.image.startsWith("/uploads/")) {
            const filePath = path.join(__dirname, "../..", member.image);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await teamService.deleteMember(memberId);

        await recordLog(req, {
            action: "DELETE",
            module: "TEAM",
            entityId: memberId,
            details: { deleted_name: member.name },
        });

        res.status(200).json({
            status: "success",
            message: "Anggota tim berhasil dihapus",
        });
    } catch (error) {
        res.status(400).json({
            status: "error",
            message: error.message,
        });
    }
};
