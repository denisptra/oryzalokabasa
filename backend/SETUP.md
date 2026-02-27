# 🚀 SETUP & RUN GUIDE - ORYZA API dengan RBAC

Panduan lengkap untuk setup dan menjalankan Oryza API dengan Role-Based Access Control.

---

## 📋 DAFTAR ISI

1. [Prerequisites](#prerequisites)
2. [Setup Database](#setup-database)
3. [Setup Project](#setup-project)
4. [Environment Configuration](#environment-configuration)
5. [Running the Application](#running-the-application)
6. [Testing the API](#testing-the-api)
7. [Troubleshooting](#troubleshooting)

---

## 📦 Prerequisites

Pastikan sistem Anda memiliki:

- **Node.js** versi 14+ ([Download](https://nodejs.org/))
- **npm** atau **yarn** (biasanya included dengan Node.js)
- **PostgreSQL** 12+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **Postman** atau **Insomnia** untuk testing API (Optional tapi recommended)

Verifikasi instalasi:

```bash
node --version      # Should be v14 or higher
npm --version       # Should be 6 or higher
psql --version      # Should be PostgreSQL 12 or higher
```

---

## 🗄️ Setup Database

### 1. Buat Database PostgreSQL

Buka terminal PostgreSQL atau GUI (pgAdmin, DBeaver, dll):

```sql
-- Create database
CREATE DATABASE oryza_cms;

-- Verify
\l  -- List semua database
```

### 2. Setup User & Password (Optional)

Jika belum ada user PostgreSQL atau ingin buat user baru:

```sql
-- Create new user
CREATE USER oryza_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE oryza_cms TO oryza_user;

-- Verify
\du  -- List semua users
```

---

## 💻 Setup Project

### 1. Clone Repository atau Extract Project

```bash
# Jika clone dari git
git clone https://github.com/yourname/oryzalokabasa.git
cd oryzalokabasa

# Atau jika sudah extract, arahkan ke folder project
cd oryzalokabasa
```

### 2. Install Dependencies

```bash
# Go to backend folder
cd backend

# Install dependencies
npm install
```

Tunggu sampai semua package selesai terinstall. Ini akan menginstall:

- `express` - Web framework
- `prisma` - ORM Database
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT for authentication
- `cors` - CORS middleware
- `helmet` - Security middleware
- `morgan` - HTTP request logger
- `express-validator` - Input validation
- `express-rate-limit` - Rate limiting
- Dan lainnya...

### 3. Setup Prisma

Prisma adalah ORM yang digunakan untuk manage database.

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (setup database schema)
npx prisma migrate deploy

# Or jika belum ada migration, create new
npx prisma migrate dev --name init
```

Perintah di atas akan:

- Generate Prisma Client
- Membuat tabel di database sesuai schema.prisma
- Termasuk tables: User, Log, Category, Tag, News, dll

---

## ⚙️ Environment Configuration

### 1. Buat File `.env`

Di folder `/backend`, buat file bernama `.env`:

```bash
# Dari terminal
touch .env

# Atau buat manual file .env
```

### 2. Fill `.env` dengan Configuration

Buka file `.env` dan isi dengan:

```env
# DATABASE
DATABASE_URL="postgresql://oryza_user:your_secure_password@localhost:5432/oryza_cms"

# JWT SECRET (Generate random string, minimal 32 karakter)
JWT_SECRET="your_super_secret_jwt_key_at_least_32_characters_long_xxxxxxxxxxxxxxxxxxxxxxxx"

# SERVER PORT
PORT=5000

# NODE ENVIRONMENT
NODE_ENV=development
```

**Important Notes:**

- `DATABASE_URL`: Sesuaikan dengan credential PostgreSQL Anda
  - Format: `postgresql://[user]:[password]@[host]:[port]/[database]`
  - Contoh: `postgresql://oryza_user:mypassword@localhost:5432/oryza_cms`
- `JWT_SECRET`: Generate string random, gunakan password generator atau:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- `PORT`: Bisa ubah sesuai kebutuhan (default: 5000)

### 3. Contoh `.env` untuk Local Development

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/oryza_cms"
JWT_SECRET="aksjdflkjasdflkjasdflkjasdflkjasdflk123456789"
PORT=5000
NODE_ENV=development
```

---

## ▶️ Running the Application

### 1. Start Server

```bash
# Dari folder /backend
npm start

# Atau gunakan npm run dev untuk development mode dengan auto-reload
npm run dev
```

Expected output:

```
🚀 CMS Server running on http://localhost:5000
```

### 2. Verify Server Berjalan

Buka browser dan akses:

```
http://localhost:5000
```

Expected response:

```json
{
  "status": "success",
  "message": "Welcome to Oryza API",
  "version": "1.0.0"
}
```

Kalau berhasil, berarti server sudah running dengan baik ✓

### 3. Keep Server Running

Jangan close terminal karena server masih running.
Jika ingin close, press `Ctrl+C` di terminal.

---

## 🧪 Testing the API

### 1. Buka Postman atau Insomnia

Download dan install [Postman](https://www.postman.com/downloads/) atau [Insomnia](https://insomnia.rest/download).

### 2. Setup Postman Authorization

Anda bisa set default authorization di Postman:

1. Buka Postman
2. Create new collection: "Oryza API"
3. Klik tab "Authorization"
4. Select type: "Bearer Token"
5. Token: (akan diisi setelah login)

### 3. Test Flow

#### A. Register User Baru

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
    "name": "John Admin",
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

Expected response (201):

```json
{
  "status": "success",
  "message": "Registrasi berhasil. Silakan login.",
  "data": {
    "id": "uuid",
    "name": "John Admin",
    "email": "john@example.com",
    "role": "ADMIN"
  }
}
```

#### B. Login

```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "SecurePass123!"
}
```

Expected response (200):

```json
{
  "status": "success",
  "message": "Login berhasil",
  "data": {
    "id": "uuid",
    "name": "John Admin",
    "email": "john@example.com",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**COPY TOKEN TERSEBUT** untuk request berikutnya.

#### C. Create Category (ADMIN)

```
POST http://localhost:5000/api/category/create
Authorization: Bearer [token]
Content-Type: application/json

{
    "name": "Teknologi"
}
```

Expected response (201):

```json
{
  "status": "success",
  "message": "Kategori berhasil dibuat",
  "data": {
    "id": "uuid",
    "name": "Teknologi",
    "slug": "teknologi"
  }
}
```

#### D. Try Access User Endpoint (ADMIN - Should Fail)

```
GET http://localhost:5000/api/users
Authorization: Bearer [token]
```

Expected response (403):

```json
{
  "status": "error",
  "message": "Akses ditolak. Role 'ADMIN' tidak memiliki izin mengakses resource ini."
}
```

✓ Ini adalah behavior yang benar! ADMIN tidak bisa akses user endpoints.

#### E. Setup SUPER_ADMIN

Update database untuk ubah role ke SUPER_ADMIN:

```bash
# Buka PostgreSQL CLI
psql -U oryza_user -d oryza_cms

# Query to update role
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'john@example.com';

# Verify
SELECT id, name, email, role FROM "User";

# Exit
\q
```

#### F. Login Ulang & Test User Endpoints

Login lagi dengan user yang sudah di-update ke SUPER_ADMIN, kemudian:

```
GET http://localhost:5000/api/users
Authorization: Bearer [new_token]
```

Expected response (200):

```json
{
  "status": "success",
  "data": [
    {
      "id": "uuid",
      "name": "John Admin",
      "email": "john@example.com",
      "role": "SUPER_ADMIN",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

✓ SUPER_ADMIN bisa akses semua endpoints!

---

## 🔍 Troubleshooting

### Error: "Cannot find module 'express'"

**Solusi:**

```bash
# Pastikan sudah di folder /backend
cd backend

# Install dependencies lagi
npm install
```

---

### Error: "database is busy"

**Solusi:**

```bash
# Tutup semua koneksi PostgreSQL lain
# Kemudian coba lagi

# Atau reset database
psql -U oryza_user -d oryza_cms

# Drop semua tables
DROP DATABASE oryza_cms;
CREATE DATABASE oryza_cms;
```

---

### Error: "ECONNREFUSED 127.0.0.1:5432"

**Artinya:** PostgreSQL tidak running.

**Solusi:**

```bash
# Windows
# Buka Services (services.msc) dan start "PostgreSQL"

# Mac
brew services start postgresql

# Linux
sudo service postgresql start
```

---

### Error: "Invalid DATABASE_URL"

**Solusi:**

1. Check `.env` file di folder `/backend`
2. Pastikan format DATABASE_URL benar
3. Test connection ke database:

```bash
psql -U oryza_user -d oryza_cms
```

---

### Error: "JWT Token Invalid" atau "Token Expired"

**Solusi:**

1. Login ulang untuk dapatkan token baru
2. Pastikan copy token dengan benar (tanpa spasi)
3. Format header: `Authorization: Bearer [token]`

---

### Port Already in Use

Jika error "Address already in use":

```bash
# Cari process yang menggunakan port 5000
lsof -i :5000  # Mac/Linux

# Kill process tersebut
kill -9 [PID]

# Atau ubah PORT di .env ke port lain (5001, 5002, dll)
```

---

## 📚 Additional Resources

Baca file dokumentasi di `/backend`:

- **API_DOCUMENTATION.js** - Lengkap semua endpoints
- **RBAC_EXPLANATION.js** - Penjelasan role system
- **TESTING_GUIDE.js** - Step-by-step testing guide

---

## ✅ Checklist FINAL

Sebelum production, pastikan:

- [ ] Database connected & running
- [ ] `.env` sudah ter-configure dengan benar
- [ ] `npm install` sudah selesai
- [ ] `npm start` atau `npm run dev` server running
- [ ] Test register → login → CRUD flow working
- [ ] Token generation working
- [ ] Role-based access control working correctly
- [ ] Log recorded di database
- [ ] Error handling bekerja dengan baik

Kalau semua ✓, aplikasi Anda siap digunakan!

---

## 🎯 Quick Start Summary

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Set up .env (copy from example dan edit)
nano .env

# 4. Setup database (Prisma)
npx prisma migrate deploy

# 5. Start server
npm start

# 6. Server running on http://localhost:5000
# 7. Test menggunakan Postman/Insomnia
```

---

## 📞 Need Help?

1. Check server logs di terminal
2. Baca error message dengan seksama
3. Cek section "Troubleshooting" di atas
4. Baca file dokumentasi di `/backend`

**Happy Coding! 🎉**
