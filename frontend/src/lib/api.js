// API Client Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://oryzalokabasa.com/api";

// Helper to get auth token from sessionStorage
const getToken = () => {
  if (typeof window !== "undefined") {
    return sessionStorage.getItem("authToken");
  }
  return null;
};

// Cache in-memory untuk menyimpan hasil fetching GET supaya rendering instant
const getCache = new Map();

// Fetch wrapper with common headers
export const apiFetch = async (endpoint, options = {}, skipCache = false) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const isGet = !options.method || options.method === "GET";

  // Jika sedang di browser, dan method GET, dan cache tidak di-skip
  if (typeof window !== "undefined" && isGet && !skipCache && getCache.has(url)) {
    // Jalan asinkron di background untuk memastikan data ter-update
    fetchData(url, options, endpoint).then(freshData => {
      // Jika freshData berbeda dari cache, kita update map (berguna untuk next load)
      getCache.set(url, freshData);
    }).catch(() => { });

    // Langsung return data cache seketika
    return getCache.get(url);
  }

  return fetchData(url, options, endpoint, isGet);
};

// Internal fetch logic
const fetchData = async (url, options, endpoint, isGet) => {
  const headers = { ...options.headers };

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Add auth token if available
  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    cache: "no-store",
    ...options,
    headers,
  });

  // Check if the response is JSON before parsing
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    // Server returned non-JSON (e.g. Nginx HTML error page)
    if (response.status === 413) {
      throw new Error("Ukuran file terlalu besar. Batas maksimal adalah 10MB (Gambar) atau 50MB (Video). Silakan coba lagi dengan file yang lebih kecil.");
    }
    if (response.status === 502 || response.status === 504) {
      throw new Error("Server sedang tidak tersedia. Silakan coba lagi nanti.");
    }
    if (response.status === 404) {
      throw new Error(`Endpoint API tidak ditemukan: ${endpoint}`);
    }
    throw new Error(`Server mengembalikan respons yang tidak valid (HTTP ${response.status}). Periksa koneksi atau coba lagi nanti.`);
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "API request failed");
  }

  // Simpan ke cache jika sukses dan metodenya GET
  if (typeof window !== "undefined" && isGet) {
    getCache.set(url, data);
  } else if (typeof window !== "undefined" && !isGet) {
    // Ekstraksi path utama (contoh: '/team/create' -> 'team')
    const segments = endpoint.split('/').filter(Boolean);
    const basePath = segments[0] || '';

    // HANYA KOSONGKAN CACHE untuk endpoint yang berkaitan
    // Dengan ini, edit "Tim" tidak akan membuat "Gallery" atau "Artikel" lambat lagi.
    if (basePath) {
      for (const key of getCache.keys()) {
        if (key.includes(`/${basePath}`) || (basePath === 'user' && key.includes('/users'))) {
          getCache.delete(key);
        }
      }
    } else {
      getCache.clear();
    }
  }

  return data;
};

// ===================== AUTH API =====================
export const authAPI = {
  register: async (name, email, password) => {
    return apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },

  login: async (email, password) => {
    return apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async () => {
    return apiFetch("/auth/logout", {
      method: "POST",
    });
  },

  getToken: () => getToken(),

  setToken: (token) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authToken", token);
    }
  },

  clearToken: () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("authToken");
    }
  },

  isAuthenticated: () => {
    return getToken() !== null;
  },
};

