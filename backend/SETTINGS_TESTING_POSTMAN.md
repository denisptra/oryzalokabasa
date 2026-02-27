# ⚙️ SETTINGS ENDPOINTS - POSTMAN TESTING GUIDE

Panduan lengkap testing Settings (Konfigurasi Global) endpoints dengan Postman/Insomnia.

---

## 📋 DAFTAR SETTINGS ENDPOINTS

```
POST   /api/settings/save             - Save/update setting (SUPER_ADMIN)
GET    /api/settings                  - Get all settings (SUPER_ADMIN)
GET    /api/settings/key/:key         - Get setting by key (PUBLIC)
POST   /api/settings/batch            - Get multiple settings (PUBLIC)
GET    /api/settings/summary          - Get summary for frontend (PUBLIC)
DELETE /api/settings/delete/:key      - Delete setting (SUPER_ADMIN)
DELETE /api/settings/reset            - Reset all settings (SUPER_ADMIN)
```

---

## 🔧 SETUP POSTMAN

### Collection Variables

```
base_url           | http://localhost:5000/api
super_admin_token  | [dari super admin login]
```

---

## ✅ TEST FLOW - STEP BY STEP

### STEP 1: SAVE SETTING (Create/Update)

#### Request

```
Method: POST
URL: http://localhost:5000/api/settings/save
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "key": "blog_title",
  "value": "Oryza Lokabasah - Blog Terpercaya"
}
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Setting berhasil disimpan",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "blog_title",
    "value": "Oryza Lokabasah - Blog Terpercaya"
  }
}
```

**Notes:**

- Hanya SUPER_ADMIN yang bisa save/update
- Gunakan upsert (jika ada, update; jika tidak, create)
- Key hanya boleh: a-z, A-Z, 0-9, underscore, hyphen
- Value bisa panjang (stored as TEXT)
- Activity di-log

#### Error Cases

**400 - Invalid key format:**

```json
{
  "status": "error",
  "message": "Key hanya boleh mengandung huruf, angka, underscore, dan hyphen"
}
```

**400 - Missing field:**

```json
{
  "status": "error",
  "message": "Field key dan value tidak boleh kosong"
}
```

---

### STEP 2: GET ALL SETTINGS (Admin Only)

#### Request

```
Method: GET
URL: http://localhost:5000/api/settings
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "key": "blog_title",
      "value": "Oryza Lokabasah - Blog Terpercaya"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440000",
      "key": "blog_description",
      "value": "Blog tentang teknologi, lifestyle, dan informasi menarik"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "key": "contact_email",
      "value": "contact@oryza.com"
    }
  ]
}
```

**Notes:**

- Hanya SUPER_ADMIN bisa akses
- Sorted by key (alphabetical)
- Full list untuk admin management
- Activity di-log

---

### STEP 3: GET SETTING BY KEY (Public)

#### Request

```
Method: GET
URL: http://localhost:5000/api/settings/key/blog_title
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "blog_title",
    "value": "Oryza Lokabasah - Blog Terpercaya"
  }
}
```

**Notes:**

- PUBLIC endpoint
- Frontend bisa fetch setting individual
- Useful untuk dynamic title/description di halaman

#### Error Case

**404 - Key tidak ada:**

```json
{
  "status": "error",
  "message": "Setting dengan key 'blog_title' tidak ditemukan"
}
```

---

### STEP 4: GET MULTIPLE SETTINGS (Batch - Public)

#### Request

```
Method: POST
URL: http://localhost:5000/api/settings/batch
Headers:
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "keys": ["blog_title", "blog_description", "contact_email", "social_facebook"]
}
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "blog_title": "Oryza Lokabasah - Blog Terpercaya",
    "blog_description": "Blog tentang teknologi dan informasi menarik",
    "contact_email": "contact@oryza.com",
    "social_facebook": "https://facebook.com/oryza"
  }
}
```

**Notes:**

- PUBLIC endpoint
- Return as object key-value (easier to use)
- Efficient untuk fetch multiple di sekali request
- Frontend bisa fetch all needed config sekaligus

#### Error Case

**400 - Invalid request:**

```json
{
  "status": "error",
  "message": "Field 'keys' harus berupa array minimal 1 item"
}
```

---

### STEP 5: GET SETTINGS SUMMARY (Frontend Config)

#### Request

```
Method: GET
URL: http://localhost:5000/api/settings/summary
Headers:
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "data": {
    "blog_title": "Oryza Lokabasah - Blog Terpercaya",
    "blog_description": "Blog tentang teknologi dan informasi menarik",
    "blog_logo": "/uploads/logo.png",
    "blog_favicon": "/uploads/favicon.ico",
    "footer_text": "Terima kasih telah berkunjung",
    "footer_copyright": "© 2024 Oryza Lokabasah. All rights reserved.",
    "contact_email": "contact@oryza.com",
    "contact_phone": "+62-812-3456-7890",
    "address": "Jl. Merdeka No. 123, Jakarta",
    "social_facebook": "https://facebook.com/oryza",
    "social_instagram": "https://instagram.com/oryza",
    "social_twitter": "https://twitter.com/oryza",
    "social_youtube": "https://youtube.com/oryza",
    "google_analytics": "UA-XXXXXXX-X"
  }
}
```

**Notes:**

- PUBLIC endpoint
- Pre-defined set of common frontend settings
- Includes defaults jika setting tidak ada
- Perfect untuk single request get all frontend config
- Untuk layout, header, footer, social links

---

### STEP 6: UPDATE EXISTING SETTING

#### Request

```
Method: POST
URL: http://localhost:5000/api/settings/save
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json

Body (JSON):
```

