/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                      ORYZA API - DOKUMENTASI                             ║
 * ║                    Role-Based Access Control (RBAC)                       ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * SISTEM ROLE:
 * ────────────
 * 1. ADMIN
 *    - Role default untuk user baru yang register
 *    - Bisa: CREATE/UPDATE/DELETE category
 *    - TIDAK bisa: Lihat/manage user, lihat log
 *
 * 2. SUPER_ADMIN
 *    - Role tertinggi, hanya bisa dibuat oleh SUPER_ADMIN
 *    - Bisa: Semua yang bisa ADMIN + CRUD user + akses log
 *
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 1. AUTH ENDPOINTS
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 📝 REGISTER (Buat akun baru)
 *    POST /api/auth/register
 *    Access: PUBLIC (tidak perlu token)
 *
 *    Request Body:
 *    {
 *        "name": "John Doe",
 *        "email": "john@example.com",
 *        "password": "SecurePass123!"
 *    }
 *
 *    Response (201):
 *    {
 *        "status": "success",
 *        "message": "Registrasi berhasil. Silakan login.",
 *        "data": {
 *            "id": "uuid",
 *            "name": "John Doe",
 *            "email": "john@example.com",
 *            "role": "ADMIN"
 *        }
 *    }
 *
 *    Notes:
 *    - Password harus minimal 8 karakter
 *    - Password harus mengandung: huruf kecil, huruf besar, angka, simbol
 *    - Default role: ADMIN (tidak bisa langsung jadi SUPER_ADMIN)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🔑 LOGIN (Masuk dengan email & password)
 *    POST /api/auth/login
 *    Access: PUBLIC (tidak perlu token)
 *    Rate Limit: 5 kali percobaan per 15 menit
 *
 *    Request Body:
 *    {
 *        "email": "john@example.com",
 *        "password": "SecurePass123!"
 *    }
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "Login berhasil",
 *        "data": {
 *            "id": "uuid",
 *            "name": "John Doe",
 *            "email": "john@example.com",
 *            "role": "ADMIN"
 *        },
 *        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *    }
 *
 *    Notes:
 *    - Token berlaku 1 hari (86400 detik)
 *    - Simpan token di client untuk request selanjutnya
 *    - Format header: Authorization: Bearer [token]
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🚪 LOGOUT (Keluar dari akun)
 *    POST /api/auth/logout
 *    Access: PROTECTED (perlu token)
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "Logout berhasil. Hapus token dari client Anda."
 *    }
 *
 *    Notes:
 *    - Hapus token dari client (localStorage, sessionStorage, cookie, dll)
 *    - Log activity akan dicatat
 *
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 2. CATEGORY ENDPOINTS
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 📖 GET ALL CATEGORIES (Lihat semua kategori)
 *    GET /api/categories
 *    Access: PUBLIC (tidak perlu token)
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "data": [
 *            {
 *                "id": "uuid",
 *                "name": "Teknologi",
 *                "slug": "teknologi"
 *            },
 *            ...
 *        ]
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🔍 GET CATEGORY BY ID (Lihat kategori berdasarkan ID)
 *    GET /api/category/{id}
 *    Access: PUBLIC (tidak perlu token)
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "data": {
 *            "id": "uuid",
 *            "name": "Teknologi",
 *            "slug": "teknologi"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ✅ CREATE CATEGORY (Tambah kategori baru)
 *    POST /api/category/create
 *    Access: ADMIN & SUPER_ADMIN
 *    Headers: Authorization: Bearer [token]
 *
 *    Request Body:
 *    {
 *        "name": "Teknologi"
 *    }
 *
 *    Response (201):
 *    {
 *        "status": "success",
 *        "message": "Kategori berhasil dibuat",
 *        "data": {
 *            "id": "uuid",
 *            "name": "Teknologi",
 *            "slug": "teknologi"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ✏️ UPDATE CATEGORY (Ubah kategori)
 *    PUT /api/category/update/{id}
 *    Access: ADMIN & SUPER_ADMIN
 *    Headers: Authorization: Bearer [token]
 *
 *    Request Body:
 *    {
 *        "name": "Teknologi Terbaru"
 *    }
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "Kategori berhasil diubah",
 *        "data": {
 *            "id": "uuid",
 *            "name": "Teknologi Terbaru",
 *            "slug": "teknologi-terbaru"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🗑️ DELETE CATEGORY (Hapus kategori)
 *    DELETE /api/category/delete/{id}
 *    Access: ADMIN & SUPER_ADMIN
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "Kategori berhasil dihapus"
 *    }
 *
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 3. USER ENDPOINTS (SUPER_ADMIN ONLY)
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * INFO: Semua endpoint user hanya bisa diakses SUPER_ADMIN
 * Alasan: User management adalah privilege tinggi (bisa change role ke SUPER_ADMIN)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ✅ CREATE USER (Tambah user baru)
 *    POST /api/user/create
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Request Body:
 *    {
 *        "name": "Jane Doe",
 *        "email": "jane@example.com",
 *        "password": "SecurePass123!",
 *        "role": "ADMIN" atau "SUPER_ADMIN"
 *    }
 *
 *    Response (201):
 *    {
 *        "status": "success",
 *        "message": "User berhasil dibuat",
 *        "data": {
 *            "id": "uuid",
 *            "name": "Jane Doe",
 *            "email": "jane@example.com",
 *            "role": "ADMIN"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 📖 GET ALL USERS (Lihat semua user)
 *    GET /api/users
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "data": [
 *            {
 *                "id": "uuid",
 *                "name": "John Doe",
 *                "email": "john@example.com",
 *                "role": "ADMIN",
 *                "createdAt": "2024-01-15T10:30:00Z"
 *            },
 *            ...
 *        ]
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🔍 GET USER BY ID (Lihat user berdasarkan ID)
 *    GET /api/user/{id}
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "data": {
 *            "id": "uuid",
 *            "name": "John Doe",
 *            "email": "john@example.com",
 *            "role": "ADMIN",
 *            "createdAt": "2024-01-15T10:30:00Z"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * ✏️ UPDATE USER (Ubah user - termasuk role)
 *    PUT /api/user/update/{id}
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Request Body:
 *    {
 *        "name": "John Smith",
 *        "email": "john.smith@example.com",
 *        "role": "SUPER_ADMIN"
 *    }
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "User berhasil diperbarui",
 *        "data": {
 *            "id": "uuid",
 *            "name": "John Smith",
 *            "email": "john.smith@example.com",
 *            "role": "SUPER_ADMIN"
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🗑️ DELETE USER (Hapus user)
 *    DELETE /api/user/delete/{id}
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "message": "User berhasil dihapus"
 *    }
 *
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 4. LOG ENDPOINTS (SUPER_ADMIN ONLY)
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * INFO: Semua endpoint log hanya bisa diakses SUPER_ADMIN
 * Log berisi audit trail dari semua aktivitas di sistem:
 * - Register, Login, Logout
 * - Create, Update, Delete User
 * - Create, Update, Delete Category
 * - Etc.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 📖 GET ALL LOGS (Lihat semua log dengan pagination & filter)
 *    GET /api/logs?page=1&limit=50&module=AUTH&action=LOGIN
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Query Parameters:
 *    - page: nomor halaman (default: 1)
 *    - limit: jumlah item per halaman (default: 50)
 *    - module: filter by module (AUTH, USER, CATEGORY, etc)
 *    - action: filter by action (LOGIN, CREATE, UPDATE, DELETE, etc)
 *
 *    Response (200):
 *    {
 *        "status": "success",
 *        "data": [
 *            {
 *                "id": "uuid",
 *                "userId": "uuid",
 *                "user": {
 *                    "id": "uuid",
 *                    "name": "John Doe",
 *                    "email": "john@example.com",
 *                    "role": "ADMIN"
 *                },
 *                "action": "LOGIN",
 *                "module": "AUTH",
 *                "entityId": "uuid",
 *                "details": { ... },
 *                "userAgent": "Mozilla/5.0...",
 *                "ipAddress": "192.168.1.1",
 *                "createdAt": "2024-01-15T10:30:00Z"
 *            },
 *            ...
 *        ],
 *        "pagination": {
 *            "page": 1,
 *            "limit": 50,
 *            "total": 250,
 *            "pages": 5
 *        }
 *    }
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 🔍 GET LOG BY ID (Lihat detail log)
 *    GET /api/log/{id}
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200): (sama format seperti di atas)
 *
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * 👤 GET LOGS BY USER (Lihat semua log dari user tertentu)
 *    GET /api/logs/user/{userId}?page=1&limit=50
 *    Access: SUPER_ADMIN ONLY
 *    Headers: Authorization: Bearer [token]
 *
 *    Response (200): (sama format seperti di atas)
 *
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * ERROR RESPONSES
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 400 BAD REQUEST
 * {
 *     "status": "error",
 *     "message": "Deskripsi error"
 * }
 *
 * 401 UNAUTHORIZED
 * {
 *     "status": "error",
 *     "message": "Token tidak ditemukan atau token kadaluarsa"
 * }
 *
 * 403 FORBIDDEN
 * {
 *     "status": "error",
 *     "message": "Akses ditolak. Role 'ADMIN' tidak memiliki izin mengakses resource ini."
 * }
 *
 * 404 NOT FOUND
 * {
 *     "status": "error",
 *     "message": "User tidak ditemukan"
 * }
 *
 * 429 TOO MANY REQUESTS
 * {
 *     "status": "error",
 *     "message": "Terlalu banyak percobaan login. Silakan coba lagi setelah 15 menit."
 * }
 *
 * 500 INTERNAL SERVER ERROR
 * {
 *     "status": "error",
 *     "message": "Terjadi kesalahan internal pada server"
 * }
 *
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * EXAMPLE USAGE FLOW
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 1. REGISTER & LOGIN
 *    POST /api/auth/register → Dapatkan response dengan user info dan role
 *    POST /api/auth/login → Dapatkan token JWT
 *    Simpan token di client
 *
 * 2. USE TOKEN
 *    Untuk setiap request yang butuh autentikasi, tambahkan header:
 *    Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *
 * 3. ADMIN CAN
 *    - POST /api/category/create (CREATE category)
 *    - PUT /api/category/update/{id} (UPDATE category)
 *    - DELETE /api/category/delete/{id} (DELETE category)
 *    - GET /api/categories (READ categories)
 *
 * 4. ADMIN CANNOT
 *    - POST /api/user/create (CREATE user)
 *    - GET /api/users (READ all users)
 *    - GET /api/logs (READ logs)
 *
 * 5. SUPER_ADMIN CAN DO EVERYTHING
 *    - Semua yang bisa ADMIN lakukan
 *    - POST /api/user/create
 *    - GET /api/users
 *    - PUT /api/user/update/{id}
 *    - DELETE /api/user/delete/{id}
 *    - GET /api/logs
 *
 * 6. LOGOUT
 *    POST /api/auth/logout → Hapus token dari client
 *
 * ═════════════════════════════════════════════════════════════════════════════
 */
