const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create subdirectory based on type
        const type = req.uploadType || "general";
        const dir = path.join(uploadsDir, type);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    },
});

// File filter - only images
const imageFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Format file tidak didukung. Gunakan JPEG, PNG, GIF, WebP, atau SVG."
            ),
            false
        );
    }
};

// Multer instances
const uploadGallery = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadHeroSlider = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadPost = multer({
    storage,
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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
    setUploadType,
    uploadsDir,
};
