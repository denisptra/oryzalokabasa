# 🚀 QUICK START GUIDE - ALL NEW MODULES

Complete setup guide untuk Contact Message, Gallery, Hero Slider, dan Settings.

---

## 📋 CHECKLIST SEBELUM MULAI

```
[ ] Node.js installed (v14+)
[ ] PostgreSQL running
[ ] Database created dan configured
[ ] dependencies installed (npm install)
[ ] .env file configured dengan DATABASE_URL
[ ] Prisma migrations applied (npx prisma migrate dev)
```

---

## ⚡ INSTANT START (3 LANGKAH)

### STEP 1: Mulai Server

```bash
cd backend
npm start
# Terminal akan show: "Server running on port 5000"
```

### STEP 2: Import Postman Collection

```
1. Buka Postman
2. Click "Import"
3. Pilih file: Oryza_CMS_Complete_API.postman_collection.json
4. Klik Import
5. Collection sudah ready dengan 30 requests baru
```

### STEP 3: Setup Variables di Postman

```
1. Di folder collection, click "Variables"
2. Set base_url: http://localhost:5000/api

3. Login sebagai ADMIN:
   - POST /auth/login dengan admin credentials
   - Copy token ke variable: admin_token

4. Login sebagai SUPER_ADMIN (jika ada):
   - POST /auth/login dengan super admin credentials
   - Copy token ke variable: super_admin_token

5. Create category (jika belum ada):
   - POST /category/create
   - Copy id ke variable: category_id
```

---

## 🧪 QUICK TEST (5 MENIT)

### Test Contact Message

```
1. POST /contact/send
   - Fill form dengan nama, email, topic, message
   - Response: 201 Created ✓

2. GET /contact/messages?status=UNREAD
   - Header: Authorization: Bearer {{admin_token}}
   - Response: List of messages ✓

3. GET /contact/stats
   - Response: Statistics summary ✓
```

### Test Gallery

```
1. POST /gallery/upload
   - Fill: title, image, categoryId
   - Header: Authorization: Bearer {{admin_token}}
   - Response: 201 Created ✓

2. GET /gallery
   - No token needed (PUBLIC)
   - Response: List of photos ✓

3. GET /gallery/stats
   - Response: Gallery statistics ✓
```

### Test Hero Slider

```
1. POST /hero-slider/create
   - Fill: title, subtitle, image, link, isActive
   - Header: Authorization: Bearer {{admin_token}}
   - Response: 201 Created ✓

2. GET /hero-slider/active
   - No token needed (PUBLIC)
   - Response: Active sliders only ✓

3. PUT /hero-slider/reorder
   - Change order of sliders
   - Response: Updated sliders ✓
```

### Test Settings

```
1. POST /settings/save
   - Fill: key="blog_title", value="My Website"
   - Header: Authorization: Bearer {{super_admin_token}}
   - Response: 200 OK ✓

2. GET /settings/summary
   - No token needed (PUBLIC)
   - Response: Frontend config ✓

3. GET /settings/key/blog_title
   - Response: Single setting ✓
```

---

## 📚 DETAILED DOCUMENTATION

Untuk step-by-step guide dengan error handling dan edge cases:

| Module      | Guide                          | Endpoints | Scenarios |
| ----------- | ------------------------------ | --------- | --------- |
| Contact     | CONTACT_TESTING_POSTMAN.md     | 7         | 4 flows   |
| Gallery     | GALLERY_TESTING_POSTMAN.md     | 8         | 3 flows   |
| Hero Slider | HERO_SLIDER_TESTING_POSTMAN.md | 8         | 3 flows   |
| Settings    | SETTINGS_TESTING_POSTMAN.md    | 7         | 4 flows   |

```bash
# Open file di editor atau browser
cat CONTACT_TESTING_POSTMAN.md
cat GALLERY_TESTING_POSTMAN.md
cat HERO_SLIDER_TESTING_POSTMAN.md
cat SETTINGS_TESTING_POSTMAN.md
```

---

## 🔑 KEY CONCEPTS

### Contact Message

**Use Case:** Form kontak di website

```
User → Fill form → POST /contact/send
                    ↓
Admin → GET /contact/messages → View all
                    ↓
Admin → GET /contact/:id → Mark as READ
                    ↓
Admin → PUT /contact/archive/:id → Archive
```

