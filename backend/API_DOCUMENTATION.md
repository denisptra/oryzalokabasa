# 📚 Dokumentasi API - Oryza Backend

**Base URL:** `http://localhost:5000/api`
**Version:** 1.0.0

---

## 📋 Daftar Isi

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Category](#category)
4. [Post/Article](#postarticle)
5. [Contact Messages](#contact-messages)
6. [Gallery](#gallery)
7. [Hero Slider](#hero-slider)
8. [Settings](#settings)
9. [Logs/Audit Trail](#logsaudit-trail)
10. [Error Handling](#error-handling)

---

## 🔐 Authentication

### 1. Register (Sign Up)

**Endpoint:** `POST /api/auth/register`
**Authentication:** ❌ Not Required
**Rate Limit:** No

**Request Body:**

```json
{
  "username": "string (required, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 6 chars)",
  "fullName": "string (optional)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Registration successful",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "USER"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `409 Conflict` - Email atau username sudah terdaftar

---

### 2. Login

**Endpoint:** `POST /api/auth/login`
**Authentication:** ❌ Not Required
**Rate Limit:** ✅ Yes (5 attempts per 15 minutes)

**Request Body:**

```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "USER|ADMIN|SUPER_ADMIN",
    "token": "JWT_TOKEN"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Validation error
- `401 Unauthorized` - Email/password salah
- `429 Too Many Requests` - Rate limit exceeded

---

### 3. Logout

**Endpoint:** `POST /api/auth/logout`
**Authentication:** ✅ Required (Bearer Token)

**Request Body:** (Empty)

**Response (200):**

```json
{
  "status": "success",
  "message": "Logout successful"
}
```

**Error Responses:**

- `401 Unauthorized` - Token tidak valid/expired

---

## 👥 User Management

### 1. Create User (SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/user/create`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Request Body:**

```json
{
  "username": "string (required, unique)",
  "email": "string (required, valid email, unique)",
  "password": "string (required, min 6 chars)",
  "fullName": "string (optional)",
  "role": "USER|ADMIN|SUPER_ADMIN (optional, default: USER)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "string"
  }
}
```

---

### 2. Get All Users (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/users`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Query Parameters:**

```
?page=1&limit=10&sort=createdAt&order=asc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "fullName": "string",
      "role": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 3. Get User by ID (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/user/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "User retrieved successfully",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

**Error Responses:**

- `404 Not Found` - User tidak ditemukan

---

### 4. Update User (SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/user/update/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Request Body:**

```json
{
  "username": "string (optional)",
  "email": "string (optional)",
  "fullName": "string (optional)",
  "role": "USER|ADMIN|SUPER_ADMIN (optional)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "User updated successfully",
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "fullName": "string",
    "role": "string"
  }
}
```

---

### 5. Delete User (SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/user/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "User deleted successfully"
}
```

---

## 📂 Category

### 1. Get All Categories

**Endpoint:** `GET /api/categories`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=10&sort=name&order=asc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Categories retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "slug": "string",
      "description": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 20,
    "pages": 2
  }
}
```

---

### 2. Get Category by ID

**Endpoint:** `GET /api/category/:id`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Category retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### 3. Create Category (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/category/create`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "name": "string (required)",
  "slug": "string (optional, auto-generated if not provided)",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Category created successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string"
  }
}
```

---

### 4. Update Category (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/category/update/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "name": "string (optional)",
  "slug": "string (optional)",
  "description": "string (optional)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Category updated successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "slug": "string",
    "description": "string"
  }
}
```

---

### 5. Delete Category (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/category/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Category deleted successfully"
}
```

---

## 📰 Post/Article

### 1. Get All Posts (PUBLIC)

**Endpoint:** `GET /api/posts`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=10&sort=createdAt&order=desc&status=published
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Posts retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "content": "string (HTML)",
      "excerpt": "string",
      "thumbnail": "url",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "string"
      },
      "authorId": "uuid",
      "author": {
        "id": "uuid",
        "username": "string"
      },
      "status": "draft|published",
      "viewCount": "number",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

### 2. Get Post by ID (PUBLIC)

**Endpoint:** `GET /api/post/:id`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Post retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "content": "string (HTML)",
    "excerpt": "string",
    "thumbnail": "url",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "string"
    },
    "authorId": "uuid",
    "author": {
      "id": "uuid",
      "username": "string",
      "fullName": "string"
    },
    "status": "draft|published",
    "viewCount": "number",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### 3. Get Post by Slug (PUBLIC)

**Endpoint:** `GET /api/post/slug/:slug`
**Authentication:** ❌ Not Required

**Response (200):** Same as Get Post by ID

---

### 4. Get Posts by Category (PUBLIC)

**Endpoint:** `GET /api/posts/category/:categoryId`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=10&sort=createdAt&order=desc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Posts by category retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "thumbnail": "url",
      "categoryId": "uuid",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

---

### 5. Search Posts (PUBLIC)

**Endpoint:** `GET /api/posts/search/:keyword`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=10
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Posts search results",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "excerpt": "string",
      "thumbnail": "url",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "pages": 1
  }
}
```

---

### 6. Create Post (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/post/create`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "title": "string (required)",
  "slug": "string (optional, auto-generated if not provided)",
  "content": "string (required, HTML format)",
  "excerpt": "string (required)",
  "thumbnail": "url (optional)",
  "categoryId": "uuid (required)",
  "status": "draft|published (optional, default: draft)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Post created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "content": "string",
    "excerpt": "string",
    "thumbnail": "url",
    "categoryId": "uuid",
    "status": "draft",
    "viewCount": 0,
    "createdAt": "timestamp"
  }
}
```

---

### 7. Update Post (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/post/update/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "title": "string (optional)",
  "slug": "string (optional)",
  "content": "string (optional)",
  "excerpt": "string (optional)",
  "thumbnail": "url (optional)",
  "categoryId": "uuid (optional)",
  "status": "draft|published (optional)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Post updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "slug": "string",
    "status": "draft|published",
    "updatedAt": "timestamp"
  }
}
```

