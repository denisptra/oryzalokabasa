const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create default admin if not exists
  const adminEmail = 'admin@oryza.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'SUPER_ADMIN',
      },
    });
    console.log(`✅ Default admin created: ${admin.email} / admin123`);
  } else {
    console.log('ℹ️ Default admin already exists.');
  }

  // Create default category if not exists
  const existingCategory = await prisma.category.findFirst();
  if (!existingCategory) {
    await prisma.category.createMany({
      data: [
        { name: 'Pengumuman', slug: 'pengumuman' },
        { name: 'Kegiatan', slug: 'kegiatan' },
        { name: 'Artikel', slug: 'artikel' },
      ],
    });
    console.log('✅ Default categories created.');
  }

  console.log('🌱 Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
