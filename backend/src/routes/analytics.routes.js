const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analytics.controller");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");

/**
 * PUBLIC ROUTES - Tidak perlu auth
 */
// Track page view (publik)
router.post("/track", analyticsController.trackPageView);

// Get analytics overview (PUBLIC - untuk semua user termasuk guest)
router.get("/overview", analyticsController.getAnalyticsOverview);

/**
 * ADMIN & SUPER_ADMIN ROUTES - Perlu auth + admin role
 */
// Get all page views dengan pagination
router.get(
  "/page-views",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  analyticsController.getAllPageViews,
);

// Get post views
router.get(
  "/post/:postId",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  analyticsController.getPostViews,
);

// Delete page views (bulk)
router.delete(
  "/page-views",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  analyticsController.deletePageViews,
);

// Clear post views
router.delete(
  "/post/:postId/views",
  authenticate,
  authorize(["ADMIN", "SUPER_ADMIN"]),
  analyticsController.clearPostViews,
);

module.exports = router;
