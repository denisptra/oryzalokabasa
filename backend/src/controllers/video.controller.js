const videoService = require("../services/video.service");
const { recordLog } = require("../utils/logger");

exports.getActiveVideo = async (req, res) => {
    try {
        const video = await videoService.getActiveVideo();
        res.status(200).json({ status: "success", data: video });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

exports.getAllVideos = async (req, res) => {
    try {
        const videos = await videoService.getAllVideos();
        res.status(200).json({ status: "success", data: videos });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

exports.saveVideo = async (req, res) => {
    try {
        let data = { ...req.body };
        
        // Handle file upload
        if (req.file) {
            let filePath = req.file.path;
            if (!process.env.CLOUDINARY_CLOUD_NAME) {
                const uploadsIndex = filePath.indexOf("uploads");
                if (uploadsIndex !== -1) {
                    filePath = "/" + filePath.substring(uploadsIndex).replace(/\\/g, "/");
                }
            }
            data.url = filePath;
        }

        const video = await videoService.saveVideo(data);

        await recordLog(req, {
            action: data.id ? "UPDATE" : "CREATE",
            module: "HOMEPAGE_VIDEO",
            entityId: video.id,
            details: { title: video.title, url: video.url }
        });

        res.status(200).json({
            status: "success",
            message: "Video berhasil disimpan",
            data: video
        });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

exports.toggleActive = async (req, res) => {
    try {
        const video = await videoService.toggleActive(req.params.id);
        res.status(200).json({ status: "success", message: "Status video diperbarui", data: video });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};

exports.deleteVideo = async (req, res) => {
    try {
        await videoService.deleteVideo(req.params.id);
        res.status(200).json({ status: "success", message: "Video berhasil dihapus" });
    } catch (error) {
        res.status(400).json({ status: "error", message: error.message });
    }
};