---

### 8. Delete Post (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/post/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Post deleted successfully"
}
```

---

## 💬 Contact Messages

### 1. Send Contact Message (PUBLIC)

**Endpoint:** `POST /api/contact/send`
**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "name": "string (required)",
  "email": "string (required, valid email)",
  "phone": "string (optional)",
  "subject": "string (required)",
  "message": "string (required)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "subject": "string",
    "status": "unread",
    "createdAt": "timestamp"
  }
}
```

---

### 2. Get All Contact Messages (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/contact/messages`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Query Parameters:**

```
?page=1&limit=10&sort=createdAt&order=desc&status=unread,read,archived
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Messages retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "name": "string",
      "email": "string",
      "phone": "string",
      "subject": "string",
      "message": "string",
      "status": "unread|read|archived",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "pages": 5
  }
}
```

---

### 3. Get Message Statistics (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/contact/stats`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Statistics retrieved successfully",
  "data": {
    "totalMessages": 150,
    "unreadCount": 12,
    "readCount": 85,
    "archivedCount": 53,
    "lastMessageAt": "timestamp"
  }
}
```

---

### 4. Get Message by ID (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/contact/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Message retrieved successfully",
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "subject": "string",
    "message": "string",
    "status": "unread|read|archived",
    "createdAt": "timestamp"
  }
}
```

---

### 5. Mark Message as Read (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/contact/mark-read/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Message marked as read",
  "data": {
    "id": "uuid",
    "status": "read"
  }
}
```

---

### 6. Archive Message (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/contact/archive/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Message archived successfully",
  "data": {
    "id": "uuid",
    "status": "archived"
  }
}
```

---

### 7. Delete Message (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/contact/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Message deleted successfully"
}
```

---

## 🖼️ Gallery

### 1. Get All Gallery Images (PUBLIC)

**Endpoint:** `GET /api/gallery`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=12&sort=createdAt&order=desc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery images retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "url",
      "categoryId": "uuid",
      "category": {
        "id": "uuid",
        "name": "string"
      },
      "eventDate": "date",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 120,
    "pages": 10
  }
}
```

