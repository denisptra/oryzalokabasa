# 📧 CONTACT MESSAGE ENDPOINTS - POSTMAN TESTING GUIDE

Panduan lengkap testing semua Contact Message endpoints dengan Postman/Insomnia.

---

## 📋 DAFTAR CONTACT ENDPOINTS

```
POST   /api/contact/send                 - Send contact message (PUBLIC)
GET    /api/contact/messages             - Get all messages (ADMIN+)
GET    /api/contact/stats                - Get statistics (ADMIN+)
GET    /api/contact/:id                  - Get message detail (ADMIN+)
PUT    /api/contact/mark-read/:id        - Mark as READ (ADMIN+)
PUT    /api/contact/archive/:id          - Mark as ARCHIVED (ADMIN+)
DELETE /api/contact/delete/:id           - Delete message (SUPER_ADMIN)
```

---

## 🔧 SETUP POSTMAN

### 1. Collection Variables Setup

Tambahkan ke Postman Collection Variables:

```
base_url              | http://localhost:5000/api
admin_token           | [akan diisi setelah login]
contact_message_id    | [akan diisi setelah submit kontak]
```

---

## ✅ TEST FLOW - STEP BY STEP

### STEP 0: Persiapan

Sebelum test Contact Message, pastikan ada:

1. Server running di `http://localhost:5000`
2. Admin user sudah login dan punya token
3. Token belum expired

**Langkah:**

- Login ke endpoint `/api/auth/login`
- Copy token dari response
- Paste ke variable `admin_token` di Postman

---

### STEP 1: SEND CONTACT MESSAGE (PUBLIC)

#### Request

```
Method: POST
URL: http://localhost:5000/api/contact/send
Headers:
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "topic": "Pertanyaan tentang blog",
  "message": "Halo, saya mau bertanya tentang cara membuat blog yang bagus. Apakah ada tutorial?"
}
```

#### Expected Response (201)

```json
{
  "status": "success",
  "message": "Pesan Anda berhasil dikirim. Terima kasih!",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "topic": "Pertanyaan tentang blog",
    "message": "Halo, saya mau bertanya...",
    "status": "UNREAD",
    "ipAddress": "127.0.0.1",
    "createdAt": "2024-02-28T10:30:45.123Z"
  }
}
```

**Notes:**

- Tidak perlu token (PUBLIC endpoint)
- Validasi email otomatis
- Status default: UNREAD
- IP address tercatat otomatis
- Copy `id` untuk test endpoint lainnya

#### Error Cases

**400 - Field kosong:**

```json
{
  "status": "error",
  "message": "Field name, email, topic, dan message tidak boleh kosong"
}
```

**400 - Email tidak valid:**

```json
{
  "status": "error",
  "message": "Format email tidak valid"
}
```

**400 - Message terlalu pendek:**

```json
{
  "status": "error",
  "message": "Pesan minimal 10 karakter"
}
```

---

### STEP 2: GET ALL MESSAGES (Admin Only)

#### Request

```
Method: GET
URL: http://localhost:5000/api/contact/messages
Query Params:
  - page: 1
  - limit: 10
  - status: UNREAD

Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "john@example.com",
      "topic": "Pertanyaan tentang blog",
      "message": "Halo, saya mau bertanya...",
      "status": "UNREAD",
      "ipAddress": "127.0.0.1",
      "createdAt": "2024-02-28T10:30:45.123Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

**Notes:**

- Butuh token ADMIN atau SUPER_ADMIN
- Query param `status` filter: UNREAD, READ, ARCHIVED
- Default status: UNREAD (hanya show unread messages)
- Pagination: offset-limit based
- Sorted by createdAt DESC (newest first)

---

### STEP 3: GET MESSAGE STATISTICS

#### Request

```
Method: GET
URL: http://localhost:5000/api/contact/stats
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "summary": {
      "total": 5,
      "unread": 2,
      "read": 2,
      "archived": 1
    },
    "recentMessages": [
      {
        "id": "550e8400-...",
        "name": "John Doe",
        "email": "john@example.com",
        "topic": "Pertanyaan",
        "status": "UNREAD",
        "createdAt": "2024-02-28T10:30:45.123Z"
      },
      {
        "id": "660e8400-...",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "topic": "Complaint",
        "status": "READ",
        "createdAt": "2024-02-28T09:15:30.123Z"
      }
    ]
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Menampilkan summary statistik: total, unread, read, archived
- 5 pesan terbaru otomatis di-include
- Useful untuk dashboard admin

