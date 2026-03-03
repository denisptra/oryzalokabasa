const analyticsService = require("../services/analytics.service");
const { recordLog } = require("../utils/logger");

/**
 * TRACK PAGE VIEW
 * @route POST /api/analytics/track
 * @access PUBLIC
 */
exports.trackPageView = async (req, res) => {
  try {
    const { postId } = req.body;

    if (!postId) {
      return res.status(400).json({
        status: "error",
        message: "Post ID is required",
      });
    }

    const ipAddress =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress ||
      "unknown";
    const userAgent = req.headers["user-agent"] || null;
    const referer = req.headers["referer"] || null;

    const pageView = await analyticsService.recordPageView(
      postId,
      ipAddress,
      userAgent,
      referer,
    );

    res.status(200).json({
      status: "success",
      message: "Page view recorded",
      data: pageView,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ANALYTICS OVERVIEW
 * @route GET /api/analytics/overview
 * @access ADMIN & SUPER_ADMIN
 */
exports.getAnalyticsOverview = async (req, res) => {
  try {
    const overview = await analyticsService.getAnalyticsOverview();

    res.status(200).json({
      status: "success",
      data: overview,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET ALL PAGE VIEWS
 * @route GET /api/analytics/page-views
 * @access ADMIN & SUPER_ADMIN
 */
exports.getAllPageViews = async (req, res) => {
  try {
    const { page = 1, limit = 20, postId } = req.query;

    const result = await analyticsService.getAllPageViews(
      parseInt(page),
      parseInt(limit),
      postId,
    );

    res.status(200).json({
      status: "success",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * GET POST VIEWS
 * @route GET /api/analytics/post/:postId
 * @access ADMIN & SUPER_ADMIN
 */
exports.getPostViews = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await analyticsService.getPostViews(
      postId,
      parseInt(page),
      parseInt(limit),
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * DELETE PAGE VIEWS (BULK)
 * @route DELETE /api/analytics/page-views
 * @access ADMIN & SUPER_ADMIN
 */
exports.deletePageViews = async (req, res) => {
  try {
    const { pageViewIds } = req.body;

    if (!Array.isArray(pageViewIds) || pageViewIds.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "Page view IDs array is required",
      });
    }

    const deletedCount = await analyticsService.deletePageViews(pageViewIds);

    await recordLog(req, {
      action: "DELETE_BULK",
      module: "ANALYTICS",
      details: { deletedCount, pageViewIds },
    });

    res.status(200).json({
      status: "success",
      message: `${deletedCount.count} page views deleted`,
      data: { deletedCount: deletedCount.count },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

/**
 * CLEAR POST VIEWS
 * @route DELETE /api/analytics/post/:postId/views
 * @access ADMIN & SUPER_ADMIN
 */
exports.clearPostViews = async (req, res) => {
  try {
    const { postId } = req.params;

    const deletedCount = await analyticsService.clearPostViews(postId);

    await recordLog(req, {
      action: "DELETE",
      module: "ANALYTICS",
      entityId: postId,
      details: { action: "clear_post_views", deletedCount },
    });

    res.status(200).json({
      status: "success",
      message: `Views cleared for post`,
      data: { deletedCount },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
