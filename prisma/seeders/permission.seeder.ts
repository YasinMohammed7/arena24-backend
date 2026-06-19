import { PrismaClient } from "@prisma/client";

export async function seedPermissions(prisma: PrismaClient) {
  await prisma.permission.createMany({
    data: [
      { name: "create:any" },
      { name: "read:any" },
      { name: "update:any" },
      { name: "delete:any" },
      { name: "create:own" },
      { name: "read:own" },
      { name: "update:own" },
      { name: "delete:own" },
      // ------ Roles ------ //
      { name: "create:role" },
      { name: "read:roles" },
      { name: "read:role" },
      { name: "delete:role" },
      { name: "assign:role" },
      { name: "revoke:role" },
      { name: "read:userRoles" },
      // ------ Permissions ------ //
      { name: "create:permission" },
      { name: "read:permissions" },
      { name: "delete:permission" },
      { name: "assign:permission" },
      { name: "revoke:permission" },
      { name: "assign:userPermission" },
      { name: "revoke:userPermission" },
      { name: "read:userPermissionsDirect" },
      { name: "read:userPermissionsAll" },
      // ------ Business ------ //
      { name: "create:business" },
      { name: "read:business" },
      { name: "update:business" },
      { name: "delete:business" },
      // ------ Event ------ //
      { name: "create:event" },
      { name: "read:event" },
      { name: "update:event" },
      { name: "delete:event" },
      // ------ Location ------ //
      { name: "create:location" },
      { name: "read:location" },
      { name: "update:location" },
      { name: "delete:location" },
      // ------ Amenity ------ //
      { name: "create:amenity" },
      { name: "read:amenity" },
      { name: "update:amenity" },
      { name: "delete:amenity" },
      // ------ Facility ------ //
      { name: "create:facility" },
      { name: "read:facility" },
      { name: "update:facility" },
      { name: "delete:facility" },
      // ------ Schedule ------ //
      { name: "create:schedule" },
      { name: "read:schedule" },
      { name: "update:schedule" },
      { name: "delete:schedule" },
      // ------ Reservation ------ //
      { name: "create:reservation" },
      { name: "read:reservation" },
      { name: "update:reservation" },
      { name: "delete:reservation" },
      // ------ User ------ //
      { name: "create:user" },
      { name: "read:user" },
      { name: "update:user" },
      { name: "delete:user" },
      { name: "read:users" },
      // ------ Profile ------ //
      { name: "update:profile" },
      { name: "read:profile" },
      // ------ Additional Permissions ------ //
      { name: "access:admin" },
      { name: "access:dashboard" },
      { name: "access:settings" },
      { name: "access:profile" },
      { name: "manage:permissions" },
      { name: "manage:settings" },
      { name: "view:analytics" },
      { name: "manage:users" },
      { name: "view:reports" },
      { name: "manage:roles" },
    ],
    skipDuplicates: true, // Avoid re-creating if already exist
  });
}