---

### 2. Get Gallery Statistics (PUBLIC)

**Endpoint:** `GET /api/gallery/stats`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery statistics retrieved successfully",
  "data": {
    "totalImages": 250,
    "totalCategories": 8,
    "latestImageDate": "timestamp"
  }
}
```

---

### 3. Get Gallery by Category (PUBLIC)

**Endpoint:** `GET /api/gallery/category/:categoryId`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=12
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery images by category retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "url",
      "eventDate": "date",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "pages": 4
  }
}
```

---

### 4. Get Gallery by Event Date (PUBLIC)

**Endpoint:** `GET /api/gallery/event/:eventDate`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=12
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery images by event date retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "imageUrl": "url",
      "createdAt": "timestamp"
    }
  ]
}
```

---

### 5. Get Gallery Image by ID (PUBLIC)

**Endpoint:** `GET /api/gallery/:id`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery image retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "imageUrl": "url",
    "categoryId": "uuid",
    "category": {
      "id": "uuid",
      "name": "string"
    },
    "eventDate": "date",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### 6. Upload Image (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/gallery/upload`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Format:** `multipart/form-data`

**Form Data:**

```
- image: File (required, image/* content-type)
- title: string (required)
- description: string (optional)
- categoryId: uuid (required)
- eventDate: date (optional, format: YYYY-MM-DD)
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "imageUrl": "url",
    "categoryId": "uuid",
    "createdAt": "timestamp"
  }
}
```

---

### 7. Update Gallery Image (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/gallery/update/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "categoryId": "uuid (optional)",
  "eventDate": "date (optional)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery image updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "updatedAt": "timestamp"
  }
}
```

---

### 8. Delete Gallery Image (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/gallery/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Gallery image deleted successfully"
}
```

---

## 🎠 Hero Slider

### 1. Get All Sliders (PUBLIC)

**Endpoint:** `GET /api/hero-slider`
**Authentication:** ❌ Not Required

**Query Parameters:**

```
?page=1&limit=10&sort=order&order=asc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Hero sliders retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "url",
      "buttonText": "string",
      "buttonUrl": "url",
      "isActive": "boolean",
      "order": "number",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

---

### 2. Get Active Sliders (PUBLIC)

**Endpoint:** `GET /api/hero-slider/active`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Active hero sliders retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "imageUrl": "url",
      "buttonText": "string",
      "buttonUrl": "url",
      "order": "number"
    }
  ]
}
```

---

### 3. Get Slider by ID (PUBLIC)

**Endpoint:** `GET /api/hero-slider/:id`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Hero slider retrieved successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string",
    "imageUrl": "url",
    "buttonText": "string",
    "buttonUrl": "url",
    "isActive": "boolean",
    "order": "number",
    "createdAt": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

---

### 4. Create Slider (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/hero-slider/create`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Format:** `multipart/form-data`

**Form Data:**

```
- image: File (required, image/* content-type)
- title: string (required)
- description: string (required)
- buttonText: string (optional)
- buttonUrl: string (optional)
- isActive: boolean (optional, default: true)
- order: number (optional, auto-assigned if not provided)
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Hero slider created successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "imageUrl": "url",
    "isActive": true,
    "order": "number"
  }
}
```

---

### 5. Update Slider (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/hero-slider/update/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "buttonText": "string (optional)",
  "buttonUrl": "string (optional)",
  "order": "number (optional)"
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Hero slider updated successfully",
  "data": {
    "id": "uuid",
    "title": "string",
    "description": "string"
  }
}
```

---

### 6. Toggle Slider Status (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/hero-slider/toggle/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Slider status toggled successfully",
  "data": {
    "id": "uuid",
    "isActive": "boolean"
  }
}
```

---

### 7. Reorder Sliders (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `PUT /api/hero-slider/reorder`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Request Body:**

```json
{
  "sliders": [
    {
      "id": "uuid",
      "order": 1
    },
    {
      "id": "uuid",
      "order": 2
    }
  ]
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Sliders reordered successfully",
  "data": [
    {
      "id": "uuid",
      "order": 1
    },
    {
      "id": "uuid",
      "order": 2
    }
  ]
}
```

