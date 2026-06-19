import { PrismaClient } from "@prisma/client";
import { seedRoles } from "./seeders/role.seeder";
import { seedUsers } from "./seeders/user.seeder";
import { seedPermissions } from "./seeders/permission.seeder";
import { seedRolePermissions } from "./seeders/role-permission.seeder";

const prisma = new PrismaClient();

async function main() {
  await seedRoles(prisma);
  await seedPermissions(prisma);
  await seedRolePermissions(prisma);
  await seedUsers(prisma);
}

main()
  .then(() => {
    console.log("✅ Database seeded");
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
