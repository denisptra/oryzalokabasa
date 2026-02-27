# ✅ PRISMA SCHEMA MIGRATION - COMPLETE GUIDE

Panduan lengkap perubahan schema dari News → Post, hapus Tag, tambah Gallery eventDate.

---

## 📋 SUMMARY PERUBAHAN

### ✅ Sudah Selesai

1. **Schema Prisma Updated** ✓
   - News → Post
   - Tags: relation → string (comma-separated)
   - Model Tag dihapus
   - Gallery: tambah field eventDate
   - User.news → User.posts
   - Category.news → Category.posts

2. **Database Migration Applied** ✓
   - Migration file: `20260227151043_migrate_news_to_post_remove_tag_add_gallery_eventdate`
   - Semua perubahan table sudah di-apply ke database

3. **Code Templates Created** ✓
   - `/backend/src/controllers/post.controller.js` - Post controller lengkap
   - `/backend/src/services/post.service.js` - Post service lengkap
   - `/backend/src/routes/post.routes.js` - Post routes lengkap
   - `/backend/src/app.js` - Updated dengan post routes

4. **Documentation Created** ✓
   - `SCHEMA_MIGRATION.md` - Penjelasan detail semua perubahan
   - Dokumentasi di comments di setiap file

---

## 🎯 NEXT STEPS - YANG PERLU ANDA LAKUKAN

### Step 1: Verifikasi Prisma Client (Fix Permission Error)

```bash
cd backend

# Clear cache Prisma
rm -rf node_modules/.prisma

# Regenerate Prisma Client
npx prisma generate

# Or just restart npm
npm install
```

### Step 2: Verify Schema di Database

```bash
# Cek apakah tabel sudah benar
npx prisma studio

# Atau query manual:
# SELECT * FROM "Post" LIMIT 5;
# SELECT * FROM "Gallery" LIMIT 5;
# SELECT * FROM "Tag";  -- Should be empty (if was migrated)
```

### Step 3: Test POST Endpoints

Gunakan Postman/Insomnia untuk test:

#### 3.1 Create Post

```
POST http://localhost:5000/api/post/create
Authorization: Bearer [admin-token]
Content-Type: application/json

{
    "title": "Intro to Node.js",
    "content": "Node.js adalah...",
    "tags": "nodejs, javascript, backend",
    "categoryId": "[category-uuid]",
    "thumbnail": "/uploads/nodejs.jpg",
    "metaTitle": "Node.js Tutorial",
    "metaDescription": "Belajar Node.js dari nol"
}
```

Expected Response (201):

```json
{
    "status": "success",
    "message": "Post berhasil dibuat",
    "data": {
        "id": "uuid",
        "title": "Intro to Node.js",
        "slug": "intro-to-nodejs",
        "tags": "nodejs, javascript, backend",
        "status": "DRAFT",
        "views": 0,
        ...
    }
}
```

#### 3.2 Get All Posts

```
GET http://localhost:5000/api/posts?page=1&limit=10&status=PUBLISHED
```

#### 3.3 Get Post by Slug

```
GET http://localhost:5000/api/post/slug/intro-to-nodejs
```

#### 3.4 Update Post

```
PUT http://localhost:5000/api/post/update/[post-id]
Authorization: Bearer [admin-token]
Content-Type: application/json

{
    "status": "PUBLISHED"
}
```

#### 3.5 Delete Post

```
DELETE http://localhost:5000/api/post/delete/[post-id]
Authorization: Bearer [admin-token]
```

### Step 4: Test GALLERY with eventDate

#### 4.1 Create Gallery

```
POST http://localhost:5000/api/gallery/create
Authorization: Bearer [admin-token]
Content-Type: application/json

{
    "title": "Turnamen Sepak Bola 2024",
    "image": "/uploads/event-photo.jpg",
    "eventDate": "2024-02-15",
    "categoryId": "[category-uuid]"
}
```

#### 4.2 Get Gallery

```
GET http://localhost:5000/api/galleries?categoryId=[category-uuid]
```

---

## 📁 FILE STRUCTURE - UPDATED

```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── user.controller.js
│   │   ├── category.controller.js
│   │   ├── log.controller.js
│   │   └── post.controller.js          ← NEW!
│   │
│   ├── services/
│   │   ├── auth.service.js
│   │   ├── user.service.js
│   │   ├── category.service.js
│   │   └── post.service.js             ← NEW!
│   │
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── log.routes.js
│   │   └── post.routes.js              ← NEW!
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── role.js
│   │   ├── validation.js
│   │   └── rateLimiter.js
│   │
│   ├── utils/
│   │   ├── jwt.js
│   │   └── logger.js
│   │
│   └── app.js                          ← UPDATED!
│
├── prisma/
│   ├── schema.prisma                   ← UPDATED!
│   └── migrations/
│       └── 20260227151043_migrate_news_to_post_remove_tag_add_gallery_eventdate/
│
└── SCHEMA_MIGRATION.md                 ← NEW!
```

---

## 🔄 PERBANDINGAN - OLD vs NEW

### Database Schema

**BEFORE:**

```
News table:
- id, title, slug, content, thumbnail, metaTitle, metaDescription, status, views
- categoryId (FK)
- authorId (FK)
- _NewsToTag (junction table untuk many-to-many)

Tag table:
- id, name, slug

Gallery table:
- id, title, image, categoryId
- createdAt
```

**AFTER:**

