const { db } = require("../config/db");

/**
 * DIAGNOSTIK - Check system status
 */
exports.getDiagnostik = async (req, res) => {
  try {
    // Check database connection
    const dbStatus = await db.$queryRaw`SELECT 1`;

    // Count tables
    const pageViewCount = await db.pageView.count();
    const postCount = await db.post.count();
    const userCount = await db.user.count();

    // Get sample data
    const samplePageViews = await db.pageView.findMany({
      take: 5,
      orderBy: { viewedAt: "desc" },
      include: { post: { select: { title: true } } },
    });

    // Get analytics overview
    const totalViews = await db.pageView.count();
    const uniqueVisitors = await db.pageView.findMany({
      distinct: ["ipAddress"],
      select: { ipAddress: true },
    });

    const overview = await db.post.findMany({
      select: {
        id: true,
        title: true,
        views: true,
      },
      orderBy: { views: "desc" },
      take: 5,
    });

    res.status(200).json({
      status: "success",
      timestamp: new Date(),
      database: {
        connected: !!dbStatus,
        pageViews: pageViewCount,
        posts: postCount,
        users: userCount,
      },
      analytics: {
        totalViews,
        uniqueVisitors: uniqueVisitors.length,
        topPosts: overview,
        samplePageViews: samplePageViews.map((pv) => ({
          id: pv.id,
          postTitle: pv.post?.title || "N/A",
          ipAddress: pv.ipAddress,
          viewedAt: pv.viewedAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
      details: "Failed to get diagnostik data",
    });
  }
};
