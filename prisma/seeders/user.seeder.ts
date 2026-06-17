import { PrismaClient } from '@prisma/client';

export async function seedUsers(prisma: PrismaClient) {
  const adminRole = await prisma.role.findUnique({
    where: { name: 'PLATFORM_ROOT' },
  });
  const businessOwner = await prisma.role.findUnique({
    where: { name: 'BUSINESS_OWNER' },
  });

  if (!adminRole) {
    console.error('PLATFORM_ROOT role not found. Run seedRoles first.');
    return;
  }
  if (!businessOwner) {
    console.error('BUSINESS_OWNER role not found. Run seedRoles first.');
    return;
  }

  await prisma.user.upsert({
    where: { email: 'fery@lzf.ro' },
    update: {},
    create: {
      email: 'fery@lzf.ro',
      name: 'Fery LZF',
      phone: '1234567890',
      password: '$2b$10$2EtPSkKniXm9Tzb/YCqPFOX6d2DV5q1ndzDpsC9alpsaHgoSXDhiC', // 'admin123' hashed with bcrypt
      userRoles: {
        create: [
          {
            roleId: adminRole.id,
          },
        ],
      },
    },
  });

  await prisma.user.upsert({
    where: { email: 'owner@lzf.ro' },
    update: {},
    create: {
      email: 'owner@lzf.ro',
      name: 'Business Owner User',
      phone: '1234567891',
      password: '$2b$10$RwmrY0oNsUwMMizgu1HJ7enTYEIrJ3pZzVAkwwVeQtC.U1J9ZOajy', // 'owner123' hashed with bcrypt
      userRoles: {
        create: [
          {
            roleId: businessOwner.id,
          },
        ],
      },
    },
  });
}
