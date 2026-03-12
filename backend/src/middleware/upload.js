const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("cloudinary").v2;

// Check if Cloudinary is configured
const useCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

if (useCloudinary) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}

// Ensure local uploads directory exists
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadsDir = isProduction
    ? path.join("/tmp", "uploads")
    : path.join(__dirname, "../../uploads");

if (!useCloudinary) {
    try {
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
    } catch (err) {
        console.warn("Warning: Could not create uploads directory. If you are on Vercel, this is expected as the filesystem is read-only. Please configure Cloudinary for file uploads.");
    }
}

// Local Storage configuration
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.uploadType || "general";
        const dir = path.join(uploadsDir, type);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
        } catch (err) {
            console.warn("Warning: Could not create directory", dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

// Cloudinary Storage configuration
const getCloudinaryStorage = (folderName, resourceType = "image") => {
    const params = {
        folder: `oryzalokabasa/${folderName}`,
        resource_type: resourceType === "video" ? "video" : "auto",
    };

    // Only apply heavy transformations to images
    if (resourceType === "image") {
        params.transformation = [{ width: 1200, crop: "limit", quality: "auto", fetch_format: "auto" }];
    }

    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: params,
    });
};

// Select storage strategy based on upload type
const getStorage = (folder, resourceType = "image") => {
    return useCloudinary ? getCloudinaryStorage(folder, resourceType) : localStorage;
};

// File filter - images and videos
const mediaFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
        "video/mp4",
        "video/webm",
        "video/quicktime", // .mov
        "video/ogg",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format file tidak didukung. Gunakan Gambar atau Video (MP4/WebM/MOV/OGG)."
            ),
            false
        );
    }
};

// Max file size
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// Multer instances
const uploadGallery = multer({
    storage: getStorage('gallery'),
    fileFilter: mediaFilter,
    limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadHeroSlider = multer({
    storage: getStorage('hero-slider'),
    fileFilter: mediaFilter,
    limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadPost = multer({
    storage: getStorage('posts'),
    fileFilter: mediaFilter,
    limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadTeam = multer({
    storage: getStorage('team'),
    fileFilter: mediaFilter,
    limits: { fileSize: MAX_IMAGE_SIZE },
});

const uploadVideo = multer({
    storage: getStorage('videos', 'video'),
    fileFilter: mediaFilter,
    limits: { fileSize: MAX_VIDEO_SIZE },
});

// Middleware to set upload type
const setUploadType = (type) => (req, res, next) => {
    req.uploadType = type;
    next();
};

module.exports = {
    uploadGallery,
    uploadHeroSlider,
    uploadPost,
    uploadTeam,
    uploadVideo,
    setUploadType,
    uploadsDir,
};
