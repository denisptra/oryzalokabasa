const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class TeamService {
    // CREATE MEMBER - Tambah anggota tim
    async createMember(data) {
        const { name, role, image, isActive, order } = data;

        // Validasi input
        if (!name || !role) {
            throw new Error("Field nama dan jabatan tidak boleh kosong");
        }

        // Tentukan order - jika kosong, gunakan order terbesar + 1
        let orderValue = parseInt(order) || 0;

        if (!order) {
            const maxOrder = await prisma.teamMember.aggregate({
                _max: {
                    order: true,
                },
            });
            orderValue = (maxOrder._max.order || 0) + 1;
        }

        const member = await prisma.teamMember.create({
            data: {
                name,
                role,
                image: image || null,
                isActive: isActive !== undefined ? isActive : true,
                order: orderValue,
            },
        });

        return member;
    }

    // GET ALL MEMBERS - Ambil semua anggota sorted by order
    async getAllMembers() {
        const members = await prisma.teamMember.findMany({
            orderBy: {
                order: "asc",
            },
        });

        return members;
    }

    // GET ACTIVE MEMBERS ONLY - Ambil anggota yang aktif (untuk frontend)
    async getActiveMembers() {
        const members = await prisma.teamMember.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                order: "asc",
            },
        });

        return members;
    }

    // GET MEMBER BY ID - Ambil detail anggota
    async getMemberById(id) {
        if (!id) {
            throw new Error("Member ID tidak boleh kosong");
        }

        const member = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!member) {
            throw new Error("Anggota tidak ditemukan");
        }

        return member;
    }

    // UPDATE MEMBER - Edit info anggota
    async updateMember(id, data) {
        if (!id) {
            throw new Error("Member ID tidak boleh kosong");
        }

        // Validasi member ada
        const member = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!member) {
            throw new Error("Anggota tidak ditemukan");
        }

        // Validasi order jika di-update
        if (data.order !== undefined) {
            const orderValue = parseInt(data.order);
            if (isNaN(orderValue)) {
                throw new Error("Order harus berupa angka");
            }
        }

        const updated = await prisma.teamMember.update({
            where: { id },
            data,
        });

        return updated;
    }

    // TOGGLE MEMBER STATUS - Aktifkan/nonaktifkan anggota
    async toggleMemberStatus(id) {
        if (!id) {
            throw new Error("Member ID tidak boleh kosong");
        }

        // Ambil status saat ini
        const member = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!member) {
            throw new Error("Anggota tidak ditemukan");
        }

        // Toggle status
        const updated = await prisma.teamMember.update({
            where: { id },
            data: {
                isActive: !member.isActive,
            },
        });

        return updated;
    }

    // REORDER MEMBERS - Ubah urutan beberapa anggota sekaligus
    async reorderMembers(data) {
        if (!data || !Array.isArray(data) || data.length === 0) {
            throw new Error("Data reorder harus berupa array dengan minimal 1 item");
        }

        // Update order untuk setiap anggota
        const updates = data.map((item) => {
            if (!item.id || item.order === undefined) {
                throw new Error("Setiap item harus punya id dan order");
            }

            return prisma.teamMember.update({
                where: { id: item.id },
                data: { order: parseInt(item.order) },
            });
        });

        const results = await Promise.all(updates);

        return results;
    }

    // DELETE MEMBER - Hapus anggota
    async deleteMember(id) {
        if (!id) {
            throw new Error("Member ID tidak boleh kosong");
        }

        // Validasi member ada
        const member = await prisma.teamMember.findUnique({
            where: { id },
        });

        if (!member) {
            throw new Error("Anggota tidak ditemukan");
        }

        await prisma.teamMember.delete({
            where: { id },
        });

        return true;
    }
}

module.exports = new TeamService();
