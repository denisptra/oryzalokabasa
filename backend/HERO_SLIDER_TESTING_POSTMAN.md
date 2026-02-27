# 🎪 HERO SLIDER ENDPOINTS - POSTMAN TESTING GUIDE

Panduan lengkap testing Hero Slider (Banner Utama) endpoints dengan Postman/Insomnia.

---

## 📋 DAFTAR HERO SLIDER ENDPOINTS

```
GET    /api/hero-slider            - Get all sliders (PUBLIC)
GET    /api/hero-slider/active     - Get active sliders only (PUBLIC - untuk frontend)
GET    /api/hero-slider/:id        - Get slider detail (PUBLIC)
POST   /api/hero-slider/create     - Create slider (ADMIN+)
PUT    /api/hero-slider/update/:id - Update slider (ADMIN+)
PUT    /api/hero-slider/toggle/:id - Toggle active/inactive (ADMIN+)
PUT    /api/hero-slider/reorder    - Reorder sliders (ADMIN+)
DELETE /api/hero-slider/delete/:id - Delete slider (ADMIN+)
```

---

## 🔧 SETUP POSTMAN

### Collection Variables

```
base_url        | http://localhost:5000/api
admin_token     | [dari login]
slider_id       | [dari create]
```

---

## ✅ TEST FLOW - STEP BY STEP

### STEP 1: CREATE SLIDER

#### Request

```
Method: POST
URL: http://localhost:5000/api/hero-slider/create
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "title": "Selamat Datang di Website Kami",
  "subtitle": "Konten terbaik untuk Anda",
  "image": "/uploads/hero-banner-1.jpg",
  "link": "/posts",
  "isActive": true,
  "order": 1
}
```

#### Expected Response (201)

```json
{
  "status": "success",
  "message": "Slider berhasil dibuat",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Selamat Datang di Website Kami",
    "subtitle": "Konten terbaik untuk Anda",
    "image": "/uploads/hero-banner-1.jpg",
    "link": "/posts",
    "isActive": true,
    "order": 1
  }
}
```

**Notes:**

- Butuh token ADMIN+
- subtitle dan link optional
- isActive default: true
- order auto-increment jika kosong
- Activity di-log untuk audit

#### Error Cases

**400 - Missing required fields:**

```json
{
  "status": "error",
  "message": "Field title dan image tidak boleh kosong"
}
```

---

### STEP 2: GET ALL SLIDERS (Admin View)

#### Request

```
Method: GET
URL: http://localhost:5000/api/hero-slider
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Selamat Datang",
      "subtitle": "Konten terbaik",
      "image": "/uploads/hero-banner-1.jpg",
      "link": "/posts",
      "isActive": true,
      "order": 1
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Promo Spesial",
      "subtitle": "Diskon hingga 50%",
      "image": "/uploads/hero-banner-2.jpg",
      "link": "/promo",
      "isActive": false,
      "order": 2
    }
  ]
}
```

**Notes:**

- PUBLIC endpoint
- Include inactive sliders (untuk admin preview)
- Sorted by order (ascending)
- Useful untuk admin management

---

### STEP 3: GET ACTIVE SLIDERS (Frontend Only)

#### Request

```
Method: GET
URL: http://localhost:5000/api/hero-slider/active
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Selamat Datang",
      "subtitle": "Konten terbaik",
      "image": "/uploads/hero-banner-1.jpg",
      "link": "/posts",
      "isActive": true,
      "order": 1
    }
  ]
}
```

**Notes:**

- PUBLIC endpoint
- Show ONLY active sliders
- Untuk frontend carousel/banner display
- Sorted by order

---

### STEP 4: GET SLIDER DETAIL

#### Request

```
Method: GET
URL: http://localhost:5000/api/hero-slider/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Selamat Datang di Website Kami",
    "subtitle": "Konten terbaik untuk Anda",
    "image": "/uploads/hero-banner-1.jpg",
    "link": "/posts",
    "isActive": true,
    "order": 1
  }
}
```

**Notes:**

- PUBLIC endpoint
- Full details untuk modal/edit form

---

### STEP 5: UPDATE SLIDER

#### Request

```
Method: PUT
URL: http://localhost:5000/api/hero-slider/update/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON - partial update allowed):
```

```json
{
  "title": "Selamat Datang di Platform Kami",
  "subtitle": "Konten eksklusif menanti Anda",
  "image": "/uploads/hero-banner-1-updated.jpg"
}
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Slider berhasil diperbarui",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Selamat Datang di Platform Kami",
    "subtitle": "Konten eksklusif menanti Anda",
    "image": "/uploads/hero-banner-1-updated.jpg",
    "link": "/posts",
    "isActive": true,
    "order": 1
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Partial update - hanya kirim field yang mau diubah
- All fields optional
- Activity di-log

---

### STEP 6: TOGGLE SLIDER STATUS

#### Request

```
Method: PUT
URL: http://localhost:5000/api/hero-slider/toggle/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body: (kosong)
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Slider dinonaktifkan",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Selamat Datang",
    "subtitle": "Konten terbaik",
    "image": "/uploads/hero-banner-1.jpg",
    "link": "/posts",
    "isActive": false,
    "order": 1
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Quick toggle on/off tanpa full update
- Useful untuk enable/disable slider tanpa edit
- Message berubah sesuai status baru

---

### STEP 7: REORDER SLIDERS

#### Request

```
Method: PUT
URL: http://localhost:5000/api/hero-slider/reorder
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "order": 2
  },
  {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "order": 1
  },
  {
    "id": "770e8400-e29b-41d4-a716-446655440000",
    "order": 3
  }
]
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Urutan slider berhasil diperbarui",
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Promo Spesial",
      "isActive": true,
      "order": 1
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Selamat Datang",
      "isActive": true,
      "order": 2
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "title": "Flash Sale",
      "isActive": true,
      "order": 3
    }
  ]
}
```

**Notes:**

- Butuh token ADMIN+
- Array of {id, order}
- Useful untuk drag-drop reordering di admin
- Activity di-log

---

### STEP 8: DELETE SLIDER

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/hero-slider/delete/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Slider berhasil dihapus"
}
```

**Notes:**

- Butuh token ADMIN+
- Permanent deletion
- Activity di-log dengan deleted_title

---

## 🧪 COMPLETE TEST SCENARIOS

### Scenario 1: Basic slider management

```
1. POST /create → create slider 1
2. POST /create → create slider 2
3. POST /create → create slider 3
4. GET / → see all (sorted by order)
5. PUT /update/:id → edit slider
6. DELETE /delete/:id → remove slider
```

### Scenario 2: Frontend integration

```
1. POST /create (isActive: true) → create active slider
2. POST /create (isActive: false) → create inactive slider
3. GET /active → get only active (for carousel)
4. PUT /toggle/:id → activate inactive
5. GET /active → verify updated
```

### Scenario 3: Slider ordering

```
1. POST /create order: 1
2. POST /create order: 2
3. POST /create order: 3
4. GET / → verify order
5. PUT /reorder → swap order 1 & 2
6. GET / → verify new order
```

---

## 🔑 IMPORTANT NOTES

### Order System

```
Auto-increment: Jika order kosong, sistem auto-assign order
Manual: Atau bisa set manual saat create
Reorder: Update order multiple sliders sekaligus

Display: Selalu sorted by order ascending
```

### Active/Inactive Status

```
isActive: true   → Show di frontend
isActive: false  → Hide di frontend (admin only bisa lihat)

Useful untuk: Schedule slider tanpa perlu delete
```

### Image Path

```
Assumption: File sudah diupload ke public folder
Stored: Path saja (string) - /uploads/image.jpg
```

### Authorization

```
Endpoint              | Access
──────────────────────┼───────────
GET /                 | ❌ Public
GET /active           | ❌ Public
GET /:id              | ❌ Public
POST /create          | ✅ ADMIN+
PUT /update/:id       | ✅ ADMIN+
PUT /toggle/:id       | ✅ ADMIN+
PUT /reorder          | ✅ ADMIN+
DELETE /delete/:id    | ✅ ADMIN+
```

---

## ✅ TESTING CHECKLIST

```
CRUD OPERATIONS:
  [ ] Create slider
  [ ] Get all sliders
  [ ] Get active sliders only
  [ ] Get detail
  [ ] Update slider
  [ ] Delete slider

STATUS MANAGEMENT:
  [ ] Create with isActive: true
  [ ] Create with isActive: false
  [ ] Toggle active ↔ inactive
  [ ] Frontend GET /active shows correct set

ORDERING:
  [ ] Order auto-increment on create
  [ ] Manual order on create
  [ ] Reorder multiple
  [ ] GET / returns sorted by order

PERMISSIONS:
  [ ] GET endpoints don't need token
  [ ] POST/PUT/DELETE need ADMIN token
  [ ] Activity logged on mutations
```

---

**Happy Testing! 🚀**