---

### STEP 4: GET MESSAGE DETAIL

#### Request

```
Method: GET
URL: http://localhost:5000/api/contact/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "topic": "Pertanyaan tentang blog",
    "message": "Halo, saya mau bertanya tentang cara membuat blog yang bagus. Apakah ada tutorial?",
    "status": "READ",
    "ipAddress": "127.0.0.1",
    "createdAt": "2024-02-28T10:30:45.123Z"
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Status otomatis berubah ke READ
- Menampilkan full message content
- IP address berguna untuk moderation

#### Error Case

**404 - Message tidak ada:**

```json
{
  "status": "error",
  "message": "Pesan tidak ditemukan"
}
```

---

### STEP 5: MARK MESSAGE AS READ

#### Request

```
Method: PUT
URL: http://localhost:5000/api/contact/mark-read/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body: (kosong)
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Pesan ditandai sebagai sudah dibaca",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "topic": "Pertanyaan tentang blog",
    "message": "...",
    "status": "READ",
    "ipAddress": "127.0.0.1",
    "createdAt": "2024-02-28T10:30:45.123Z"
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Explicit mark as READ
- Activity di-log untuk audit trail
- State berubah dari UNREAD → READ

---

### STEP 6: ARCHIVE MESSAGE

#### Request

```
Method: PUT
URL: http://localhost:5000/api/contact/archive/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body: (kosong)
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Pesan diarsip",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "topic": "Pertanyaan tentang blog",
    "message": "...",
    "status": "ARCHIVED",
    "ipAddress": "127.0.0.1",
    "createdAt": "2024-02-28T10:30:45.123Z"
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Untuk organize/hide pesan lama
- Pesan masih ada di database, hanya hidden
- Activity di-log

---

### STEP 7: DELETE MESSAGE (SUPER_ADMIN ONLY)

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/contact/delete/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Pesan berhasil dihapus"
}
```

**Notes:**

- Hanya SUPER_ADMIN bisa delete
- Permanent deletion - tidak bisa di-recover
- Activity di-log dengan deleted_title

#### Error Cases

**403 - User tidak punya permission:**

```json
{
  "status": "error",
  "message": "Akses ditolak. Role 'ADMIN' tidak memiliki izin untuk aksi ini. Hanya 'SUPER_ADMIN' yang diizinkan."
}
```

**404 - Message tidak ada:**

```json
{
  "status": "error",
  "message": "Pesan tidak ditemukan"
}
```

---

## 🧪 COMPLETE TEST SCENARIOS

### Scenario 1: Visitor mengirim kontak + Admin lihat

```
1. POST /contact/send (PUBLIC) → submit form
2. GET /contact/stats → lihat ada 1 unread message
3. GET /contact/messages?status=UNREAD → lihat daftar
4. GET /contact/:id → admin baca detail (auto READ)
```

### Scenario 2: Organize messages dengan status

```
1. POST /contact/send → submit multiple messages
2. GET /contact/messages?status=UNREAD → lihat unread
3. PUT /contact/mark-read/:id → tandai sudah dibaca
4. GET /contact/messages?status=READ → verify status changed
5. PUT /contact/archive/:id → arsip pesan lama
6. GET /contact/messages?status=ARCHIVED → verify archived
```

### Scenario 3: Admin dashboard flow

```
1. Login → dapatkan admin token
2. GET /contact/stats → tampilkan di dashboard
3. GET /contact/messages?page=1&limit=10 → show unread list
4. GET /contact/:id → detail view
5. PUT /contact/mark-read/:id → quick action
```

