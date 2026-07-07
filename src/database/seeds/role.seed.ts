import { DataSource } from "typeorm";
import { Role } from "../entities/role";

const ROLES = [
  { name: "PLATFORM_ROOT" },
  { name: "PLATFORM_ADMIN" },
  { name: "PLATFORM_MANAGER" },
  { name: "BUSINESS_OWNER" },
  { name: "BUSINESS_ADMIN" },
  { name: "BUSINESS_MANAGER" },
  { name: "CLIENT_USER" },
];

export async function seedRoles(dataSource: DataSource) {
  const repo = dataSource.getRepository(Role);
  for (const role of ROLES) {
    await repo.upsert(role, ["name"]);
  }
  console.log(`✅ Seeded ${ROLES.length} roles`);
}
