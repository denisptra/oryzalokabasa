# 📝 POST ENDPOINTS - POSTMAN TESTING GUIDE

Panduan lengkap testing semua POST endpoints dengan Postman/Insomnia.

---

## 📋 DAFTAR POST ENDPOINTS

```
GET    /api/posts                              - List semua posts (PUBLIC)
GET    /api/posts?page=1&limit=10&status=PUBLISHED
GET    /api/post/:id                           - Get by ID (PUBLIC)
GET    /api/post/slug/:slug                    - Get by slug (PUBLIC)
GET    /api/posts/category/:categoryId         - Get by category (PUBLIC)
GET    /api/posts/search/:keyword              - Search (PUBLIC)
POST   /api/post/create                        - Create post (ADMIN+)
PUT    /api/post/update/:id                    - Update post (ADMIN+)
DELETE /api/post/delete/:id                    - Delete post (ADMIN+)
```

---

## 🔧 SETUP POSTMAN

### 1. Buat Collection Baru

```
1. Buka Postman
2. Click "Create" → "Collection"
3. Nama: "Oryza CMS - Post API"
4. Simpan
```

### 2. Setup Collection Variables (Optional tapi Recommended)

```
Collections → Variables

Name                  | Value
──────────────────────────────────────────
base_url              | http://localhost:5000/api
admin_token           | [akan diisi setelah login]
category_id           | [akan diisi setelah create category]
post_id               | [akan diisi setelah create post]
```

---

## ✅ TEST FLOW - STEP BY STEP

### STEP 0: Persiapan (Setup Data)

Sebelum test POST, pastikan ada:

1. Admin user yang sudah login
2. Category sudah dibuat
3. Admin token

**Langkah:**

- Login dulu ke endpoint `/api/auth/login`
- Copy token dari response
- Create category dulu di `/api/category/create`
- Copy category ID
- Baru test POST endpoints

---

### STEP 1: GET ALL POSTS (PUBLIC)

#### Request

```
Method: GET
URL: http://localhost:5000/api/posts
Query Params:
  - page: 1
  - limit: 10
  - status: PUBLISHED

Headers:
  - Content-Type: application/json

Body: (kosong)
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 0,
    "pages": 0
  }
}
```

**Notes:**

- Tidak butuh token (PUBLIC)
- `data` kosong karena belum ada post
- Bisa filter dengan: `?status=DRAFT` atau `?status=ARCHIVED`

---

### STEP 2: CREATE POST (PROTECTED)

#### Request

```
Method: POST
URL: http://localhost:5000/api/post/create
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "title": "Intro to Node.js",
  "content": "Node.js adalah runtime JavaScript yang berjalan di server. Dengan Node.js, Anda bisa membuat aplikasi backend dengan JavaScript.",
  "tags": "nodejs, javascript, backend",
  "categoryId": "[CATEGORY_ID]",
  "thumbnail": "/uploads/nodejs.jpg",
  "metaTitle": "Learn Node.js Basics",
  "metaDescription": "Tutorial lengkap Node.js untuk pemula"
}
```

#### Expected Response (201)

```json
{
  "status": "success",
  "message": "Post berhasil dibuat",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Intro to Node.js",
    "slug": "intro-to-nodejs",
    "content": "Node.js adalah runtime JavaScript...",
    "thumbnail": "/uploads/nodejs.jpg",
    "metaTitle": "Learn Node.js Basics",
    "metaDescription": "Tutorial lengkap Node.js untuk pemula",
    "tags": "nodejs, javascript, backend",
    "status": "DRAFT",
    "views": 0,
    "categoryId": "[CATEGORY_ID]",
    "authorId": "[ADMIN_ID]",
    "createdAt": "2024-02-27T22:15:30.123Z",
    "updatedAt": "2024-02-27T22:15:30.123Z",
    "category": {
      "id": "[CATEGORY_ID]",
      "name": "Teknologi",
      "slug": "teknologi"
    },
    "author": {
      "id": "[ADMIN_ID]",
      "name": "John Admin",
      "email": "john@example.com"
    }
  }
}
```

**Notes:**

- Butuh token ADMIN atau SUPER_ADMIN
- Slug otomatis generate dari title
- Status default: DRAFT (belum published)
- views default: 0
- Copy `id` untuk test endpoint lainnya

#### Error Cases

**404 - Category tidak ada:**

```json
{
  "status": "error",
  "message": "Category tidak ditemukan"
}
```

**403 - User tidak punya permission:**

```json
{
  "status": "error",
  "message": "Akses ditolak. Role 'ADMIN_ONLY' tidak memiliki izin..."
}
```

---

### STEP 3: GET ALL POSTS (Check yang baru dibuat)

#### Request

