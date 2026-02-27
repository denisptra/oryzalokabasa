/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                        API TESTING GUIDE                                  ║
 * ║        Cara Testing Semua Endpoints dengan Postman/Insomnia              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * Catatan: Ganti BASE_URL dengan http://localhost:3000 atau URL server Anda
 * Ganti [token] dengan token yang Anda dapatkan setelah login
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 1: REGISTER USER BARU (ADMIN)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Request:
 * ───────
 * POST http://localhost:3000/api/auth/register
 * Content-Type: application/json
 *
 * Body:
 * ─────
 * {
 *     "name": "John Admin",
 *     "email": "john.admin@example.com",
 *     "password": "SecurePass123!"
 * }
 *
 * Expected Response (201):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Registrasi berhasil. Silakan login.",
 *     "data": {
 *         "id": "uuid",
 *         "name": "John Admin",
 *         "email": "john.admin@example.com",
 *         "role": "ADMIN"
 *     }
 * }
 *
 * Notes:
 * ──────
 * ✓ User berhasil dibuat dengan role ADMIN
 * ✓ Password sudah di-hash
 * ✓ Belum bisa akses endpoints yang butuh token
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 2: LOGIN SEBAGAI ADMIN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Request:
 * ───────
 * POST http://localhost:3000/api/auth/login
 * Content-Type: application/json
 *
 * Body:
 * ─────
 * {
 *     "email": "john.admin@example.com",
 *     "password": "SecurePass123!"
 * }
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Login berhasil",
 *     "data": {
 *         "id": "uuid",
 *         "name": "John Admin",
 *         "email": "john.admin@example.com",
 *         "role": "ADMIN"
 *     },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Notes:
 * ──────
 * ✓ Dapatkan token dari response
 * ✓ SIMPAN TOKEN INI untuk request berikutnya
 * ✓ Token berlaku 1 hari
 * ✓ Format: Authorization: Bearer [token]
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 3: TEST CATEGORY ENDPOINTS (ADMIN)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 3.1 GET ALL CATEGORIES (PUBLIC - tidak perlu token)
 * ────────────────────────────────────────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/categories
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "data": []  // Kosong karena belum ada kategori
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 3.2 CREATE CATEGORY (ADMIN - butuh token)
 * ──────────────────────────────────────────
 * Request:
 * ───────
 * POST http://localhost:3000/api/category/create
 * Content-Type: application/json
 * Authorization: Bearer [token]
 *
 * Body:
 * ─────
 * {
 *     "name": "Teknologi"
 * }
 *
 * Expected Response (201):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Kategori berhasil dibuat",
 *     "data": {
 *         "id": "uuid",
 *         "name": "Teknologi",
 *         "slug": "teknologi"
 *     }
 * }
 *
 * Notes:
 * ──────
 * ✓ ADMIN bisa create kategori
 * ✓ Slug otomatis generate dari name
 * ✓ Selalu gunakan Bearer [token] di header Authorization
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 3.3 CREATE CATEGORY KEDUA
 * ──────────────────────────
 * Request:
 * ───────
 * POST http://localhost:3000/api/category/create
 * Content-Type: application/json
 * Authorization: Bearer [token]
 *
 * Body:
 * ─────
 * {
 *     "name": "Olahraga"
 * }
 *
 * Expected Response (201): Kategori berhasil dibuat dengan slug "olahraga"
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 3.4 GET ALL CATEGORIES LAGI (Check)
 * ────────────────────────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/categories
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "data": [
 *         { "id": "uuid", "name": "Teknologi", "slug": "teknologi" },
 *         { "id": "uuid", "name": "Olahraga", "slug": "olahraga" }
 *     ]
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 3.5 UPDATE CATEGORY
 * ───────────────────
 * Request:
 * ───────
 * PUT http://localhost:3000/api/category/update/[kategori-id]
 * Content-Type: application/json
 * Authorization: Bearer [token]
 *
 * Body:
 * ─────
 * {
 *     "name": "Teknologi Terkini",
 *     "old_name": "Teknologi"
 * }
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Kategori berhasil diubah",
 *     "data": {
 *         "id": "uuid",
 *         "name": "Teknologi Terkini",
 *         "slug": "teknologi-terkini"
 *     }
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 3.6 DELETE CATEGORY
 * ───────────────────
 * Request:
 * ───────
 * DELETE http://localhost:3000/api/category/delete/[kategori-id]
 * Authorization: Bearer [token]
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Kategori berhasil dihapus"
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 4: TEST ADMIN CANNOT ACCESS USER ENDPOINTS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Request:
 * ───────
 * GET http://localhost:3000/api/users
 * Authorization: Bearer [token-admin]
 *
 * Expected Response (403):
 * ────────────────────────
 * {
 *     "status": "error",
 *     "message": "Akses ditolak. Role 'ADMIN' tidak memiliki izin mengakses resource ini."
 * }
 *
 * Notes:
 * ──────
 * ✓ ADMIN tidak bisa akses user endpoints
 * ✓ Ini adalah behavior yang sesuai
 * ✓ Hanya SUPER_ADMIN yang bisa
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 5: SETUP SUPER_ADMIN (Manual via Database)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Karena belum ada SUPER_ADMIN pertama, kita perlu setup secara manual:
 *
 * 1. Buka database Anda (PostgreSQL, MySQL, etc)
 * 2. Query:
 *
 *    UPDATE users
 *    SET role = 'SUPER_ADMIN'
 *    WHERE email = 'john.admin@example.com';
 *
 * 3. Atau langsung di code sebelum deploy:
 *    - Edit auth.service.js, baris 39
 *    - Change: const userRole = data.role === 'SUPER_ADMIN' ? 'ADMIN' : (data.role || 'ADMIN');
 *    - To: const userRole = 'SUPER_ADMIN'; // Temporary for setup
 *    - Register new user
 *    - Revert back the code
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 6: LOGIN SEBAGAI SUPER_ADMIN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Request:
 * ───────
 * POST http://localhost:3000/api/auth/login
 * Content-Type: application/json
 *
 * Body:
 * ─────
 * {
 *     "email": "john.admin@example.com",
 *     "password": "SecurePass123!"
 * }
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Login berhasil",
 *     "data": {
 *         "id": "uuid",
 *         "name": "John Admin",
 *         "email": "john.admin@example.com",
 *         "role": "SUPER_ADMIN"  ← SEKARANG SUPER_ADMIN!
 *     },
 *     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 * }
 *
 * Notes:
 * ──────
 * ✓ SIMPAN TOKEN SUPER_ADMIN INI
 * ✓ Role sudah berubah menjadi SUPER_ADMIN
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 7: TEST USER ENDPOINTS (SUPER_ADMIN)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 7.1 GET ALL USERS
 * ─────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/users
 * Authorization: Bearer [token-super-admin]
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "data": [
 *         {
 *             "id": "uuid",
 *             "name": "John Admin",
 *             "email": "john.admin@example.com",
 *             "role": "SUPER_ADMIN",
 *             "createdAt": "2024-01-15T10:30:00Z"
 *         }
 *     ]
 * }
 *
 * Notes:
 * ──────
 * ✓ SUPER_ADMIN bisa lihat semua user
 * ✓ Ada 1 user: diri sendiri
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 7.2 CREATE USER BARU
 * ───────────────────
 * Request:
 * ───────
 * POST http://localhost:3000/api/user/create
 * Content-Type: application/json
 * Authorization: Bearer [token-super-admin]
 *
 * Body:
 * ─────
 * {
 *     "name": "Jane Admin",
 *     "email": "jane.admin@example.com",
 *     "password": "AnotherSecure123!",
 *     "role": "ADMIN"
 * }
 *
 * Expected Response (201):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "User berhasil dibuat",
 *     "data": {
 *         "id": "uuid",
 *         "name": "Jane Admin",
 *         "email": "jane.admin@example.com",
 *         "role": "ADMIN"
 *     }
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 7.3 CREATE SUPER_ADMIN BARU
 * ────────────────────────────
 * Request:
 * ───────
 * POST http://localhost:3000/api/user/create
 * Content-Type: application/json
 * Authorization: Bearer [token-super-admin]
 *
 * Body:
 * ─────
 * {
 *     "name": "Bob Super Admin",
 *     "email": "bob.super@example.com",
 *     "password": "SuperSecret123!",
 *     "role": "SUPER_ADMIN"
 * }
 *
 * Expected Response (201):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "User berhasil dibuat",
 *     "data": {
 *         "id": "uuid",
 *         "name": "Bob Super Admin",
 *         "email": "bob.super@example.com",
 *         "role": "SUPER_ADMIN"
 *     }
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 7.4 UPDATE USER (CHANGE ROLE)
 * ─────────────────────────────
 * Request:
 * ───────
 * PUT http://localhost:3000/api/user/update/[jane-user-id]
 * Content-Type: application/json
 * Authorization: Bearer [token-super-admin]
 *
 * Body:
 * ─────
 * {
 *     "role": "SUPER_ADMIN"
 * }
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "User berhasil diperbarui",
 *     "data": {
 *         "id": "uuid",
 *         "name": "Jane Admin",
 *         "email": "jane.admin@example.com",
 *         "role": "SUPER_ADMIN"  ← ROLE CHANGED!
 *     }
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 7.5 DELETE USER
 * ───────────────
 * Request:
 * ───────
 * DELETE http://localhost:3000/api/user/delete/[user-id]
 * Authorization: Bearer [token-super-admin]
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "User berhasil dihapus"
 * }
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * STEP 8: TEST LOG ENDPOINTS (SUPER_ADMIN)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * 8.1 GET ALL LOGS
 * ────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/logs?page=1&limit=50
 * Authorization: Bearer [token-super-admin]
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "data": [
 *         {
 *             "id": "uuid",
 *             "userId": "uuid",
 *             "user": {
 *                 "id": "uuid",
 *                 "name": "John Admin",
 *                 "email": "john.admin@example.com",
 *                 "role": "SUPER_ADMIN"
 *             },
 *             "action": "LOGIN",
 *             "module": "AUTH",
 *             "entityId": "uuid",
 *             "details": { "email": "...", "role": "SUPER_ADMIN", "login_at": "..." },
 *             "userAgent": "Mozilla/5.0...",
 *             "ipAddress": "127.0.0.1",
 *             "createdAt": "2024-01-15T10:30:00Z"
 *         },
 *         {
 *             "action": "REGISTER",
 *             "module": "AUTH",
 *             ...
 *         },
 *         ...
 *     ],
 *     "pagination": {
 *         "page": 1,
 *         "limit": 50,
 *         "total": 5,
 *         "pages": 1
 *     }
 * }
 *
 * Notes:
 * ──────
 * ✓ Semua aktivitas tercatat di log
 * ✓ Termasuk: REGISTER, LOGIN, CREATE, UPDATE, DELETE
 * ✓ Bisa filter: ?module=AUTH&action=LOGIN
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 8.2 GET LOGS BY USER
 * ────────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/logs/user/[user-id]?page=1&limit=50
 * Authorization: Bearer [token-super-admin]
 *
 * Expected Response (200): List log hanya dari user tersebut
 *
 * ════════════════════════════════════════════════════════════════════════════
 * STEP 9: TEST LOGOUT
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * Request:
 * ───────
 * POST http://localhost:3000/api/auth/logout
 * Authorization: Bearer [token]
 *
 * Expected Response (200):
 * ────────────────────────
 * {
 *     "status": "success",
 *     "message": "Logout berhasil. Hapus token dari client Anda."
 * }
 *
 * Notes:
 * ──────
 * ✓ Logout tercatat di log
 * ✓ Hapus token dari client setelah logout
 * ✓ Untuk akses lagi, harus login ulang
 *
 * ═════════════════════════════════════════════════════════════════════════════
 * STEP 10: ERROR TESTING
 * ═════════════════════════════════════════════════════════════════════════════
 *
 * 10.1 Test Invalid Token
 * ────────────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/users
 * Authorization: Bearer invalid-token
 *
 * Expected Response (403):
 * ────────────────────────
 * {
 *     "status": "error",
 *     "message": "Token cacat atau tidak dikenali"
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 10.2 Test No Token
 * ──────────────────
 * Request:
 * ───────
 * GET http://localhost:3000/api/users
 * (No Authorization header)
 *
 * Expected Response (401):
 * ────────────────────────
 * {
 *     "status": "error",
 *     "message": "Akses ditolak, header Authorization tidak ditemukan"
 * }
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * 10.3 Test Duplicate Email
 * ─────────────────────────
 * Request:
 * ───────
 * POST http://localhost:3000/api/auth/register
 * Body:
 * {
 *     "name": "Another User",
 *     "email": "john.admin@example.com",  // Email sudah ada
 *     "password": "SecurePass123!"
 * }
 *
 * Expected Response (400):
 * ────────────────────────
 * {
 *     "status": "error",
 *     "message": "Email sudah terdaftar. Gunakan email lain atau login dengan email ini."
 * }
 *
 * ════════════════════════════════════════════════════════════════════════════
 * SUMMARY
 * ════════════════════════════════════════════════════════════════════════════
 *
 * Setelah mengikuti steps di atas, Anda sudah test:
 *
 * ✓ AUTH FLOW
 *   - Register user baru (default ADMIN)
 *   - Login user
 *   - Logout user
 *
 * ✓ CATEGORY MANAGEMENT (ADMIN)
 *   - Create category
 *   - Read categories (public)
 *   - Update category
 *   - Delete category
 *
 * ✓ USER MANAGEMENT (SUPER_ADMIN ONLY)
 *   - Admin TIDAK bisa akses → Error 403
 *   - Create user (ADMIN & SUPER_ADMIN)
 *   - Read users
 *   - Update user (including change role)
 *   - Delete user
 *
 * ✓ LOG/AUDIT TRAIL (SUPER_ADMIN ONLY)
 *   - View all logs dengan pagination
 *   - Filter logs by module & action
 *   - View logs by user
 *
 * ✓ ERROR HANDLING
 *   - Invalid token
 *   - No token
 *   - Duplicate email
 *   - Unauthorized access
 *
 * ════════════════════════════════════════════════════════════════════════════
 */
