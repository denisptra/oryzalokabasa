const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ message: "Sesi habis, silakan login ulang" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Isinya {id, role}
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token tidak valid" });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Anda tidak punya akses ke fitur ini" });
        }
        next();
    };
};

exports.authenticateToken = (req, res, next) => {
  // 1. Ambil token dari header 'Authorization'
  // Formatnya biasanya: Bearer <token>
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: "Akses ditolak, token tidak ditemukan" 
    });
  }

  try {
    // 2. Verifikasi token menggunakan Secret Key di .env
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Simpan data user yang login ke dalam object 'req' agar bisa dipakai di controller
    req.user = verified; 
    
    next(); // Lanjut ke fungsi berikutnya (controller)
  } catch (error) {
    res.status(403).json({ 
      success: false, 
      message: "Token tidak valid atau sudah kedaluwarsa" 
    });
  }
};