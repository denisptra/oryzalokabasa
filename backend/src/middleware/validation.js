const { body, validationResult } = require('express-validator');

// Helper internal untuk mengelola hasil validasi
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            status: 'error',
            errors: errors.array().map(err => ({ 
                field: err.path, 
                message: err.msg 
            })) 
        });
    }
    next();
};

// Export langsung menggunakan exports
exports.validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Nama wajib diisi'),
    
    body('email')
        .isEmail().withMessage('Format email tidak valid')
        .normalizeEmail(),

    body('password')
        .notEmpty().withMessage('Password wajib diisi')
        .bail() // Berhenti di sini jika kosong, lanjut jika terisi
        .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
        .matches(/[a-z]/).withMessage('Password harus mengandung huruf kecil')
        .matches(/[A-Z]/).withMessage('Password harus mengandung huruf besar')
        .matches(/[0-9]/).withMessage('Password harus mengandung angka')
        .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Password harus mengandung karakter spesial/simbol'),

    handleValidation
];

exports.validateLogin = [
    body('email')
        .isEmail().withMessage('Email tidak valid'),
    
    body('password')
        .notEmpty().withMessage('Password wajib diisi'),
    
    handleValidation
];