---

### 8. Delete Slider (ADMIN & SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/hero-slider/delete/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** ADMIN, SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Hero slider deleted successfully"
}
```

---

## ⚙️ Settings

### 1. Get Setting by Key (PUBLIC)

**Endpoint:** `GET /api/settings/key/:key`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Setting retrieved successfully",
  "data": {
    "key": "string",
    "value": "string|object",
    "type": "string|number|boolean|object",
    "description": "string"
  }
}
```

---

### 2. Get Multiple Settings (PUBLIC)

**Endpoint:** `POST /api/settings/batch`
**Authentication:** ❌ Not Required

**Request Body:**

```json
{
  "keys": ["site_name", "site_logo", "site_description"]
}
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Settings retrieved successfully",
  "data": {
    "site_name": {
      "key": "site_name",
      "value": "Oryza Website"
    },
    "site_logo": {
      "key": "site_logo",
      "value": "url"
    },
    "site_description": {
      "key": "site_description",
      "value": "Website deskripsi"
    }
  }
}
```

---

### 3. Get Settings Summary (PUBLIC)

**Endpoint:** `GET /api/settings/summary`
**Authentication:** ❌ Not Required

**Response (200):**

```json
{
  "status": "success",
  "message": "Settings summary retrieved successfully",
  "data": {
    "siteName": "string",
    "siteDescription": "string",
    "siteLogo": "url",
    "siteEmail": "email",
    "sitePhone": "phone",
    "socialMedia": {
      "facebook": "url",
      "twitter": "url",
      "instagram": "url"
    }
  }
}
```

---

### 4. Get All Settings (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/settings`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Query Parameters:**

```
?page=1&limit=20&sort=key&order=asc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Settings retrieved successfully",
  "data": [
    {
      "key": "string",
      "value": "string|object",
      "type": "string|number|boolean|object",
      "description": "string",
      "createdAt": "timestamp",
      "updatedAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 30,
    "pages": 2
  }
}
```

---

### 5. Save/Create Setting (SUPER_ADMIN ONLY)

**Endpoint:** `POST /api/settings/save`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Request Body:**

```json
{
  "key": "string (required, unique)",
  "value": "string|object (required)",
  "type": "string|number|boolean|object (optional)",
  "description": "string (optional)"
}
```

**Response (201):**

```json
{
  "status": "success",
  "message": "Setting saved successfully",
  "data": {
    "key": "string",
    "value": "string|object",
    "type": "string"
  }
}
```

---

### 6. Delete Setting (SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/settings/delete/:key`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Setting deleted successfully"
}
```

---

### 7. Reset All Settings (SUPER_ADMIN ONLY)

**Endpoint:** `DELETE /api/settings/reset`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Warning:** ⚠️ CAUTION! This will delete all settings. Make sure you have a backup.

**Response (200):**

```json
{
  "status": "success",
  "message": "All settings have been reset"
}
```

---

## 📋 Logs/Audit Trail

### 1. Get All Logs (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/logs`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Query Parameters:**

```
?page=1&limit=50&sort=createdAt&order=desc&module=posts&action=create
```

**Response (200):**

```json
{
  "status": "success",
  "message": "Logs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "user": {
        "id": "uuid",
        "username": "string"
      },
      "module": "string (posts|users|categories|etc)",
      "action": "string (create|read|update|delete)",
      "description": "string",
      "changes": "object (optional)",
      "ipAddress": "string",
      "userAgent": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "pages": 25
  }
}
```

---

### 2. Get Log by ID (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/log/:id`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Response (200):**

```json
{
  "status": "success",
  "message": "Log retrieved successfully",
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string"
    },
    "module": "string",
    "action": "string",
    "description": "string",
    "changes": {
      "before": "object",
      "after": "object"
    },
    "ipAddress": "string",
    "userAgent": "string",
    "createdAt": "timestamp"
  }
}
```

---

### 3. Get Logs by User (SUPER_ADMIN ONLY)

