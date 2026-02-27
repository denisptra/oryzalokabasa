const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // Periode waktu: 15 menit
    max: 5, // Maksimal 5 kali percobaan per IP
    message: {
        status: 'error',
        message: 'Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit.'
    },
    standardHeaders: true, // Kirim info rate limit di header `RateLimit-*`
    legacyHeaders: false, // Matikan header `X-RateLimit-*` yang lama
});

module.exports = { loginLimiter };