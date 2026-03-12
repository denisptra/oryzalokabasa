const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class VideoService {
    // GET ACTIVE VIDEO - Ambil video yang sedang aktif
    async getActiveVideo() {
        const video = await prisma.homepageVideo.findFirst({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        });
        return video;
    }

    // GET ALL VIDEOS - Ambil semua daftar video
    async getAllVideos() {
        return await prisma.homepageVideo.findMany({
            orderBy: { createdAt: "desc" }
        });
    }

    // SAVE VIDEO - Simpan atau update video
    async saveVideo(data) {
        const { id, title, url, isActive } = data;

        if (!url) {
            throw new Error("URL video tidak boleh kosong");
        }

        // Deactivate others if this one is set to active
        if (isActive === true || isActive === "true") {
            await prisma.homepageVideo.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        if (id) {
            // Update existing
            return await prisma.homepageVideo.update({
                where: { id },
                data: { 
                    title, 
                    url, 
                    isActive: isActive === true || isActive === "true",
                    updatedAt: new Date()
                }
            });
        } else {
            // Create new
            return await prisma.homepageVideo.create({
                data: {
                    title,
                    url,
                    isActive: isActive === true || isActive === "true"
                }
            });
        }
    }

    // TOGGLE STATUS
    async toggleActive(id) {
        const video = await prisma.homepageVideo.findUnique({ where: { id } });
        if (!video) throw new Error("Video tidak ditemukan");

        // Jika akan diaktifkan, matikan yang lain
        if (!video.isActive) {
            await prisma.homepageVideo.updateMany({
                where: { isActive: true },
                data: { isActive: false }
            });
        }

        return await prisma.homepageVideo.update({
            where: { id },
            data: { isActive: !video.isActive }
        });
    }

    // DELETE VIDEO
    async deleteVideo(id) {
        return await prisma.homepageVideo.delete({ where: { id } });
    }
}

module.exports = new VideoService();
