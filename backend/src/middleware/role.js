/**
 * Middleware untuk mengecek role user
 * Support single role, multiple roles, atau permission-based access
 *
 * Contoh penggunaan:
 * - authorize('SUPER_ADMIN') => Hanya SUPER_ADMIN yang bisa akses
 * - authorize('SUPER_ADMIN', 'ADMIN') => SUPER_ADMIN atau ADMIN bisa akses
 * - authorize(['SUPER_ADMIN', 'ADMIN']) => SUPER_ADMIN atau ADMIN bisa akses
 * - authorize({ action: 'delete_user', roles: 'SUPER_ADMIN' }) => Hanya SUPER_ADMIN bisa delete user
 */

const authorize = (...args) => {
  return (req, res, next) => {
    // req.user harus sudah set oleh middleware authenticate
    if (!req.user) {
      return res.status(401).json({
        status: "error",
        message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
      });
    }

    // Jika dipanggil dengan multiple string: authorize("ADMIN", "SUPER_ADMIN")
    if (args.length > 1 && args.every((a) => typeof a === "string")) {
      if (!args.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin mengakses resource ini.`,
        });
      }
      return next();
    }

    const config = args[0] || {};

    // Jika config adalah string atau array (mode simple)
    if (typeof config === "string" || Array.isArray(config)) {
      const allowedRoles =
        typeof config === "string" ? [config] : config;

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: `Akses ditolak. Role '${req.user.role}' tidak memiliki izin mengakses resource ini.`,
        });
      }
      return next();
    }

    // Jika config adalah object (mode advanced dengan action-based access)
    if (typeof config === "object" && config.action) {
      const { action, roles } = config;
      const allowedRoles = Array.isArray(roles) ? roles : [roles];

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          status: "error",
          message: `Anda (${req.user.role}) tidak bisa melakukan action '${action}'.`,
        });
      }
      return next();
    }

    // Default: ijinkan
    next();
  };
};

module.exports = { authorize };
