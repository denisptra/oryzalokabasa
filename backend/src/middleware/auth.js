const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // 1. Validasi keberadaan Header
    if (!authHeader) {
        return res.status(401).json({ 
            status: 'error', 
            message: 'Akses ditolak, header Authorization tidak ditemukan' 
        });
    }

    // 2. Validasi format Bearer Token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return res.status(401).json({
            status: 'error',
            message: 'Format token salah. Gunakan format: Bearer [token]'
        });
    }

    const token = parts[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        next();
    } catch (error) {
        // 3. Pesan error spesifik berdasarkan jenis kesalahan JWT
        let msg = 'Token tidak valid';
        if (error.name === 'TokenExpiredError') {
            msg = 'Token sudah kadaluarsa, silakan login kembali';
        } else if (error.name === 'JsonWebTokenError') {
            msg = 'Token cacat atau tidak dikenali';
        }

        return res.status(403).json({ 
            status: 'error', 
            message: msg 
        });
    }
};

module.exports = { authenticate };