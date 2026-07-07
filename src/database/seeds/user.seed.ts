import { DataSource } from "typeorm";
import { User } from "../entities/user";
import { Role } from "../entities/role";
import { UserRoles } from "../entities/userRoles";

export async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const userRolesRepo = dataSource.getRepository(UserRoles);

  const adminRole = await dataSource
    .getRepository(Role)
    .findOneBy({ name: "PLATFORM_ROOT" });
  const businessOwnerRole = await dataSource
    .getRepository(Role)
    .findOneBy({ name: "BUSINESS_OWNER" });

  if (!adminRole) {
    console.error("PLATFORM_ROOT role not found. Run seedRoles first.");
    return;
  }
  if (!businessOwnerRole) {
    console.error("BUSINESS_OWNER role not found. Run seedRoles first.");
    return;
  }

  // Admin user
  const admin = await userRepo.upsert(
    {
      email: "fery@lzf.ro",
      name: "Fery LZF",
      phone: "1234567890",
      password: "$2b$10$bMj65pS1vbiXW/vpgAinP.DLBEStKV.E/pG22hVX3aN9GOEmdmIFe",
    },
    ["email"]
  );

  // Assign admin role
  if (admin.identifiers[0]?.id) {
    await userRolesRepo.upsert(
      { userId: admin.identifiers[0].id as string, roleId: adminRole.id },
      ["userId", "roleId"]
    );
  }

  // Business owner user
  const owner = await userRepo.upsert(
    {
      email: "owner@lzf.ro",
      name: "Business Owner User",
      phone: "1234567891",
      password: "$2b$10$bMj65pS1vbiXW/vpgAinP.DLBEStKV.E/pG22hVX3aN9GOEmdmIFe",
    },
    ["email"]
  );

  if (owner.identifiers[0]?.id) {
    await userRolesRepo.upsert(
      {
        userId: owner.identifiers[0].id as string,
        roleId: businessOwnerRole.id,
      },
      ["userId", "roleId"]
    );
  }

  console.log("✅ Seeded users");
}
