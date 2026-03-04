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
const uploadsDir = path.join(__dirname, "../../uploads");
if (!useCloudinary && !fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Local Storage configuration
const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
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

// Cloudinary Storage configuration
const getCloudinaryStorage = (folderName) => {
    return new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: `oryzalokabasa/${folderName}`,
            // format: async (req, file) => 'png', // supports promises as well
            // public_id: (req, file) => 'computed-filename-using-request',
        },
    });
};

// Select storage strategy based on upload type
const getStorage = (folder) => {
    return useCloudinary ? getCloudinaryStorage(folder) : localStorage;
};

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
    storage: getStorage('gallery'),
    fileFilter: imageFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

const uploadHeroSlider = multer({
    storage: getStorage('hero-slider'),
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const uploadPost = multer({
    storage: getStorage('posts'),
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