**Status Flow:** UNREAD → READ → ARCHIVED

---

### Gallery

**Use Case:** Photo gallery dengan event documentation

```
Admin → POST /gallery/upload → Add photo
                    ↓
User → GET /gallery → View all (PUBLIC)
User → GET /gallery/category/:id → Filter by category
User → GET /gallery/event/2024-02 → Filter by date
```

**Features:**

- Event date tracking
- Category filtering
- Date range filtering

---

### Hero Slider

**Use Case:** Website banner carousel

```
Admin → POST /hero-slider/create → Create slider
                    ↓
Website → GET /hero-slider/active → Fetch for carousel (PUBLIC)
                    ↓
Admin → PUT /hero-slider/reorder → Reorder for display
```

**Options:**

- Toggle active/inactive
- Batch reordering
- Admin view shows all, frontend shows active only

---

### Settings

**Use Case:** Global config storage

```
Super Admin → POST /settings/save → Set config
                    ↓
Frontend → GET /settings/summary → Get all config (PUBLIC)
           GET /settings/key/blog_title → Get single
           POST /settings/batch → Get multiple
```

**Key Features:**

- Key-value storage
- Upsert operations
- Frontend-friendly endpoints

---

## 🎯 COMMON USE CASES

### Set Website Config

```bash
# Super admin sets config
POST /settings/save
{
  "key": "blog_title",
  "value": "My Amazing Blog"
}

# Frontend fetches
GET /settings/summary
→ Returns all needed config dengan defaults
```

### Manage Photos with Event Dates

```bash
# Admin upload with event date
POST /gallery/upload
{
  "title": "Company Event 2024",
  "image": "/uploads/event.jpg",
  "categoryId": "cat-123",
  "eventDate": "2024-02-15"  ← Event documentation
}

# User views timeline
GET /gallery/event/2024-02 → All Feb events
GET /gallery/event/2024-02-15 → Specific date
```

### Website Banner Carousel

```bash
# Admin creates multiple sliders
POST /hero-slider/create → slider 1
POST /hero-slider/create → slider 2
POST /hero-slider/create → slider 3

# Admin reorders with drag-drop
PUT /hero-slider/reorder
[{id: "s1", order: 2}, {id: "s2", order: 1}, ...]

# Frontend displays
GET /hero-slider/active → Get active only, sorted by order
```

### Contact Form Workflow

```bash
# Visitor submits
POST /contact/send
{
  "name": "John",
  "email": "john@example.com",
  "topic": "Support",
  "message": "I have a question..."
}

# Admin checks
GET /contact/stats → See unread count
GET /contact/messages?status=UNREAD → List

# Admin processes
GET /contact/:id → View (auto marks READ)
PUT /contact/mark-read/:id → Explicit mark
PUT /contact/archive/:id → Organize
DELETE /contact/delete/:id → Clean up (super admin)
```

---

## ⚠️ COMMON MISTAKES

### 1. Forget Authorization Token

```bash
❌ GET /gallery/delete/:id (no token)
→ 401 Unauthorized

✅ GET /gallery/delete/:id \
  -H "Authorization: Bearer {{admin_token}}"
→ 200 OK
```

### 2. Wrong Role for Operation

```bash
❌ Delete with ADMIN token
→ 403 Forbidden (needs SUPER_ADMIN)

✅ DELETE /settings/reset (with SUPER_ADMIN token)
→ 200 OK
```

### 3. Contact Form Empty Field

```bash
❌ POST /contact/send dengan message kosong
→ 400 Bad Request

✅ POST /contact/send dengan message: "..."
→ 201 Created
```

### 4. Invalid Event Date Format

```bash
❌ eventDate: "February 15, 2024"
→ 400 Invalid format

✅ eventDate: "2024-02-15" or "2024-02"
→ 201 Created
```

---

## 🔍 TROUBLESHOOTING

### Server won't start

```bash
# Check if port 5000 is in use
lsof -i :5000

# Kill existing process
kill -9 <PID>

# Or use different port
PORT=3000 npm start
```

### Database errors

```bash
# Reset database
npx prisma migrate reset

# Verify schema
npx prisma db push

# View database
npx prisma studio
```

