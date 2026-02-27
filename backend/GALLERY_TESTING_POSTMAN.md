# 🖼️ GALLERY ENDPOINTS - POSTMAN TESTING GUIDE

Panduan lengkap testing Gallery (Galeri Foto) endpoints dengan Postman/Insomnia.

---

## 📋 DAFTAR GALLERY ENDPOINTS

```
GET    /api/gallery                         - Get all photos (PUBLIC)
GET    /api/gallery/stats                   - Get statistics (PUBLIC)
GET    /api/gallery/category/:categoryId    - Get photos by category (PUBLIC)
GET    /api/gallery/event/:eventDate        - Get photos by event date (PUBLIC)
GET    /api/gallery/:id                     - Get photo detail (PUBLIC)
POST   /api/gallery/upload                  - Upload photo (ADMIN+)
PUT    /api/gallery/update/:id              - Update photo info (ADMIN+)
DELETE /api/gallery/delete/:id              - Delete photo (ADMIN+)
```

---

## 🔧 SETUP POSTMAN

### Collection Variables

```
base_url              | http://localhost:5000/api
admin_token           | [dari login]
gallery_id            | [dari upload]
category_id           | [dari category list]
```

---

## ✅ TEST FLOW - STEP BY STEP

### STEP 1: GET ALL GALLERY PHOTOS

#### Request

```
Method: GET
URL: http://localhost:5000/api/gallery
Query Params:
  - page: 1
  - limit: 12
  - categoryId: (optional)

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
      "title": "Acara Keluarga Besar 2024",
      "image": "/uploads/family-event-001.jpg",
      "eventDate": "2024-02-15T00:00:00Z",
      "categoryId": "cat-123",
      "category": {
        "id": "cat-123",
        "name": "Event",
        "slug": "event"
      },
      "createdAt": "2024-02-28T10:30:45.123Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 5,
    "pages": 1
  }
}
```

**Notes:**

- PUBLIC endpoint
- Default limit: 12 (untuk grid display)
- Optional filter by categoryId
- Sorted newest first

---

### STEP 2: UPLOAD PHOTO

#### Request

```
Method: POST
URL: http://localhost:5000/api/gallery/upload
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "title": "Acara Turnamen 2024",
  "image": "/uploads/tournament-photo.jpg",
  "categoryId": "cat-123",
  "eventDate": "2024-02-25"
}
```

#### Expected Response (201)

```json
{
  "status": "success",
  "message": "Foto berhasil ditambahkan ke galeri",
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "title": "Acara Turnamen 2024",
    "image": "/uploads/tournament-photo.jpg",
    "eventDate": "2024-02-25T00:00:00Z",
    "categoryId": "cat-123",
    "category": {
      "id": "cat-123",
      "name": "Olahraga",
      "slug": "olahraga"
    },
    "createdAt": "2024-02-28T11:00:00.123Z"
  }
}
```

**Notes:**

- Butuh token ADMIN+
- eventDate optional
- Activity di-log untuk audit
- Category harus sudah ada

#### Error Cases

**400 - Missing field:**

```json
{
  "status": "error",
  "message": "Field title, image, dan categoryId tidak boleh kosong"
}
```

**404 - Category tidak ada:**

```json
{
  "status": "error",
  "message": "Category tidak ditemukan"
}
```

---

### STEP 3: GET GALLERY STATISTICS

#### Request

```
Method: GET
URL: http://localhost:5000/api/gallery/stats
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "summary": {
      "total": 15,
      "categories": [
        {
          "categoryId": "cat-123",
          "categoryName": "Event",
          "count": 8
        },
        {
          "categoryId": "cat-124",
          "categoryName": "Olahraga",
          "count": 7
        }
      ]
    },
    "recentPhotos": [
      {
        "id": "660e8400-...",
        "title": "Turnamen 2024",
        "image": "/uploads/...",
        "eventDate": "2024-02-25T00:00:00Z",
        "category": {
          "name": "Olahraga"
        },
        "createdAt": "2024-02-28T11:00:00.123Z"
      }
    ],
    "eventsThisMonth": [
      {
        "id": "660e8400-...",
        "title": "Monthly Meeting",
        "eventDate": "2024-02-20T00:00:00Z"
      }
    ]
  }
}
```

**Notes:**

- PUBLIC endpoint
- Summary + recent photos + events this month
- Useful untuk dashboard

---

### STEP 4: GET PHOTOS BY CATEGORY

#### Request

```
Method: GET
URL: http://localhost:5000/api/gallery/category/cat-123
Query Params:
  - page: 1
  - limit: 12

Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-...",
      "title": "Event Foto 1",
      "image": "/uploads/event1.jpg",
      "eventDate": "2024-02-15T00:00:00Z",
      "categoryId": "cat-123",
      "category": {
        "id": "cat-123",
        "name": "Event",
        "slug": "event"
      },
      "createdAt": "2024-02-28T10:30:45.123Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 8,
    "pages": 1
  }
}
```

**Notes:**

- Filter photos by specific category
- PUBLIC endpoint
- Same pagination as GET all

---

### STEP 5: GET PHOTOS BY EVENT DATE

#### Request

