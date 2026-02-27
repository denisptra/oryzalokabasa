/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                    ROLE-BASED ACCESS CONTROL (RBAC)                      ║
 * ║                         PENJELASAN & PANDUAN                              ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 1. APA ITU RBAC?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * RBAC = Role-Based Access Control
 *
 * Sistem yang menentukan apa yang boleh dilakukan oleh user berdasarkan ROLE
 * mereka. Contoh:
 * - ADMIN bisa manage kategori
 * - SUPER_ADMIN bisa manage semua (termasuk user dan log)
 * - Login user bisa logout
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 2. ROLE DI SISTEM INI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ ADMIN                                                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ • Role default untuk user yang baru register                            │
 * │ • Tidak bisa di-request saat register (selalu ADMIN)                    │
 * │ • Bisa: CREATE, UPDATE, DELETE kategori                                 │
 * │ • TIDAK bisa: Manage user, lihat log                                    │
 * │ • Alasan pembatasan:                                                    │
 * │   - User management bisa change role (privilege tinggi)                 │
 * │   - Log berisi data sensitif (audit trail)                             │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ SUPER_ADMIN                                                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ • Role tertinggi dalam sistem                                           │
 * │ • Hanya bisa dibuat oleh SUPER_ADMIN (via CRUD user endpoint)           │
 * │ • Bisa: Semua yang bisa ADMIN lakukan                                   │
 * │ • Bisa: Manage user (create, read, update, delete)                      │
 * │ • Bisa: Lihat semua log (audit trail)                                   │
 * │ • Bisa: Change role user (ADMIN → SUPER_ADMIN atau sebaliknya)          │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 3. PERMISSION MATRIX (Apa saja yang bisa dilakukan)
 * ═══════════════════════════════════════════════════════════════════════════
 *
 *                         │  PUBLIC  │  ADMIN  │  SUPER_ADMIN
 * ────────────────────────┼──────────┼─────────┼──────────────
 * REGISTER                │    ✓     │    -    │      -
 * LOGIN                   │    ✓     │    -    │      -
 * LOGOUT                  │    ✗     │    ✓    │      ✓
 * ────────────────────────┼──────────┼─────────┼──────────────
 * GET CATEGORIES          │    ✓     │    ✓    │      ✓
 * GET CATEGORY BY ID      │    ✓     │    ✓    │      ✓
 * CREATE CATEGORY         │    ✗     │    ✓    │      ✓
 * UPDATE CATEGORY         │    ✗     │    ✓    │      ✓
 * DELETE CATEGORY         │    ✗     │    ✓    │      ✓
 * ────────────────────────┼──────────┼─────────┼──────────────
 * CREATE USER             │    ✗     │    ✗    │      ✓
 * GET ALL USERS           │    ✗     │    ✗    │      ✓
 * GET USER BY ID          │    ✗     │    ✗    │      ✓
 * UPDATE USER (incl role) │    ✗     │    ✗    │      ✓
 * DELETE USER             │    ✗     │    ✗    │      ✓
 * ────────────────────────┼──────────┼─────────┼──────────────
 * GET ALL LOGS            │    ✗     │    ✗    │      ✓
 * GET LOG BY ID           │    ✗     │    ✗    │      ✓
 * GET LOGS BY USER        │    ✗     │    ✗    │      ✓
 *
 * ✓ = Bisa akses
 * ✗ = Tidak bisa akses
 * - = Tidak berlaku
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 4. BAGAIMANA CARA KERJANYA?
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * ALUR FLOW:
 *
 * 1. CLIENT REGISTER
 *    ┌──────────────────────────────────────────────────────────┐
 *    │ POST /api/auth/register                                  │
 *    │ { name, email, password }                                │
 *    │                                                          │
 *    │ Server membuat user dengan role = ADMIN (default)        │
 *    │ Return: user data + role ADMIN                           │
 *    └──────────────────────────────────────────────────────────┘
 *
 * 2. CLIENT LOGIN
 *    ┌──────────────────────────────────────────────────────────┐
 *    │ POST /api/auth/login                                     │
 *    │ { email, password }                                      │
 *    │                                                          │
 *    │ Server validate email & password                         │
 *    │ Jika valid, generate JWT token berisi:                   │
 *    │   { id, email, role }                                    │
 *    │                                                          │
 *    │ Return: { user, token }                                  │
 *    │ Client simpan token di localStorage/sessionStorage       │
 *    └──────────────────────────────────────────────────────────┘
 *
 * 3. CLIENT AKSES PROTECTED ENDPOINT
 *    ┌──────────────────────────────────────────────────────────┐
 *    │ POST /api/category/create                                │
 *    │ Headers: Authorization: Bearer [token]                   │
 *    │ Body: { name: "Teknologi" }                              │
 *    │                                                          │
 *    │ MIDDLEWARE: authenticate                                 │
 *    │  ├─ Ambil token dari header Authorization                │
 *    │  ├─ Verify token (check JWT signature & expiry)          │
 *    │  ├─ Extract data: { id, email, role }                    │
 *    │  └─ Pasang ke req.user = { id, email, role }            │
 *    │                                                          │
 *    │ MIDDLEWARE: authorize(['ADMIN', 'SUPER_ADMIN'])          │
 *    │  ├─ Check apakah req.user.role ada di whitelist?         │
 *    │  └─ Jika tidak, return 403 Forbidden                     │
 *    │                                                          │
 *    │ CONTROLLER: createCategory                               │
 *    │  ├─ Buat kategori di database                            │
 *    │  └─ Catat log activity                                   │
 *    │                                                          │
 *    │ Return: { status, data }                                 │
 *    └──────────────────────────────────────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 5. MIDDLEWARE & SISTEM OTENTIKASI
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * A. AUTHENTICATE MIDDLEWARE (src/middleware/auth.js)
 *    Fungsi: Verifikasi apakah user sudah login
 *
 *    Proses:
 *    1. Cek header Authorization
 *    2. Ambil token dari "Authorization: Bearer [token]"
 *    3. Verify JWT token dengan JWT_SECRET
 *    4. Jika valid, extract data dan pasang ke req.user
 *    5. Jika tidak valid, return 401/403 error
 *
 *    Middleware ini REQUIRED untuk melindungi protected routes
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * B. AUTHORIZE MIDDLEWARE (src/middleware/role.js)
 *    Fungsi: Verifikasi apakah user role sesuai dengan requirement
 *
 *    Proses:
 *    1. Cek apakah req.user ada (harus authenticate first)
 *    2. Cek apakah req.user.role ada di whitelist
 *    3. Jika ada, lanjut ke next middleware
 *    4. Jika tidak, return 403 error
 *
 *    Usage:
 *    - authorize('SUPER_ADMIN') = hanya SUPER_ADMIN
 *    - authorize(['ADMIN', 'SUPER_ADMIN']) = ADMIN atau SUPER_ADMIN
 *
 *    Middleware ini OPTIONAL, tergantung requirement endpoint
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * C. VALIDATION MIDDLEWARE (src/middleware/validation.js)
 *    Fungsi: Validasi input dari client
 *
 *    Usage: validateRegister, validateLogin
 *
 * ─────────────────────────────────────────────────────────────────────────
 *
 * D. RATE LIMITER MIDDLEWARE (src/middleware/rateLimiter.js)
 *    Fungsi: Batasi jumlah request untuk mencegah brute force
 *
 *    Config:
 *    - Max 5 login attempts per 15 menit per IP
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 6. JWT TOKEN
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * JWT = JSON Web Token
 *
 * Format: [header].[payload].[signature]
 *
 * Contoh:
 * eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
 * eyJpZCI6InV1aWQiLCJlbWFpbCI6ImpvaG5AZXhhbXBsZS5jb20iLCJyb2xlIjoiQURNSU4ifQ.
 * [signature]
 *
 * Payload contains: { id, email, role, iat (issued at), exp (expiration) }
 *
 * Token berlaku 1 hari (86400 detik)
 * Setelah kadaluarsa, user harus login lagi
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 7. LOGGING SYSTEM
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Setiap aksi penting dicatat di database (Audit Trail):
 *
 * Recorded Actions:
 * - REGISTER: Kapan user baru register
 * - LOGIN: Kapan user login + role mereka
 * - LOGOUT: Kapan user logout
 * - CREATE CATEGORY: Siapa yang create kategori apa
 * - UPDATE CATEGORY: Siapa yang update kategori apa
 * - DELETE CATEGORY: Siapa yang delete kategori apa
 * - CREATE USER: Siapa yang create user apa
 * - UPDATE USER: Siapa yang update user (termasuk change role)
 * - DELETE USER: Siapa yang delete user
 *
 * Data yang dicatat:
 * - userId: Siapa yang melakukan aksi
 * - action: ACTION_NAME (CREATE, UPDATE, DELETE, LOGIN, dll)
 * - module: CATEGORY, USER, AUTH, dll
 * - entityId: ID dari resource yang dimanipulasi
 * - details: Data tambahan (JSON)
 * - userAgent: Browser/aplikasi yang digunakan
 * - ipAddress: IP address dari user
 * - createdAt: Kapan tercatat
 *
 * Hanya SUPER_ADMIN yang bisa akses log endpoints
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 8. CONTOH SKENARIO
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * SKENARIO 1: User baru register
 * ────────────────────────────────
 * 1. User lakukan: POST /api/auth/register dengan data baru
 * 2. Server: Buat user dengan role = ADMIN
 * 3. Server: Catat log { action: 'REGISTER', module: 'AUTH' }
 * 4. Server: Return user data + pesan "Silakan login"
 * 5. User: Sekarang punya akses ADMIN (bisa manage category)
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * SKENARIO 2: Admin coba akses user management
 * ──────────────────────────────────────────────
 * 1. ADMIN user login → dapatkan token
 * 2. ADMIN try: POST /api/user/create dengan body user baru
 * 3. Middleware authenticate: Valid token ✓
 * 4. Middleware authorize('SUPER_ADMIN'): Role ADMIN tidak di whitelist ✗
 * 5. Server: Return 403 Forbidden
 * 6. Server: Log activity: { action: 'UNAUTHORIZED_ACCESS', ... }
 * 7. ADMIN: Dapat error message
 *
 * ────────────────────────────────────────────────────────────────────────
 *
 * SKENARIO 3: Super admin promote admin ke super admin
 * ──────────────────────────────────────────────────────
 * 1. SUPER_ADMIN login → dapatkan token
 * 2. SUPER_ADMIN: GET /api/users → Lihat semua user
 * 3. SUPER_ADMIN: PUT /api/user/update/{adminUserId}
 *    Body: { role: "SUPER_ADMIN" }
 * 4. Middleware authenticate: Valid token ✓
 * 5. Middleware authorize('SUPER_ADMIN'): Role match ✓
 * 6. Controller: Update user role di database
 * 7. Server: Catat log { action: 'UPDATE', module: 'USER', ... }
 * 8. Server: Return updated user data
 * 9. User (yang tadi ADMIN): Sekarang punya akses SUPER_ADMIN
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 9. FLOWCHART AKSES CONTROL
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Request ke Protected Endpoint
 *        │
 *        ↓
 * ┌─────────────────────────┐
 * │ Ada Authorization Header?│ ──NO→ Return 401 Unauthorized
 * └────────┬────────────────┘
 *          │ YES
 *          ↓
 * ┌─────────────────────────┐
 * │ Token Valid & Not Expired│ ──NO→ Return 401/403 Token Error
 * └────────┬────────────────┘
 *          │ YES
 *          ↓
 * ┌─────────────────────────┐
 * │ Middleware: authenticate │
 * │ Set req.user = payload  │
 * └────────┬────────────────┘
 *          │
 *          ↓
 * ┌─────────────────────────┐
 * │ Ada authorize middleware?│ ──NO→ Lanjut ke controller
 * └────────┬────────────────┘
 *          │ YES
 *          ↓
 * ┌──────────────────────────┐
 * │ Role di whitelist?       │ ──NO→ Return 403 Forbidden
 * └────────┬─────────────────┘
 *          │ YES
 *          ↓
 * ┌──────────────────────────┐
 * │ Middleware: authorize    │
 * │ Grant access            │
 * └────────┬─────────────────┘
 *          │
 *          ↓
 * ┌──────────────────────────┐
 * │ Controller Function      │
 * │ Process Bisnis Logic    │
 * └────────┬─────────────────┘
 *          │
 *          ↓
 * ┌──────────────────────────┐
 * │ recordLog(...) Function  │
 * │ Catat ke database       │
 * └────────┬─────────────────┘
 *          │
 *          ↓
 * ┌──────────────────────────┐
 * │ Return Response ke Client│
 * └──────────────────────────┘
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * 10. TROUBLESHOOTING
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * Q: Admin tidak bisa akses category endpoint?
 * A: Pastikan:
 *    - Token valid dan belum expired
 *    - Header format: "Authorization: Bearer [token]"
 *    - Endpoint protected dengan authorize(['ADMIN', 'SUPER_ADMIN'])
 *
 * Q: SUPER_ADMIN tidak bisa akses user endpoint?
 * A: Kemungkinan:
 *    - Token expire → login ulang
 *    - Role di database bukan SUPER_ADMIN → update melalui admin lain
 *    - Syntax error di middleware
 *
 * Q: Token expired, apa yang harus dilakukan?
 * A: Client harus:
 *    - Hapus token lama dari localStorage
 *    - Send login request lagi
 *    - Simpan token baru
 *
 * Q: Bagaimana cara membuat user pertama SUPER_ADMIN?
 * A: Opsi:
 *    1. Direct edit database (update user SET role = 'SUPER_ADMIN')
 *    2. Ada SUPER_ADMIN lain yang promote user tersebut
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */
