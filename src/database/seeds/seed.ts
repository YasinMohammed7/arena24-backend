import datasource from "../datasource";
import { seedRoles } from "./role.seed";
import { seedPermissions } from "./permission.seed";
import { seedRolePermissions } from "./role-permission.seed";
import { seedUsers } from "./user.seed";

async function main() {
  const ds = await datasource.initialize();

  console.log("🌱 Starting seed...");

  await seedRoles(ds);
  await seedPermissions(ds);
  await seedRolePermissions(ds);
  await seedUsers(ds);

  console.log("🎉 Seed complete!");

  await ds.destroy();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