```
Method: GET
URL: http://localhost:5000/api/gallery/event/2024-02
Query Params:
  - page: 1
  - limit: 12

Headers:
  - Content-Type: application/json
```

**Date Format Options:**

- `/event/2024-02` - Semua foto di bulan Februari 2024
- `/event/2024-02-15` - Foto dari tanggal 15 Februari 2024

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-...",
      "title": "February Event",
      "image": "/uploads/feb-event.jpg",
      "eventDate": "2024-02-15T00:00:00Z",
      "categoryId": "cat-123",
      "createdAt": "2024-02-28T10:30:45.123Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 3,
    "pages": 1
  }
}
```

**Notes:**

- PUBLIC endpoint
- Useful untuk timeline/archive view
- Support both month (YYYY-MM) dan day (YYYY-MM-DD) format

---

### STEP 6: GET PHOTO DETAIL

#### Request

```
Method: GET
URL: http://localhost:5000/api/gallery/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Acara Turnamen 2024",
    "image": "/uploads/tournament-photo.jpg",
    "eventDate": "2024-02-25T00:00:00Z",
    "categoryId": "cat-123",
    "category": {
      "id": "cat-123",
      "name": "Olahraga",
      "slug": "olahraga"
    },
    "createdAt": "2024-02-28T11:00:00.123Z"
  }
}
```

**Notes:**

- PUBLIC endpoint
- Include category info lengkap
- For modal/detail view

---

### STEP 7: UPDATE PHOTO INFO

#### Request

```
Method: PUT
URL: http://localhost:5000/api/gallery/update/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON - partial update allowed):
```

```json
{
  "title": "Turnamen Final 2024",
  "eventDate": "2024-02-25",
  "categoryId": "cat-124"
}
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Foto berhasil diperbarui",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Turnamen Final 2024",
    "image": "/uploads/tournament-photo.jpg",
    "eventDate": "2024-02-25T00:00:00Z",
    "categoryId": "cat-124",
    "category": {
      "id": "cat-124",
      "name": "Kompetisi",
      "slug": "kompetisi"
    },
    "createdAt": "2024-02-28T11:00:00.123Z"
  }
}
```

**Notes:**

- Butuh token ADMIN+
- Partial update - hanya kirim field yang mau diubah
- All fields optional except categoryId (jika di-update)

---

### STEP 8: DELETE PHOTO

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/gallery/delete/550e8400-e29b-41d4-a716-446655440000
Headers:
  - Authorization: Bearer [ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Foto berhasil dihapus dari galeri"
}
```

**Notes:**

- Butuh token ADMIN+
- Permanent deletion
- Activity di-log dengan deleted_title

---

## 🧪 COMPLETE TEST SCENARIOS

### Scenario 1: Manage photo gallery

```
1. POST /upload → add new photo
2. GET / → list all photos
3. GET /stats → check statistics
4. GET :id → view detail
5. PUT /update/:id → update info
6. DELETE /delete/:id → remove photo
```

### Scenario 2: Filter by category

```
1. GET /category/cat-123 → see photos di kategori Event
2. GET /category/cat-124 → see photos di kategori Olahraga
3. Compare stats dari GET /stats
```

### Scenario 3: Event timeline

```
1. POST /upload dengan eventDate: 2024-02-15
2. POST /upload dengan eventDate: 2024-02-20
3. GET /event/2024-02 → see all February events
4. GET /event/2024-02-15 → see specific date
```

---

## 🔑 IMPORTANT NOTES

### Event Date Format

```
Format: YYYY-MM-DD atau YYYY-MM (untuk full month)
Examples:
  - "2024-02-15" → 15 Februari 2024
  - "2024-02" → Seluruh Februari 2024

Optional: Bisa null jika tidak ada event tertentu
```

### Image Path

```
Assumption: Upload file ke public folder dulu
Stored sebagai path: /uploads/filename.jpg

Di database disimpan as STRING (path saja, bukan file binary)
```

### Authorization

```
Endpoint                      | Access
──────────────────────────────┼─────────────
GET /gallery                  | ❌ Public
GET /gallery/stats            | ❌ Public
GET /gallery/category/:id     | ❌ Public
GET /gallery/event/:date      | ❌ Public
GET /gallery/:id              | ❌ Public
POST /upload                  | ✅ ADMIN+
PUT /update/:id               | ✅ ADMIN+
DELETE /delete/:id            | ✅ ADMIN+
```

---

## ✅ TESTING CHECKLIST

```
BASIC OPERATIONS:
  [ ] Upload photo dengan category
  [ ] Upload dengan event date
  [ ] Get all photos
  [ ] Get by category
  [ ] Get by event date
  [ ] Get detail
  [ ] Update info
  [ ] Delete photo

STATISTICS:
  [ ] GET /stats shows correct totals
  [ ] Recent photos list
  [ ] Events this month

FILTERS:
  [ ] Category filter works
  [ ] Date filter YYYY-MM works
  [ ] Date filter YYYY-MM-DD works
  [ ] Pagination works (page, limit)

PERMISSIONS:
  [ ] Upload needs ADMIN token
  [ ] Public GET endpoints work without token
  [ ] Delete needs ADMIN token
```

---

**Happy Testing! 🚀**
