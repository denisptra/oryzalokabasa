const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.log.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.heroSlider.deleteMany();
  await prisma.gallery.deleteMany();
  await prisma.post.deleteMany();
  await prisma.category.deleteMany();
  await prisma.setting.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create Users
  console.log("👥 Creating users...");
  const superAdminPassword = await bcrypt.hash("admin123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const superAdmin = await prisma.user.create({
    data: {
      name: "Super Admin",
      email: "superadmin@oryza.com",
      password: superAdminPassword,
      role: "SUPER_ADMIN",
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@oryza.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Created users:`);
  console.log(`   - SUPER_ADMIN: superadmin@oryza.com (password: admin123)`);
  console.log(`   - ADMIN: admin@oryza.com (password: admin123)`);

  // 2. Create Categories
  console.log("📂 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Technology",
        slug: "technology",
      },
    }),
    prisma.category.create({
      data: {
        name: "Lifestyle",
        slug: "lifestyle",
      },
    }),
    prisma.category.create({
      data: {
        name: "Travel",
        slug: "travel",
      },
    }),
    prisma.category.create({
      data: {
        name: "Food",
        slug: "food",
      },
    }),
  ]);
  console.log(`✅ Created ${categories.length} categories`);

  // 3. Create Posts
  console.log("📝 Creating posts...");
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        title: "Getting Started with Next.js 16",
        slug: "getting-started-with-nextjs-16",
        content:
          "<h2>Introduction to Next.js 16</h2><p>Next.js 16 brings powerful new features including Turbopack for faster builds...</p>",
        thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop",
        metaTitle: "Next.js 16 Guide",
        metaDescription:
          "Learn the basics of Next.js 16 with this comprehensive guide",
        tags: "nextjs, javascript, react, web-development",
        status: "PUBLISHED",
        views: 1240,
        categoryId: categories[0].id,
        authorId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "The Art of Minimalist Living",
        slug: "art-of-minimalist-living",
        content:
          "<h2>Embrace Simplicity</h2><p>Minimalism is not just about owning less, it's about living more intentionally...</p>",
        thumbnail: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=800&h=500&fit=crop",
        metaTitle: "Minimalist Living",
        metaDescription: "Discover the benefits of minimalist living",
        tags: "lifestyle, minimalism, wellness",
        status: "PUBLISHED",
        views: 856,
        categoryId: categories[1].id,
        authorId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Exploring the Streets of Tokyo",
        slug: "exploring-streets-of-tokyo",
        content:
          "<h2>Tokyo Travel Guide</h2><p>Discover hidden gems and must-visit places in Tokyo, Japan...</p>",
        thumbnail: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
        metaTitle: "Tokyo Travel Guide",
        metaDescription: "Complete guide to exploring Tokyo",
        tags: "travel, japan, tokyo, asia",
        status: "PUBLISHED",
        views: 2104,
        categoryId: categories[2].id,
        authorId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "Best Coffee Shops in Bali",
        slug: "best-coffee-shops-in-bali",
        content:
          "<h2>Coffee Culture in Bali</h2><p>Bali has become a hub for coffee enthusiasts with amazing specialty coffee shops...</p>",
        thumbnail: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&h=500&fit=crop",
        metaTitle: "Coffee Shops in Bali",
        metaDescription: "Guide to the best coffee shops in Bali",
        tags: "food, coffee, bali, indonesia",
        status: "PUBLISHED",
        views: 1502,
        categoryId: categories[3].id,
        authorId: admin.id,
      },
    }),
    prisma.post.create({
      data: {
        title: "The Future of AI in Web Development",
        slug: "future-of-ai-in-web-development",
        content:
          "<h2>AI Revolution</h2><p>Artificial Intelligence is transforming how we build web applications...</p>",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=500&fit=crop",
        metaTitle: "AI in Web Development",
        metaDescription: "How AI is changing web development",
        tags: "technology, ai, machine-learning, web-development",
        status: "DRAFT",
        views: 324,
        categoryId: categories[0].id,
        authorId: admin.id,
      },
    }),
  ]);
  console.log(`✅ Created ${posts.length} posts`);

  // 4. Create Gallery Images
  console.log("🖼️  Creating gallery images...");
  const gallery = await Promise.all([
    prisma.gallery.create({
      data: {
        title: "Tokyo Street Photography",
        image: "https://images.unsplash.com/photo-1480796927426-f609979314bd?w=600&h=400&fit=crop",
        eventDate: new Date("2024-01-15"),
        categoryId: categories[2].id,
      },
    }),
    prisma.gallery.create({
      data: {
        title: "Coffee Art",
        image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&h=400&fit=crop",
        eventDate: new Date("2024-02-20"),
        categoryId: categories[3].id,
      },
    }),
    prisma.gallery.create({
      data: {
        title: "Morning Light",
        image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=600&h=400&fit=crop",
        eventDate: new Date("2024-01-25"),
        categoryId: categories[1].id,
      },
    }),
    prisma.gallery.create({
      data: {
        title: "Tech Conference 2024",
        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop",
        eventDate: new Date("2024-03-10"),
        categoryId: categories[0].id,
      },
    }),
    prisma.gallery.create({
      data: {
        title: "Bali Sunset",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop",
        eventDate: new Date("2024-02-14"),
        categoryId: categories[2].id,
      },
    }),
    prisma.gallery.create({
      data: {
        title: "Minimalist Design",
        image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=600&h=400&fit=crop",
        eventDate: new Date("2024-03-01"),
        categoryId: categories[1].id,
      },
    }),
  ]);
  console.log(`✅ Created ${gallery.length} gallery images`);

  // 5. Create Hero Sliders
  console.log("🎬 Creating hero sliders...");
  const sliders = await Promise.all([
    prisma.heroSlider.create({
      data: {
        title: "Welcome to Oryza",
        subtitle: "Discover amazing content",
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c476?w=1200&h=500&fit=crop",
        link: "/about",
        isActive: true,
        order: 1,
      },
    }),
    prisma.heroSlider.create({
      data: {
        title: "Explore Technology",
        subtitle: "Latest tech trends and tips",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=500&fit=crop",
        link: "/category/technology",
        isActive: true,
        order: 2,
      },
    }),
    prisma.heroSlider.create({
      data: {
        title: "Travel Stories",
        subtitle: "Inspiring journeys from around the world",
        image: "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&h=500&fit=crop",
        link: "/category/travel",
        isActive: true,
        order: 3,
      },
    }),
  ]);
  console.log(`✅ Created ${sliders.length} hero sliders`);

  // 6. Create Contact Messages
  console.log("💬 Creating contact messages...");
  const messages = await Promise.all([
    prisma.contactMessage.create({
      data: {
        name: "John Doe",
        email: "john@example.com",
        topic: "Partnership Inquiry",
        message:
          "I would like to discuss a partnership opportunity with Oryza. Please get back to me at your earliest convenience.",
        status: "UNREAD",
        ipAddress: "192.168.1.100",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Jane Smith",
        email: "jane@example.com",
        topic: "Content Suggestion",
        message:
          "I have a suggestion for a great article topic about sustainable living. Would love to see this covered!",
        status: "READ",
        ipAddress: "192.168.1.101",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Mike Johnson",
        email: "mike@example.com",
        topic: "Technical Support",
        message:
          "I found a bug on your website. When clicking the gallery filter button, it throws an error.",
        status: "READ",
        ipAddress: "192.168.1.102",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Sarah Williams",
        email: "sarah@example.com",
        topic: "Collaboration",
        message:
          "Interested in collaborating on a travel photography project. Check out my portfolio!",
        status: "UNREAD",
        ipAddress: "192.168.1.103",
      },
    }),
    prisma.contactMessage.create({
      data: {
        name: "Tom Brown",
        email: "tom@example.com",
        topic: "General Inquiry",
        message:
          "Just wanted to say I love your content! Keep up the great work.",
        status: "ARCHIVED",
        ipAddress: "192.168.1.104",
      },
    }),
  ]);
  console.log(`✅ Created ${messages.length} contact messages`);

  // 7. Create Settings
  console.log("⚙️  Creating settings...");
  const settings = await Promise.all([
    prisma.setting.create({
      data: {
        key: "site_title",
        value: "Oryza - Your Daily Source of Inspiration",
      },
    }),
    prisma.setting.create({
      data: {
        key: "site_description",
        value:
          "Discover amazing stories about technology, lifestyle, travel, and food from around the world.",
      },
    }),
    prisma.setting.create({
      data: {
        key: "posts_per_page",
        value: "10",
      },
    }),
    prisma.setting.create({
      data: {
        key: "enable_comments",
        value: "true",
      },
    }),
    prisma.setting.create({
      data: {
        key: "contact_email",
        value: "contact@oryza.com",
      },
    }),
    prisma.setting.create({
      data: {
        key: "social_media",
        value: JSON.stringify({
          facebook: "https://facebook.com/oryza",
          twitter: "https://twitter.com/oryza",
          instagram: "https://instagram.com/oryza",
        }),
      },
    }),
  ]);
  console.log(`✅ Created ${settings.length} settings`);

  // 8. Create Logs
  console.log("📋 Creating audit logs...");
  const logs = await Promise.all([
    prisma.log.create({
      data: {
        userId: superAdmin.id,
        action: "create",
        module: "posts",
        entityId: posts[0].id,
        details: { title: posts[0].title },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ipAddress: "192.168.1.100",
      },
    }),
    prisma.log.create({
      data: {
        userId: admin.id,
        action: "create",
        module: "categories",
        entityId: categories[0].id,
        details: { name: categories[0].name },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ipAddress: "192.168.1.101",
      },
    }),
    prisma.log.create({
      data: {
        userId: admin.id,
        action: "update",
        module: "posts",
        entityId: posts[0].id,
        details: { title: posts[0].title, status: "PUBLISHED" },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ipAddress: "192.168.1.102",
      },
    }),
    prisma.log.create({
      data: {
        userId: superAdmin.id,
        action: "create",
        module: "users",
        entityId: admin.id,
        details: { email: admin.email, role: "ADMIN" },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ipAddress: "192.168.1.103",
      },
    }),
    prisma.log.create({
      data: {
        userId: admin.id,
        action: "read",
        module: "contact",
        entityId: messages[0].id,
        details: { status: "READ" },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        ipAddress: "192.168.1.104",
      },
    }),
  ]);
  console.log(`✅ Created ${logs.length} audit logs`);

  console.log("\n✨ Database seeding completed successfully!");
  console.log("\n📝 Test Credentials:");
  console.log("   SUPER_ADMIN:");
  console.log("   - Email: superadmin@oryza.com");
  console.log("   - Password: admin123");
  console.log("\n   ADMIN:");
  console.log("   - Email: admin@oryza.com");
  console.log("   - Password: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