### Token issues

```bash
# Re-login to get fresh token
POST /auth/login

# Verify token in JWT.io
# Copy token (without "Bearer ") ke jwt.io

# Check expiration and claims
```

### 404 on endpoints

```bash
# Verify routes are registered in app.js
grep -n "contact\|gallery\|hero-slider\|settings" src/app.js

# Restart server
npm start

# Check URL format exactly matches docs
```

---

## 📊 ENDPOINT REFERENCE QUICK LOOKUP

### By HTTP Method

**GET (Read-only)**

```
GET /contact/messages
GET /contact/stats
GET /contact/:id
GET /gallery
GET /gallery/stats
GET /gallery/:id
GET /gallery/category/:id
GET /gallery/event/:date
GET /hero-slider
GET /hero-slider/active
GET /hero-slider/:id
GET /settings (super admin)
GET /settings/key/:key
POST /settings/batch (not GET, but read-only)
GET /settings/summary
```

**POST (Create/Update)**

```
POST /contact/send
POST /gallery/upload
POST /hero-slider/create
POST /settings/save
POST /settings/batch
```

**PUT (Modify)**

```
PUT /contact/mark-read/:id
PUT /contact/archive/:id
PUT /gallery/update/:id
PUT /hero-slider/update/:id
PUT /hero-slider/toggle/:id
PUT /hero-slider/reorder
```

**DELETE (Remove)**

```
DELETE /contact/delete/:id
DELETE /gallery/delete/:id
DELETE /hero-slider/delete/:id
DELETE /settings/delete/:key
DELETE /settings/reset
```

### By Access Level

**PUBLIC (No token)**

```
POST /contact/send
GET /contact/... ✗ (needs token)
GET /gallery/...
GET /hero-slider/...
GET /hero-slider/active
GET /settings/key/:key
POST /settings/batch
GET /settings/summary
```

**ADMIN+**

```
GET /contact/messages
GET /contact/stats
GET /contact/:id
PUT /contact/mark-read/:id
PUT /contact/archive/:id
POST /gallery/upload
PUT /gallery/update/:id
DELETE /gallery/delete/:id
POST /hero-slider/create
PUT /hero-slider/update/:id
PUT /hero-slider/toggle/:id
PUT /hero-slider/reorder
DELETE /hero-slider/delete/:id
```

**SUPER_ADMIN**

```
DELETE /contact/delete/:id
GET /settings
POST /settings/save
DELETE /settings/delete/:key
DELETE /settings/reset
```

---

## 🎯 NEXT STEPS

1. **Test locally** - Follow quick test steps above
2. **Review documentation** - Read specific guides untuk module
3. **Integrate with frontend** - Use public endpoints
4. **Deploy** - Same as existing modules
5. **Monitor** - Check logs untuk audit trail

---

## 📞 GETTING HELP

### Read Documentation

- NEW_MODULES_SUMMARY.md - Overview
- CONTACT_TESTING_POSTMAN.md - Contact details
- GALLERY_TESTING_POSTMAN.md - Gallery details
- HERO_SLIDER_TESTING_POSTMAN.md - Slider details
- SETTINGS_TESTING_POSTMAN.md - Settings details

### Check Logs

```bash
# Server console shows errors
npm start
# Look for error messages in output

# Database logs
npx prisma studio
# Visual inspection of data
```

### Verify Setup

```bash
# Test server health
curl http://localhost:5000/

# Test public endpoint
curl http://localhost:5000/api/gallery

# Test with auth
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/gallery/upload
```

---

## ✅ SUCCESS CHECKLIST

```
[ ] Server starts without errors
[ ] Postman collection imported
[ ] ADMIN token obtained
[ ] Contact message sent
[ ] Gallery photo uploaded
[ ] Hero slider created
[ ] Settings configured
[ ] All endpoints respond correctly
[ ] Authorization works
[ ] Data persisted in database
[ ] Error handling works
```

---

## 🎉 READY TO ROLL!

Semua modules sudah production-ready:

- ✅ Clean code structure
- ✅ Proper authorization
- ✅ Complete error handling
- ✅ Audit logging
- ✅ Full documentation
- ✅ Postman collection ready
- ✅ Database schema applied

**Happy Deploying! 🚀**
