import { PrismaClient } from "@prisma/client";

export async function seedRoles(prisma: PrismaClient) {
  await prisma.role.createMany({
    data: [
      { name: "PLATFORM_ROOT" },
      { name: "PLATFORM_ADMIN" },
      { name: "PLATFORM_MANAGER" },
      { name: "BUSINESS_OWNER" },
      { name: "BUSINESS_ADMIN" },
      { name: "BUSINESS_MANAGER" },
      { name: "CLIENT_USER" },
    ],
    skipDuplicates: true, // Avoid re-creating if already exist
  });
}