```json
{
  "key": "blog_title",
  "value": "Oryza Lokabasah - Informasi Terdepan 2024"
}
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Setting berhasil disimpan",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "key": "blog_title",
    "value": "Oryza Lokabasah - Informasi Terdepan 2024"
  }
}
```

**Notes:**

- Same endpoint sebagai create
- Otomatis detect jika key sudah ada → update
- ID tetap sama
- Activity di-log sebagai CREATE/UPDATE

---

### STEP 7: DELETE SETTING

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/settings/delete/blog_title
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "Setting berhasil dihapus"
}
```

**Notes:**

- Hanya SUPER_ADMIN
- Permanent deletion
- Activity di-log dengan deleted_key

#### Error Case

**404 - Key tidak ada:**

```json
{
  "status": "error",
  "message": "Setting dengan key 'blog_title' tidak ditemukan"
}
```

---

### STEP 8: RESET ALL SETTINGS (Caution!)

#### Request

```
Method: DELETE
URL: http://localhost:5000/api/settings/reset
Headers:
  - Authorization: Bearer [SUPER_ADMIN_TOKEN]
  - Content-Type: application/json
```

#### Expected Response (200)

```json
{
  "status": "success",
  "message": "15 setting berhasil dihapus"
}
```

**Notes:**

- Hanya SUPER_ADMIN
- PERMANENT - hapus SEMUA settings!
- Activity di-log dengan deleted_count
- Use dengan hati-hati!

---

## 🧪 COMPLETE TEST SCENARIOS

### Scenario 1: Setup website config

```
1. POST /save blog_title
2. POST /save blog_description
3. POST /save contact_email
4. POST /save social_facebook
5. POST /save social_instagram
6. GET /summary → verify di frontend config
```

### Scenario 2: Frontend integration

```
1. Setup all common settings (Step 1)
2. Frontend fetch GET /summary
3. Use data untuk dynamic header/footer
4. Update setting via POST /save
5. App refresh dan ambil summary lagi
```

### Scenario 3: Individual access

```
1. POST /save → create multiple settings
2. Frontend GET /key/blog_title → get single
3. Frontend POST /batch → get multiple efficient
4. Pilih approach tergantung kebutuhan
```

### Scenario 4: Admin management

```
1. Login as SUPER_ADMIN
2. GET / → lihat semua settings
3. POST /save → create new
4. POST /save → update existing
5. DELETE /delete/:key → remove
```

---

## 🔑 IMPORTANT NOTES

### Common Settings Keys

```
Blog Config:
  - blog_title
  - blog_description
  - blog_logo
  - blog_favicon

Contact:
  - contact_email
  - contact_phone
  - address

Social Media:
  - social_facebook
  - social_instagram
  - social_twitter
  - social_youtube

Footer:
  - footer_text
  - footer_copyright

Analytics:
  - google_analytics
```

### Key Format Rules

```
Allowed:
  - Lowercase: a-z
  - Uppercase: A-Z
  - Numbers: 0-9
  - Underscore: _
  - Hyphen: -

Not allowed:
  - Spaces
  - Special chars (@, #, $, etc)
  - Dots in key name

Examples:
  ✓ blog_title
  ✓ contact-phone
  ✓ SOCIAL_FACEBOOK
  ✗ blog title (space)
  ✗ contact.email (dot)
```

### Value Storage

```
Stored as TEXT - support:
  - Plain text
  - Long text
  - URLs
  - JSON (jika diperlukan)
  - HTML (jika diperlukan)

No length limit (TEXT column)
```

### Authorization

```
Endpoint              | Access
──────────────────────┼──────────────────
GET /key/:key         | ❌ Public
POST /batch           | ❌ Public
GET /summary          | ❌ Public
POST /save            | ✅ SUPER_ADMIN only
GET /                 | ✅ SUPER_ADMIN only
DELETE /delete/:key   | ✅ SUPER_ADMIN only
DELETE /reset         | ✅ SUPER_ADMIN only
```

---

## ✅ TESTING CHECKLIST

```
CRUD OPERATIONS:
  [ ] Create setting
  [ ] Read single (GET /key/:key)
  [ ] Read batch (POST /batch)
  [ ] Read all (GET /)
  [ ] Update existing setting
  [ ] Delete setting

PUBLIC ENDPOINTS:
  [ ] GET /key/:key works without token
  [ ] POST /batch works without token
  [ ] GET /summary works without token
  [ ] Returns correct values

ADMIN OPERATIONS:
  [ ] POST /save needs SUPER_ADMIN token
  [ ] GET / needs SUPER_ADMIN token
  [ ] DELETE /delete needs SUPER_ADMIN token
  [ ] Activity logged on mutations

FORMAT VALIDATION:
  [ ] Key format validation works
  [ ] Invalid key rejected
  [ ] Empty fields rejected

FRONTEND INTEGRATION:
  [ ] Frontend can fetch /summary
  [ ] Frontend can fetch /key/:key
  [ ] Frontend can batch fetch /batch
  [ ] Data used for dynamic content
```

---

## 📝 EXAMPLE FRONTEND USAGE

```javascript
// Fetch all frontend config
const response = await fetch("/api/settings/summary");
const config = await response.json();

document.title = config.data.blog_title;
document.querySelector("footer").textContent = config.data.footer_copyright;

// Fetch specific setting
const emailResponse = await fetch("/api/settings/key/contact_email");
const email = await emailResponse.json();
const contactForm = document.querySelector("form");
contactForm.action = `mailto:${email.data.value}`;

// Batch fetch
const batchResponse = await fetch("/api/settings/batch", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    keys: ["blog_title", "contact_email", "social_facebook"],
  }),
});
const batchConfig = await batchResponse.json();
```

---

**Happy Testing! 🚀**
