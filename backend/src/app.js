const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const postRoutes = require("./routes/post.routes");
const contactRoutes = require("./routes/contact.routes");
const galleryRoutes = require("./routes/gallery.routes");
const heroSliderRoutes = require("./routes/hero-slider.routes");
const settingsRoutes = require("./routes/settings.routes");
const logRoutes = require("./routes/log.routes");
const analyticsRoutes = require("./routes/analytics.routes");
const diagnostikRoutes = require("./routes/diagnostik.routes");
const teamRoutes = require("./routes/team.routes");

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
const uploadsPath = isProduction ? path.join("/tmp", "uploads") : path.join(__dirname, "../uploads");
app.use("/uploads", express.static(uploadsPath));

// Routes
app.use("/api", authRoutes); // Auth: register, login, logout
app.use("/api", userRoutes); // User CRUD (SUPER_ADMIN only)
app.use("/api", categoryRoutes); // Category CRUD (ADMIN & SUPER_ADMIN)
app.use("/api", postRoutes); // Post/Article CRUD (ADMIN & SUPER_ADMIN)
app.use("/api/contact", contactRoutes); // Contact messages (PUBLIC send, ADMIN+ manage)
app.use("/api", galleryRoutes); // Gallery/Photos CRUD (PUBLIC list, ADMIN+ manage)
app.use("/api", heroSliderRoutes); // Hero Slider CRUD (PUBLIC list, ADMIN+ manage)
app.use("/api", settingsRoutes); // Settings config (PUBLIC read, SUPER_ADMIN manage)
app.use("/api", logRoutes); // Audit logs (SUPER_ADMIN only)
app.use("/api/analytics", analyticsRoutes); // Analytics & page views tracking
app.use("/api/diagnostik", diagnostikRoutes); // System diagnostik
app.use("/api", teamRoutes); // Team Members CRUD

app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "Welcome to Oryza API",
    version: "1.0.0",
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: `Endpoint ${req.originalUrl} tidak ditemukan. Periksa kembali method (GET/POST) dan penulisan URL-nya.`,
  });
});

// Error Handler
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      status: "error",
      message: "Format JSON tidak valid",
    });
  }

  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message: "Terjadi kesalahan internal pada server",
  });
});

module.exports = app;