### Scenario 4: Super admin cleanup

```
1. GET /contact/messages?status=ARCHIVED → list all archived
2. DELETE /contact/delete/:id → delete old/spam messages
3. GET /contact/stats → verify count decreased
```

---

## 🔑 IMPORTANT NOTES

### Email Validation

```
Accepted: john@example.com, user+tag@domain.co.uk
Rejected: john@, @example.com, john.example.com, john @example.com
```

### Message Status Types

```
UNREAD    - Pesan baru belum dibaca
READ      - Admin sudah baca
ARCHIVED  - Disembunyikan tapi tidak dihapus
```

### Validation Rules

```
Field       | Rules
────────────┼──────────────────────────
name        | Required, tidak boleh kosong
email       | Required, format valid, unique optional
topic       | Required, tidak boleh kosong
message     | Required, minimal 10 karakter
```

### Authorization

```
Endpoint                    | Required
────────────────────────────┼─────────────────
POST /contact/send          | ❌ Public
GET /contact/messages       | ✅ ADMIN+
GET /contact/stats          | ✅ ADMIN+
GET /contact/:id            | ✅ ADMIN+
PUT /contact/mark-read/:id  | ✅ ADMIN+
PUT /contact/archive/:id    | ✅ ADMIN+
DELETE /contact/delete/:id  | ✅ SUPER_ADMIN only
```

---

## 🐛 TROUBLESHOOTING

### Error: 401 "Token tidak valid"

**Solusi:**

- Token expired → login ulang
- Token format salah → pastikan "Bearer [token]"
- Token tidak ada → copy dari login response

### Error: 403 "Akses ditolak"

**Solusi:**

- User role hanya ADMIN, delete butuh SUPER_ADMIN
- Gunakan SUPER_ADMIN token untuk delete
- Cek permission di FINAL_SUMMARY.md

### Error: "Field ... tidak boleh kosong"

**Solusi:**

- Pastikan kirim semua field: name, email, topic, message
- Jangan ada field kosong

### Error: "Format email tidak valid"

**Solusi:**

- Email harus ada @ dan domain
- Contoh valid: user@example.com

### Error: 404 "Pesan tidak ditemukan"

**Solusi:**

- ID pesan salah → check dari GET /messages
- Pesan sudah dihapus → cek database

---

## 📊 RESPONSE STATUS CODES

```
200 OK              - Request berhasil
201 Created         - Resource berhasil dibuat
400 Bad Request     - Error di validation/input
401 Unauthorized    - Token missing/invalid
403 Forbidden       - Permission denied
404 Not Found       - Resource tidak ada
500 Server Error    - Error di server
```

---

## ✅ TESTING CHECKLIST

```
BASIC FLOW:
  [ ] Send contact message (PUBLIC)
  [ ] Get all messages (ADMIN)
  [ ] Get message detail (auto READ)
  [ ] Mark as read explicitly
  [ ] Archive message
  [ ] Delete message (SUPER_ADMIN)
  [ ] Get statistics

ERROR HANDLING:
  [ ] Send with missing field → 400
  [ ] Send with invalid email → 400
  [ ] Get without token → 401
  [ ] Delete with ADMIN token → 403
  [ ] Get non-existent message → 404

PAGINATION:
  [ ] GET /messages?page=1&limit=5
  [ ] GET /messages?page=2&limit=10
  [ ] Total count matches pagination

STATUS FILTERING:
  [ ] GET /messages?status=UNREAD
  [ ] GET /messages?status=READ
  [ ] GET /messages?status=ARCHIVED
```

---

## 📚 API DOCUMENTATION

Lihat file lengkap di:

- **API_DOCUMENTATION.js** - Semua endpoints reference
- **RBAC_EXPLANATION.js** - Role system explanation
- **FINAL_SUMMARY.md** - Project overview

---

**Happy Testing! 🚀**

Semua contact endpoints siap ditest di Postman. Follow step-by-step flow untuk testing yang optimal!