```
Method: GET
URL: http://localhost:5000/api/posts?status=DRAFT
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Intro to Node.js",
      "slug": "intro-to-nodejs",
      "tags": "nodejs, javascript, backend",
      "status": "DRAFT",
      "views": 0,
      "category": {
        "id": "[CATEGORY_ID]",
        "name": "Teknologi",
        "slug": "teknologi"
      },
      "author": {
        "id": "[ADMIN_ID]",
        "name": "John Admin"
      },
      "createdAt": "2024-02-27T22:15:30.123Z"
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

---

### STEP 4: GET POST BY ID

#### Request

```
Method: GET
URL: http://localhost:5000/api/post/550e8400-e29b-41d4-a716-446655440000
```

#### Expected Response (200)

```json
{
    "status": "success",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Intro to Node.js",
        "slug": "intro-to-nodejs",
        "content": "Node.js adalah runtime JavaScript...",
        "tags": "nodejs, javascript, backend",
        "status": "DRAFT",
        "views": 1,
        "category": {...},
        "author": {...},
        "createdAt": "2024-02-27T22:15:30.123Z",
        "updatedAt": "2024-02-27T22:15:30.123Z"
    }
}
```

**Notes:**

- Tidak butuh token (PUBLIC)
- Views otomatis bertambah +1 saat di-access
- Response lengkap dengan category & author info

---

### STEP 5: GET POST BY SLUG

#### Request

```
Method: GET
URL: http://localhost:5000/api/post/slug/intro-to-nodejs
```

#### Expected Response (200)

```json
{
    "status": "success",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Intro to Node.js",
        "slug": "intro-to-nodejs",
        "views": 2,
        ...
    }
}
```

**Notes:**

- Sama seperti GET by ID
- Menggunakan slug (URL-friendly) daripada ID
- Views bertambah lagi (sekarang 2)

---

### STEP 6: CREATE POST KEDUA (untuk testing lainnya)

#### Request

```
Method: POST
URL: http://localhost:5000/api/post/create
Authorization: Bearer [ADMIN_TOKEN]
Content-Type: application/json