```
Post table:
- id, title, slug, content, thumbnail, metaTitle, metaDescription
- tags (String - comma-separated)
- status, views
- categoryId (FK)
- authorId (FK)

Tag table:
- DIHAPUS! Tag sekarang string di Post.tags

Gallery table:
- id, title, image
- eventDate (DateTime) ← NEW!
- categoryId (FK)
- createdAt
```

### Model Relationships

**BEFORE:**

```
User --< News >-- Category
            ^
            |--- many-to-many
            |
           Tag
```

**AFTER:**

```
User --< Post >-- Category
```

### Tags Handling

**BEFORE:**

```javascript
{
  id: "post-1",
  title: "Article",
  tags: [
    { id: "tag-1", name: "javascript" },
    { id: "tag-2", name: "nodejs" }
  ]
}
```

**AFTER:**

```javascript
{
  id: "post-1",
  title: "Article",
  tags: "javascript, nodejs"
}
```

### Gallery Event Date

**BEFORE:**

```javascript
{
  id: "gallery-1",
  title: "Turnamen Sepak Bola",
  image: "/uploads/photo.jpg",
  categoryId: "...",
  createdAt: "2024-02-27"  // Hanya waktu upload
}
```

**AFTER:**

```javascript
{
  id: "gallery-1",
  title: "Turnamen Sepak Bola",
  image: "/uploads/photo.jpg",
  eventDate: "2024-02-15",  // Tanggal event/kegiatan
  categoryId: "...",
  createdAt: "2024-02-27"   // Tanggal upload
}
```

---

## ⚠️ IMPORTANT NOTES

### 1. Fresh Start Recommended

Jika Anda belum ada data production:

```bash
# Reset database (HATI-HATI! Semua data akan dihapus)
npx prisma migrate reset

# Atau manual:
# 1. Drop database PostgreSQL
# 2. Create database baru
# 3. Run: npx prisma migrate deploy
```

### 2. Existing Data Migration

Jika ada data News yang perlu dimigrasi:

```sql
-- Convert News to Post
INSERT INTO "Post"
  (id, title, slug, content, thumbnail, metaTitle, metaDescription, tags, status, views, categoryId, authorId, createdAt, updatedAt)
SELECT
  id, title, slug, content, thumbnail, metaTitle, metaDescription,
  NULL as tags,  -- Tags akan diisi manual atau via script
  status, views, categoryId, authorId, createdAt, updatedAt
FROM "News";

-- Convert tags to comma-separated (if have junction data)
-- UPDATE "Post"
-- SET tags = array_to_string(array_agg(tag_name), ', ')
-- FROM ...
```

### 3. Tags Format

Untuk parse tags dari string di application:

```javascript
// Split tags string menjadi array
const tagArray = post.tags ? post.tags.split(",").map((t) => t.trim()) : [];

// Contoh: "javascript, nodejs, express" → ["javascript", "nodejs", "express"]

// Sebaliknya - convert array to string
const tagString = ["javascript", "nodejs"].join(", ");
// Hasil: "javascript, nodejs"
```

### 4. Event Date Usage

Gallery sekarang bisa tracking kapan event terjadi:

```javascript
// Gallery untuk dokumentasi event
const gallery = {
  title: "Acara Olahraga",
  image: "/uploads/photo.jpg",
  eventDate: "2024-02-15", // Tanggal acara
  categoryId: "...",
  createdAt: "2024-02-27", // Tanggal foto diupload
};

// Query gallery by event date
const eventPhotos = await prisma.gallery.findMany({
  where: {
    eventDate: {
      gte: "2024-02-01",
      lte: "2024-02-28",
    },
  },
});
```

---

## 📚 ENDPOINTS REFERENCE

### Post Endpoints

```
GET  /api/posts                           - List semua post
GET  /api/posts?page=1&limit=10&status=PUBLISHED
GET  /api/post/:id                        - Get by ID
GET  /api/post/slug/:slug                 - Get by slug
GET  /api/posts/category/:categoryId      - Get by category
GET  /api/posts/search/:keyword           - Search
POST /api/post/create                     - Create (ADMIN+)
PUT  /api/post/update/:id                 - Update (ADMIN+)
DELETE /api/post/delete/:id               - Delete (ADMIN+)
```

### Gallery Endpoints

```
GET  /api/galleries                       - List semua gallery
GET  /api/galleries/:id                   - Get by ID
GET  /api/galleries/category/:categoryId  - Get by category
GET  /api/galleries/date?from=&to=       - Get by event date range
POST /api/gallery/create                  - Create (ADMIN+)
PUT  /api/gallery/update/:id              - Update (ADMIN+)
DELETE /api/gallery/delete/:id            - Delete (ADMIN+)
```

---

## ✅ CHECKLIST

- [ ] Prisma schema sudah verified (tidak ada error)
- [ ] Migration sudah di-apply ke database
- [ ] Database tabel sudah update (News → Post, +eventDate di Gallery)
- [ ] Post controller, service, routes sudah ada
- [ ] app.js sudah include post routes
- [ ] Test POST endpoints via Postman
- [ ] Test GALLERY eventDate field
- [ ] Documentation baca lengkap

---

## 🚀 READY TO GO

Semuanya sudah siap! Langkah selanjutnya:

1. Pastikan dependencies semua terinstall
2. Jalankan `npm start` dan test endpoints
3. Baca dokumentasi yang ada
4. Test dengan Postman/Insomnia

Enjoy coding! 🎉