**Endpoint:** `GET /api/logs/user/:userId`
**Authentication:** ✅ Required (Bearer Token)
**Authorization:** SUPER_ADMIN

**Query Parameters:**

```
?page=1&limit=50&sort=createdAt&order=desc
```

**Response (200):**

```json
{
  "status": "success",
  "message": "User logs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "module": "string",
      "action": "string",
      "description": "string",
      "createdAt": "timestamp"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 180,
    "pages": 4
  }
}
```

---

## Error Handling

### Standard Error Response Format

Semua error response akan mengikuti format ini:

```json
{
  "status": "error",
  "message": "Error message describing what went wrong",
  "errors": {
    "field_name": "Field validation error message (optional)"
  }
}
```

### Common HTTP Status Codes

| Status Code | Meaning                                                                  |
| ----------- | ------------------------------------------------------------------------ |
| 400         | Bad Request - Validation error atau format request tidak valid           |
| 401         | Unauthorized - Token tidak ada, invalid, atau expired                    |
| 403         | Forbidden - User tidak memiliki permission/authorization yang diperlukan |
| 404         | Not Found - Resource yang diminta tidak ditemukan                        |
| 409         | Conflict - Resource sudah ada atau ada conflict data                     |
| 429         | Too Many Requests - Rate limit exceeded                                  |
| 500         | Internal Server Error - Error pada server                                |

### Example Error Responses

**Validation Error (400):**

```json
{
  "status": "error",
  "message": "Validation failed",
  "errors": {
    "email": "Email is required and must be valid",
    "password": "Password must be at least 6 characters"
  }
}
```

**Unauthorized (401):**

```json
{
  "status": "error",
  "message": "Authentication required. Please provide a valid token."
}
```

**Forbidden (403):**

```json
{
  "status": "error",
  "message": "You don't have permission to access this resource"
}
```

**Not Found (404):**

```json
{
  "status": "error",
  "message": "Resource not found"
}
```

---

## Authentication Header

Untuk endpoints yang memerlukan authentication, gunakan header berikut:

```
Authorization: Bearer <JWT_TOKEN>
```

### Contoh Request dengan Authentication:

```bash
curl -X GET "http://localhost:5000/api/users" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Role Based Access Control (RBAC)

### Roles dan Permissions:

| Role        | Permissions                                                                                                 |
| ----------- | ----------------------------------------------------------------------------------------------------------- |
| USER        | Dapat membaca post/kategori/gallery public endpoints                                                        |
| ADMIN       | USER permissions + Create/Update/Delete posts, categories, galleries, hero sliders, manage contact messages |
| SUPER_ADMIN | ADMIN permissions + User management, Settings management, View audit logs                                   |

---

## Pagination

Endpoints yang mendukung pagination akan mengembalikan object `pagination`:

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "pages": 15
  }
}
```

### Query Parameters untuk Pagination:

- `page`: Halaman yang diinginkan (default: 1)
- `limit`: Jumlah items per halaman (default: 10)
- `sort`: Field untuk sorting (default: createdAt)
- `order`: Urutan sorting - `asc` atau `desc` (default: desc)

---

## Contoh Usage Lengkap

### 1. Register User Baru

```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "fullName": "John Doe"
  }'
```

### 2. Login

```bash
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

### 3. Create Post (dengan token)

```bash
curl -X POST "http://localhost:5000/api/post/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "title": "Welcome to Oryza",
    "content": "<h1>Hello</h1>",
    "excerpt": "This is first post",
    "categoryId": "category-uuid",
    "status": "published"
  }'
```

### 4. Get All Published Posts (public)

```bash
curl -X GET "http://localhost:5000/api/posts?page=1&limit=10&status=published" \
  -H "Content-Type: application/json"
```

---

## Notes

- Semua timestamps dalam format ISO 8601
- File upload harus dalam format `multipart/form-data`
- Semua string fields memiliki batasan panjang karena keamanan database
- Slug otomatis di-generate dari title jika tidak disediakan
- Setiap user hanya bisa logout dengan token mereka sendiri

---

**Last Updated:** 2024
**API Version:** 1.0.0
**Status:** Production Ready