Body:
```

```json
{
  "title": "Express.js Fundamentals",
  "content": "Express.js adalah framework web paling populer untuk Node.js. Express menyediakan fitur routing, middleware, dan banyak lagi.",
  "tags": "express, nodejs, framework, backend",
  "categoryId": "[CATEGORY_ID]",
  "status": "PUBLISHED"
}
```

**Notes:**

- Buat post lain untuk test search, filter, dll
- Kali ini status langsung PUBLISHED

---

### STEP 7: GET POSTS BY CATEGORY

#### Request

```
Method: GET
URL: http://localhost:5000/api/posts/category/[CATEGORY_ID]?page=1&limit=10
```

#### Expected Response (200)

```json
{
    "status": "success",
    "data": [
        {
            "id": "550e8400-...",
            "title": "Express.js Fundamentals",
            "slug": "expressjs-fundamentals",
            "tags": "express, nodejs, framework, backend",
            "status": "PUBLISHED",
            ...
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

- Filter posts berdasarkan category
- Hanya show PUBLISHED posts
- Public endpoint

---

### STEP 8: SEARCH POSTS

#### Request

```
Method: GET
URL: http://localhost:5000/api/posts/search/nodejs?page=1&limit=10
```

#### Expected Response (200)

```json
{
    "status": "success",
    "data": [
        {
            "id": "550e8400-...",
            "title": "Intro to Node.js",
            "slug": "intro-to-nodejs",
            "content": "Node.js adalah...",
            "tags": "nodejs, javascript, backend",
            ...
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

- Search di title, content, dan tags
- Case insensitive
- Hanya cari PUBLISHED posts
- Public endpoint

---

### STEP 9: UPDATE POST

#### Request

```
Method: PUT
URL: http://localhost:5000/api/post/update/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer [ADMIN_TOKEN]
Content-Type: application/json

Body:
```

```json
{
  "title": "Node.js Complete Guide",
  "tags": "nodejs, javascript, tutorial",
  "status": "PUBLISHED"
}
```

#### Expected Response (200)

```json
{
    "status": "success",
    "message": "Post berhasil diperbarui",
    "data": {
        "id": "550e8400-...",
        "title": "Node.js Complete Guide",
        "slug": "node-js-complete-guide",
        "tags": "nodejs, javascript, tutorial",
        "status": "PUBLISHED",
        "updatedAt": "2024-02-27T22:25:45.123Z",
        ...
    }
}
```

**Notes:**

- Butuh token (ADMIN+)
- Slug otomatis update jika title berubah
- Hanya kirim field yang mau diubah
- Semua field optional

#### Partial Update Examples

**Contoh 1: Update hanya status**

```json
{
  "status": "ARCHIVED"
}
```

**Contoh 2: Update hanya content**

```json
{
  "content": "Updated content here..."
}
```

**Contoh 3: Update meta tags**

```json
{
  "metaTitle": "New Meta Title",
  "metaDescription": "New meta description"
}
```

---

### STEP 10: DELETE POST

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/post/delete/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer [ADMIN_TOKEN]
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Post berhasil dihapus"
}
```

**Notes:**

- Butuh token (ADMIN+)
- Post akan dihapus permanent
- Tidak bisa di-recover

#### Error Case

**404 - Post tidak ada:**

```json
{
  "status": "error",
  "message": "Post tidak ditemukan"
}
```

---

## 🧪 COMPLETE TEST SCENARIOS

### Scenario 1: Admin membuat draft post

```
1. Login → dapatkan token
2. Create category (jika belum ada)
3. POST /post/create dengan status: DRAFT
4. GET /posts?status=DRAFT → verify post ada
5. GET /post/:id → lihat detail
```

### Scenario 2: Publish post dan search

```
1. Create post dengan status DRAFT
2. PUT /post/update/:id dengan status: PUBLISHED
3. GET /posts?status=PUBLISHED → verify published
4. GET /post/slug/:slug → verify via slug
5. GET /posts/search/keyword → search
6. GET /posts/category/:id → filter category
```

### Scenario 3: Edit post dengan partial update

```
1. Create post
2. PUT /post/update/:id {title: "new title"}
3. Verify title berubah, slug auto-update
4. PUT /post/update/:id {tags: "new, tags"}
5. Verify tags berubah
```

### Scenario 4: Views tracking

```
1. Create post
2. GET /post/:id → views: 0 → 1
3. GET /post/:id → views: 1 → 2
4. GET /post/slug/:slug → views: 2 → 3
5. Verify views increment setiap akses
```

---

## 🔑 IMPORTANT NOTES

### Tags Format

Input: String dengan separator koma

```
Input: "nodejs, javascript, backend"
Output DB: "nodejs, javascript, backend"
Output API: "nodejs, javascript, backend"
```

Parse di frontend:

```javascript
const tags = post.tags?.split(",").map((t) => t.trim()) ?? [];
// Result: ["nodejs", "javascript", "backend"]
```

### Status Types

```
DRAFT      - Post belum dipublish
PUBLISHED  - Post aktif dan bisa dilihat
ARCHIVED   - Post disembunyikan tapi tidak dihapus
```

### Slug Rules

- Auto-generate dari title
- Lowercase & URL-friendly
- Unique di database
- Auto-add timestamp jika duplikat
  - Contoh: "node-js-1708975530000"

### Views Increment

- Auto increment saat POST di-access via:
  - `GET /post/:id`
  - `GET /post/slug/:slug`
- Tidak increment di GET `/posts` atau `/posts/search`

###Authorization

```
Endpoint                    Required
──────────────────────────────────────────
GET /posts                  ❌ Public
GET /post/:id               ❌ Public
GET /post/slug/:slug        ❌ Public
GET /posts/category/:id     ❌ Public
GET /posts/search/:keyword  ❌ Public
POST /post/create           ✅ ADMIN+
PUT /post/update/:id        ✅ ADMIN+
DELETE /post/delete/:id     ✅ ADMIN+
```

---

## 🐛 TROUBLESHOOTING

### Error: 404 "Post tidak ditemukan"

**Solusi:**

- Cek ID/slug benar
- POST sudah dibuat
- Status PUBLISHED (untuk search)

### Error: 403 "Akses ditolak"

**Solusi:**

- Loginkan token
- User role harus ADMIN atau SUPER_ADMIN
- Token tidak expired

### Error: "categoryId tidak valid"

**Solusi:**

- Category harus sudah ada
- Gunakan ID yang benar
- Create category dulu

### Error: Slug duplikat

**Solusi:**

- Otomatis handle dengan timestamp
- Tidak perlu khawatir

### Views tidak increment

**Solusi:**

- Hanya increment di GET by ID atau slug
- Bukan di GET list
- Cek response views field

---

## 📚 POSTMAN COLLECTION EXPORT

Bisa langsung import JSON di Postman:

```json
{
  "info": {
    "name": "Oryza CMS - Post API",
    "description": "Testing koleksi untuk Post endpoints"
  },
  "item": [
    {
      "name": "Get All Posts",
      "request": {
        "method": "GET",
        "url": "{{base_url}}/posts"
      }
    },
    {
      "name": "Create Post",
      "request": {
        "method": "POST",
        "url": "{{base_url}}/post/create",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{admin_token}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"title\": \"Sample Post\",\n  \"content\": \"...\",\n  \"categoryId\": \"{{category_id}}\"\n}"
        }
      }
    }
  ]
}
```

---

## ✅ CHECKLIST

- [ ] Postman sudah install
- [ ] Collection sudah buat
- [ ] Login & dapat token
- [ ] Create category
- [ ] Test create post
- [ ] Test get all posts
- [ ] Test get by ID
- [ ] Test get by slug
- [ ] Test search
- [ ] Test update
- [ ] Test delete

---

**Happy Testing! 🚀**

Semua endpoints siap ditest di Postman/Insomnia. Follow step-by-step flow untuk hasil terbaik!