// ===================== USER API (SUPER_ADMIN only) =====================
export const userAPI = {
  getAll: async () => {
    return apiFetch("/users");
  },

  getById: async (id) => {
    return apiFetch(`/user/${id}`);
  },

  create: async (data) => {
    return apiFetch("/user/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiFetch(`/user/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiFetch(`/user/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== CATEGORY API =====================
export const categoryAPI = {
  getAll: async () => {
    return apiFetch("/categories");
  },

  getById: async (id) => {
    return apiFetch(`/category/${id}`);
  },

  create: async (data) => {
    return apiFetch("/category/create", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  update: async (id, data) => {
    return apiFetch(`/category/update/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiFetch(`/category/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== POST API =====================
export const postAPI = {
  getAll: async (params = "") => {
    return apiFetch(`/posts${params ? `?${params}` : ""}`);
  },

  getById: async (id) => {
    return apiFetch(`/post/${id}`);
  },

  getBySlug: async (slug) => {
    return apiFetch(`/post/slug/${slug}`);
  },

  getByCategory: async (categoryId) => {
    return apiFetch(`/posts/category/${categoryId}`);
  },

  search: async (keyword) => {
    return apiFetch(`/posts/search/${keyword}`);
  },

  // Create post with file upload (FormData)
  create: async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("categoryId", data.categoryId);
    if (data.status) formData.append("status", data.status);
    if (data.tags) formData.append("tags", data.tags);
    if (data.metaTitle) formData.append("metaTitle", data.metaTitle);
    if (data.metaDescription)
      formData.append("metaDescription", data.metaDescription);
    if (data.slug) formData.append("slug", data.slug);
    if (data.thumbnailFile)
      formData.append("thumbnailFile", data.thumbnailFile);
    if (data.thumbnail && typeof data.thumbnail === "string")
      formData.append("thumbnail", data.thumbnail);

    return apiFetch("/post/create", {
      method: "POST",
      body: formData,
    });
  },

  // Update post with file upload (FormData)
  update: async (id, data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.content) formData.append("content", data.content);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.status) formData.append("status", data.status);
    if (data.tags !== undefined) formData.append("tags", data.tags);
    if (data.metaTitle !== undefined)
      formData.append("metaTitle", data.metaTitle);
    if (data.metaDescription !== undefined)
      formData.append("metaDescription", data.metaDescription);
    if (data.slug) formData.append("slug", data.slug);
    if (data.thumbnailFile)
      formData.append("thumbnailFile", data.thumbnailFile);
    if (data.thumbnail && typeof data.thumbnail === "string")
      formData.append("thumbnail", data.thumbnail);

    return apiFetch(`/post/update/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  delete: async (id) => {
    return apiFetch(`/post/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== CONTACT API =====================
export const contactAPI = {
  send: async (data) => {
    return apiFetch("/contact/send", {
      method: "POST",
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        topic: data.subject || data.topic || "",
        message: data.message,
      }),
    });
  },

  getAll: async (params = "") => {
    return apiFetch(`/contact/messages${params ? `?${params}` : ""}`);
  },

  getStats: async () => {
    return apiFetch("/contact/stats");
  },

  getById: async (id) => {
    return apiFetch(`/contact/${id}`);
  },

  markAsRead: async (id) => {
    return apiFetch(`/contact/mark-read/${id}`, {
      method: "PUT",
    });
  },

  markAsArchived: async (id) => {
    return apiFetch(`/contact/archive/${id}`, {
      method: "PUT",
    });
  },

  delete: async (id) => {
    return apiFetch(`/contact/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== GALLERY API =====================
export const galleryAPI = {
  getAll: async () => {
    return apiFetch("/galleris");
  },

  getById: async (id) => {
    return apiFetch(`/gallery/${id}`);
  },

  getStats: async () => {
    return apiFetch("/gallery/stats");
  },

  getByCategory: async (categoryId) => {
    return apiFetch(`/gallery/category/${categoryId}`);
  },

  getByEventDate: async (eventDate) => {
    return apiFetch(`/gallery/event/${eventDate}`);
  },

  // Upload with file (FormData)
  upload: async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.eventDate) formData.append("eventDate", data.eventDate);

    return apiFetch("/gallery/upload", {
      method: "POST",
      body: formData,
    });
  },

  // Update with optional new file
  update: async (id, data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.categoryId) formData.append("categoryId", data.categoryId);
    if (data.eventDate) formData.append("eventDate", data.eventDate);

    return apiFetch(`/gallery/update/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  delete: async (id) => {
    return apiFetch(`/gallery/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== HERO SLIDER API =====================
export const heroSliderAPI = {
  getAll: async () => {
    return apiFetch("/hero-slider/");
  },

  getActive: async () => {
    return apiFetch("/hero-slider/active");
  },

  getById: async (id) => {
    return apiFetch(`/hero-slider/${id}`);
  },

  // Create with file upload
  create: async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    if (data.subtitle) formData.append("subtitle", data.subtitle);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.link) formData.append("link", data.link);
    formData.append("isActive", data.isActive !== false ? "true" : "false");
    formData.append("order", String(data.order || 0));

    return apiFetch("/hero-slider/create", {
      method: "POST",
      body: formData,
    });
  },

  // Update with optional new file
  update: async (id, data) => {
    const formData = new FormData();
    if (data.title) formData.append("title", data.title);
    if (data.subtitle !== undefined) formData.append("subtitle", data.subtitle);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.link !== undefined) formData.append("link", data.link);
    if (data.isActive !== undefined)
      formData.append("isActive", data.isActive ? "true" : "false");
    if (data.order !== undefined) formData.append("order", String(data.order));

    return apiFetch(`/hero-slider/update/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  toggle: async (id) => {
    return apiFetch(`/hero-slider/toggle/${id}`, {
      method: "PUT",
    });
  },

  reorder: async (data) => {
    return apiFetch("/hero-slider/reorder", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiFetch(`/hero-slider/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== TEAM MEMBER API =====================
export const teamAPI = {
  getAll: async () => {
    return apiFetch("/team/");
  },

  getActive: async () => {
    return apiFetch("/team/active");
  },

  getById: async (id) => {
    return apiFetch(`/team/${id}`);
  },

  // Create with file upload
  create: async (data) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("role", data.role);
    if (data.imageFile) formData.append("image", data.imageFile);
    formData.append("isActive", data.isActive !== false ? "true" : "false");
    formData.append("order", String(data.order || 0));

    return apiFetch("/team/create", {
      method: "POST",
      body: formData,
    });
  },

  // Update with optional new file
  update: async (id, data) => {
    const formData = new FormData();
    if (data.name) formData.append("name", data.name);
    if (data.role) formData.append("role", data.role);
    if (data.imageFile) formData.append("image", data.imageFile);
    if (data.isActive !== undefined)
      formData.append("isActive", data.isActive ? "true" : "false");
    if (data.order !== undefined) formData.append("order", String(data.order));

    return apiFetch(`/team/update/${id}`, {
      method: "PUT",
      body: formData,
    });
  },

  toggle: async (id) => {
    return apiFetch(`/team/toggle/${id}`, {
      method: "PUT",
    });
  },

  reorder: async (data) => {
    return apiFetch("/team/reorder", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete: async (id) => {
    return apiFetch(`/team/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== LOG API (SUPER_ADMIN only) =====================
export const logAPI = {
  getAll: async (params = "") => {
    return apiFetch(`/logs${params ? `?${params}` : ""}`);
  },

  getById: async (id) => {
    return apiFetch(`/log/${id}`);
  },

  getByUser: async (userId) => {
    return apiFetch(`/logs/user/${userId}`);
  },
};

// ===================== ANALYTICS API =====================
export const analyticsAPI = {
  // Track page view (PUBLIC)
  trackPageView: async (postId) => {
    try {
      return await apiFetch("/analytics/track", {
        method: "POST",
        body: JSON.stringify({ postId }),
      });
    } catch (error) {
      console.warn("Failed to track page view:", error);
      // Don't throw, tracking is not critical
    }
  },

  // Get analytics overview (ADMIN+)
  getOverview: async () => {
    return apiFetch("/analytics/overview");
  },

  // Get all page views with pagination (ADMIN+)
  getPageViews: async (page = 1, limit = 20, postId = null) => {
    let url = `/analytics/page-views?page=${page}&limit=${limit}`;
    if (postId) {
      url += `&postId=${postId}`;
    }
    return apiFetch(url);
  },

  // Get views for specific post (ADMIN+)
  getPostViews: async (postId, page = 1, limit = 20) => {
    return apiFetch(`/analytics/post/${postId}?page=${page}&limit=${limit}`);
  },

  // Delete page views (bulk) (ADMIN+)
  deletePageViews: async (pageViewIds) => {
    return apiFetch("/analytics/page-views", {
      method: "DELETE",
      body: JSON.stringify({ pageViewIds }),
    });
  },

  // Clear all views for a post (ADMIN+)
  clearPostViews: async (postId) => {
    return apiFetch(`/analytics/post/${postId}/views`, {
      method: "DELETE",
    });
  },
};

// ===================== VIDEO API =====================
export const videoAPI = {
  getActive: async () => {
    return apiFetch("/homepage-video/active");
  },

  getAll: async () => {
    return apiFetch("/homepage-video/");
  },

  save: async (data) => {
    // If it's FormData (for file upload), just pass it
    if (data instanceof FormData) {
      return apiFetch("/homepage-video/save", {
        method: "POST",
        body: data,
      });
    }
    
    // Otherwise it's regular JSON (for title/status updates)
    return apiFetch("/homepage-video/save", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  toggle: async (id) => {
    return apiFetch(`/homepage-video/toggle/${id}`, {
      method: "PUT",
    });
  },

  delete: async (id) => {
    return apiFetch(`/homepage-video/delete/${id}`, {
      method: "DELETE",
    });
  },
};

// ===================== DIAGNOSTIK API =====================
export const diagnostikAPI = {
  getStatus: async () => {
    return apiFetch("/diagnostik/status");
  },
  getSidebarStats: async () => {
    return apiFetch("/diagnostik/sidebar-stats");
  }
};

// ===================== HELPER =====================
// Get full URL for uploaded images
export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") ||
    "https://oryzalokabasa.com";
  return `${baseUrl}${path}`;
};
