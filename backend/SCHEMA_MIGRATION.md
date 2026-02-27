# 📝 SCHEMA MIGRATION SUMMARY - News → Post + Gallery Update

Dokumentasi lengkap perubahan database schema.

---

## ✅ PERUBAHAN YANG SUDAH DILAKUKAN

### 1. Ubah Model News → Post

**Before:**

```prisma
model News {
  id        String    @id @default(uuid())
  title     String
  slug      String    @unique
  content   String    @db.Text
  thumbnail String?
  metaTitle String?   @db.VarChar(70)
  metaDescription String? @db.VarChar(160)
  status    ContentStatus @default(DRAFT)
  views     Int       @default(0)
  categoryId String
  category  Category  @relation(fields: [categoryId], references: [id])
  tags      Tag[]     // Many-to-Many relationship
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**After:**

```prisma
model Post {
  id        String    @id @default(uuid())
  title     String
  slug      String    @unique
  content   String    @db.Text
  thumbnail String?
  metaTitle String?   @db.VarChar(70)
  metaDescription String? @db.VarChar(160)
  tags      String?   // Comma-separated string
  status    ContentStatus @default(DRAFT)
  views     Int       @default(0)
  categoryId String
  category  Category  @relation(fields: [categoryId], references: [id])
  authorId  String
  author    User      @relation(fields: [authorId], references: [id])
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

**Changes:**

- Model name: `News` → `Post`
- Field `tags`: `Tag[]` (many-to-many) → `String?` (comma-separated)
  - Old: `["javascript", "nodejs", "express"]` (relationship)
  - New: `"javascript, nodejs, express"` (string)
- Relation `author`: `User` field masih ada, tapi struktur tetap sama

---

### 2. Hapus Model Tag

**Before:**

```prisma
model Tag {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  news  News[]  // Many-to-Many with News
}
```

**After:**

```
// Model Tag sudah dihapus
// Tags sekarang disimpan sebagai String di Post.tags
```

**Why:**

- Lebih sederhana jika tidak ada banyak relasi tag yang kompleks
- Tag cukup string biasa, tidak perlu tabel terpisah
- Reduce database complexity

---

### 3. Update Model Category

**Before:**

```prisma
model Category {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  news  News[]    // Relation ke News (sekarang Post)
  galleries Gallery[]
}
```

**After:**

```prisma
model Category {
  id    String @id @default(uuid())
  name  String @unique
  slug  String @unique
  posts Post[]   // Relation nama berubah dari news → posts
  galleries Gallery[]
}
```

**Changes:**

- Field `news: News[]` → `posts: Post[]` (mengikuti nama model baru)

---

### 4. Update Model Gallery

**Before:**

```prisma
model Gallery {
  id        String   @id @default(uuid())
  title     String
  image     String
  categoryId String
  category  Category @relation(fields: [categoryId], references: [id])
  createdAt DateTime @default(now())
}
```

**After:**

```prisma
model Gallery {
  id        String    @id @default(uuid())
  title     String
  image     String
  eventDate DateTime? // Tanggal kegiatan/event - BARU!
  categoryId String
  category  Category  @relation(fields: [categoryId], references: [id])
  createdAt DateTime  @default(now())
}
```

**Changes:**

- Tambah field baru: `eventDate: DateTime?`
- Berguna untuk menyimpan tanggal kegiatan/event yang difoto
- Nullable (optional) jika tidak ada tanggal event

**Example Usage:**

```
{
  id: "uuid",
  title: "Turnamen Sepak Bola 2024",
  image: "/uploads/IMG_001.jpg",
  eventDate: "2024-02-15",  // Tanggal acara berlangsung
  categoryId: "uuid",
  createdAt: "2024-02-27"   // Tanggal foto diupload
}
```

---

### 5. Update Model User

**Before:**

```prisma
model User {
  ...
  news News[]  // Relation ke News
  ...
}
```

**After:**

```prisma
model User {
  ...
  posts Post[]  // Relation ke Post
  ...
}
```

**Changes:**

- Field `news: News[]` → `posts: Post[]` (mengikuti nama model baru)

---

### 6. Model Yang Tetap (No Changes)

Berikut model yang tidak berubah:

- `HeroSlider` - Tetap
- `ContactMessage` - Tetap
- `Log` - Tetap
- `Setting` - Tetap (dipertahankan untuk konfigurasi global)

---

## 📊 MIGRATION DETAILS

**File Created:**

```
/backend/prisma/migrations/
  └─ 20260227151043_migrate_news_to_post_remove_tag_add_gallery_eventdate/
    └─ migration.sql
```

**SQL Changes (Auto Generated):**

1. Rename table `News` → `Post`
2. Modify `Post.tags` field dari relationship ke string
3. Remove junction table untuk many-to-many News-Tag
4. Add field `eventDate` ke `Gallery` table
5. Update foreign key constraints

---

## 🔄 QUICK REFERENCE - OLD vs NEW

### Models

```
BEFORE              AFTER
─────────────────────────────
News        →       Post
Tag         →       (REMOVED)
Category            Category (updated relation)
User                User (updated relation)
Gallery             Gallery (with new field)
HeroSlider          HeroSlider
ContactMessage      ContactMessage
Log                 Log
Setting             Setting
```

### Relations

```
BEFORE                  AFTER
─────────────────────────────────────────
User.news (News[])    → User.posts (Post[])
Category.news (News[])→ Category.posts (Post[])
Post.tags (Tag[])     → Post.tags (String?)
Gallery               → Gallery (+ eventDate)
```

### Data Structures

```
BEFORE (tags):
{
  id: "news-1",
  title: "JavaScript Tips",
  tags: [                          // Array of Tag objects
    { id: "tag-1", name: "javascript" },
    { id: "tag-2", name: "nodejs" }
  ]
}

AFTER (tags):
{
  id: "post-1",
  title: "JavaScript Tips",
  tags: "javascript, nodejs"       // Simple string
}
```

---

## ⚠️ IMPORTANT - MIGRATION NOTES

### 1. Existing Data

Jika Anda sudah punya data di tabel `News` dengan relation `Tag`:

**Option A: Fresh Database (Recommended)**

```bash
# Drop dan recreate database
npx prisma migrate reset

# Atau manual:
# 1. Drop database
# 2. Create database baru
# 3. Run migration
npx prisma migrate deploy
```

**Option B: Data Migration Script**
Jika ada data yang perlu diselamatkan:

```javascript
// Script untuk convert old News data ke new Post
// - Rename news → post
// - Convert tags relation → comma-separated string
// - Add eventDate untuk gallery
```

### 2. Prisma Client Error

Jika ada error saat `npx prisma generate`:

```bash
# Clear cache dan regenerate
rm -rf node_modules/.prisma
npx prisma generate
```

### 3. Update Code References

Semua referensi ke model `News` harus diubah menjadi `Post`:

**Files yang perlu di-update:**

- Controllers: `news.controller.js` → `post.controller.js`
- Services: `news.service.js` → `post.service.js`
- Routes: `news.routes.js` → `post.routes.js`
- Imports: `requireNews` → `isPost`

---

## 📝 DATA MIGRATION EXAMPLE

Jika harus migrate data lama:

```sql
-- 1. Rename table
ALTER TABLE "News" RENAME TO "Post";

-- 2. Drop Tag table jika tidak digunakan lagi
-- DROP TABLE "_NewsToTag" CASCADE;
-- DROP TABLE "Tag" CASCADE;

-- 3. Update tags column (example: convert relation to string)
-- UPDATE "Post"
-- SET tags = array_to_string(array_agg(tag_name), ', ')
-- FROM ...

-- 4. Check data
SELECT id, title, tags FROM "Post" LIMIT 5;
```

---

## 🎯 NEXT STEPS

1. **✅ Migration Applied** - Schema sudah di-update di database

2. **⏳ Update Code** - Ganti referensi:

   ```
   News → Post
   news.routes.js → post.routes.js
   news.controller.js → post.controller.js
   news.service.js → post.service.js
   ```

3. **⏳ Test Data** - Buat Post baru dengan:

   ```json
   {
     "title": "Test Post",
     "content": "...",
     "tags": "javascript, nodejs, express",
     "categoryId": "...",
     "authorId": "..."
   }
   ```

4. **⏳ Test Gallery** - Buat Gallery dengan eventDate:
   ```json
   {
     "title": "Acara Olahraga",
     "image": "/uploads/event.jpg",
     "eventDate": "2024-02-15",
     "categoryId": "..."
   }
   ```

---

## 📚 REFERENCE

**Prisma Documentation:**

- https://www.prisma.io/docs/concepts/components/prisma-schema
- https://www.prisma.io/docs/concepts/components/prisma-migrate
- https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference

**Tags Format Handling:**

```javascript
// Parse tags dari string
const tags = post.tags?.split(",").map((t) => t.trim()) ?? [];

// Convert array ke string
const tagsString = ["javascript", "nodejs"].join(", ");
```

---

**Status:** ✅ MIGRATION COMPLETED
**Date:** 2024-02-27
**Migration Name:** migrate_news_to_post_remove_tag_add_gallery_eventdate
