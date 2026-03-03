const prisma = require("../config/db");

/**
 * Track page view untuk post
 */
exports.recordPageView = async (postId, ipAddress, userAgent, referer) => {
  try {
    const pageView = await prisma.pageView.create({
      data: {
        postId,
        ipAddress,
        userAgent: userAgent || null,
        referer: referer || null,
      },
    });

    // Update post views count
    await prisma.post.update({
      where: { id: postId },
      data: { views: { increment: 1 } },
    });

    return pageView;
  } catch (error) {
    console.error("Error recording page view:", error);
    throw error;
  }
};

/**
 * Get analytics overview dashboard
 */
exports.getAnalyticsOverview = async () => {
  try {
    // Total views untuk semua posts
    const totalViews = await prisma.pageView.count();

    // Total unique visitors (based on IP address)
    const uniqueVisitors = await prisma.pageView.findMany({
      distinct: ["ipAddress"],
      select: { ipAddress: true },
    });

    // Views per category
    const viewsByCategory = await prisma.post.groupBy({
      by: ["categoryId"],
      _sum: {
        views: true,
      },
      _count: {
        id: true,
      },
    });

    // Get category names
    const categoryViews = await Promise.all(
      viewsByCategory.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
          select: { name: true },
        });
        return {
          categoryName: category?.name || "Unknown",
          views: item._sum.views || 0,
          posts: item._count.id,
        };
      }),
    );

    // Top posts
    const topPosts = await prisma.post.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        slug: true,
        views: true,
        category: { select: { name: true } },
        createdAt: true,
      },
      orderBy: { views: "desc" },
      take: 10,
    });

    // Views trend (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const viewsTrend = await prisma.pageView.groupBy({
      by: ["viewedAt"],
      _count: { id: true },
      where: {
        viewedAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: { viewedAt: "asc" },
    });

    return {
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      categoryViews,
      topPosts,
      viewsTrend: viewsTrend.map((item) => ({
        date: item.viewedAt,
        views: item._count.id,
      })),
    };
  } catch (error) {
    console.error("Error getting analytics overview:", error);
    throw error;
  }
};

/**
 * Get all page views with pagination
 */
exports.getAllPageViews = async (page = 1, limit = 20, postId = null) => {
  try {
    const skip = (page - 1) * limit;

    const where = postId ? { postId } : {};

    const [pageViews, total] = await Promise.all([
      prisma.pageView.findMany({
        where,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              slug: true,
              views: true,
              category: { select: { name: true } },
            },
          },
        },
        orderBy: { viewedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.pageView.count({ where }),
    ]);

    return {
      data: pageViews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting page views:", error);
    throw error;
  }
};

/**
 * Get views for specific post
 */
exports.getPostViews = async (postId, page = 1, limit = 20) => {
  try {
    const skip = (page - 1) * limit;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { pageViews: { select: { id: true } } },
    });

    if (!post) {
      throw new Error("Post not found");
    }

    const pageViews = await prisma.pageView.findMany({
      where: { postId },
      orderBy: { viewedAt: "desc" },
      skip,
      take: limit,
    });

    const total = post.pageViews.length;

    return {
      postId,
      postTitle: post.title,
      totalViews: post.views,
      pageViews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Error getting post views:", error);
    throw error;
  }
};

/**
 * Delete page views (bulk)
 */
exports.deletePageViews = async (pageViewIds) => {
  try {
    if (!Array.isArray(pageViewIds) || pageViewIds.length === 0) {
      throw new Error("Invalid page view IDs");
    }

    // Get posts that will be affected
    const affectedPageViews = await prisma.pageView.findMany({
      where: { id: { in: pageViewIds } },
      select: { postId: true },
    });

    // Delete page views
    const deletedCount = await prisma.pageView.deleteMany({
      where: { id: { in: pageViewIds } },
    });

    // Update views count for affected posts
    const uniquePostIds = [
      ...new Set(affectedPageViews.map((pv) => pv.postId)),
    ];
    for (const postId of uniquePostIds) {
      const viewCount = await prisma.pageView.count({ where: { postId } });
      await prisma.post.update({
        where: { id: postId },
        data: { views: viewCount },
      });
    }

    return deletedCount;
  } catch (error) {
    console.error("Error deleting page views:", error);
    throw error;
  }
};

/**
 * Clear all page views for a specific post
 */
exports.clearPostViews = async (postId) => {
  try {
    const deletedCount = await prisma.pageView.deleteMany({
      where: { postId },
    });

    // Reset post views to 0
    await prisma.post.update({
      where: { id: postId },
      data: { views: 0 },
    });

    return deletedCount;
  } catch (error) {
    console.error("Error clearing post views:", error);
    throw error;
  }
};
