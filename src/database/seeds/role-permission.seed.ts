import { DataSource } from "typeorm";
import { Role } from "../entities/role";
import { Permission } from "../entities/permission";
import { RolePermission } from "../entities/rolePermissions";

async function findRole(dataSource: DataSource, name: string) {
  return dataSource.getRepository(Role).findOneBy({ name });
}

async function findPermissions(dataSource: DataSource, names: string[]) {
  const repo = dataSource.getRepository(Permission);
  const results: Permission[] = [];
  for (const name of names) {
    const p = await repo.findOneBy({ name });
    if (p) results.push(p);
  }
  return results;
}

export async function seedRolePermissions(dataSource: DataSource) {
  const repo = dataSource.getRepository(RolePermission);

  // PLATFORM_ROOT — all permissions
  const platformRoot = await findRole(dataSource, "PLATFORM_ROOT");
  const allPermissions = await dataSource.getRepository(Permission).find();
  if (platformRoot) {
    for (const perm of allPermissions) {
      await repo.upsert({ roleId: platformRoot.id, permissionId: perm.id }, [
        "roleId",
        "permissionId",
      ]);
    }
  }

  const rolePermissionMap: Record<string, string[]> = {
    PLATFORM_ADMIN: [
      "create:any",
      "read:any",
      "update:any",
      "assign:role",
      "revoke:role",
      "create:business",
      "read:business",
      "update:business",
      "delete:business",
      "create:event",
      "read:event",
      "update:event",
      "delete:event",
      "create:location",
      "read:location",
      "update:location",
      "delete:location",
      "create:amenity",
      "read:amenity",
      "update:amenity",
      "delete:amenity",
      "create:facility",
      "read:facility",
      "update:facility",
      "delete:facility",
      "create:schedule",
      "read:schedule",
      "update:schedule",
      "delete:schedule",
      "create:reservation",
      "read:reservation",
      "update:reservation",
      "delete:reservation",
      "create:user",
      "read:user",
      "update:user",
      "delete:user",
      "read:users",
      "update:profile",
      "read:profile",
      "access:admin",
      "access:dashboard",
      "access:settings",
    ],
    BUSINESS_OWNER: [
      "create:own",
      "read:own",
      "update:own",
      "delete:own",
      "create:business",
      "read:business",
      "update:business",
      "delete:business",
      "create:event",
      "read:event",
      "update:event",
      "delete:event",
      "create:location",
      "read:location",
      "update:location",
      "delete:location",
      "create:amenity",
      "read:amenity",
      "update:amenity",
      "delete:amenity",
      "create:facility",
      "read:facility",
      "update:facility",
      "delete:facility",
      "create:schedule",
      "read:schedule",
      "update:schedule",
      "delete:schedule",
      "create:reservation",
      "read:reservation",
      "update:reservation",
      "delete:reservation",
      "create:user",
      "read:user",
      "update:user",
      "read:users",
      "update:profile",
      "read:profile",
      "access:profile",
    ],
    CLIENT_USER: [
      "read:own",
      "update:own",
      "read:business",
      "read:event",
      "read:location",
      "read:amenity",
      "read:facility",
      "read:schedule",
      "create:reservation",
      "read:reservation",
      "update:reservation",
      "delete:reservation",
      "read:user",
      "update:profile",
      "read:profile",
    ],
  };

  for (const [roleName, permNames] of Object.entries(rolePermissionMap)) {
    const role = await findRole(dataSource, roleName);
    if (!role) continue;
    const perms = await findPermissions(dataSource, permNames);
    for (const perm of perms) {
      await repo.upsert({ roleId: role.id, permissionId: perm.id }, [
        "roleId",
        "permissionId",
      ]);
    }
  }

  console.log("✅ Seeded role-permission assignments");
}
