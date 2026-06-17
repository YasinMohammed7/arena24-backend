import { PrismaClient } from '@prisma/client';

export async function seedRolePermissions(prisma: PrismaClient) {
  // Get all roles and permissions first
  const roles = await prisma.role.findMany();
  const permissions = await prisma.permission.findMany();

  // Helper function to find role by name
  const findRole = (name: string) => roles.find((r) => r.name === name);

  // Helper function to find permissions by names
  const findPermissions = (names: string[]) =>
    names
      .map((name) => permissions.find((p) => p.name === name))
      .filter(Boolean);

  // PLATFORM_ROOT permissions (ALL PERMISSIONS)
  const platformRootRole = findRole('PLATFORM_ROOT');
  const allPermissions = permissions; // All permissions for PLATFORM_ROOT

  // PLATFORM_ADMIN permissions
  const platformAdminRole = findRole('PLATFORM_ADMIN');
  const platformAdminPermissions = findPermissions([
    'create:any',
    'read:any',
    'update:any',
    'assign:role',
    'revoke:role',
    // Business CRUD
    'create:business',
    'read:business',
    'update:business',
    'delete:business',
    // Event CRUD
    'create:event',
    'read:event',
    'update:event',
    'delete:event',
    // Location CRUD
    'create:location',
    'read:location',
    'update:location',
    'delete:location',
    // Amenity CRUD
    'create:amenity',
    'read:amenity',
    'update:amenity',
    'delete:amenity',
    // Facility CRUD
    'create:facility',
    'read:facility',
    'update:facility',
    'delete:facility',
    // Schedule CRUD
    'create:schedule',
    'read:schedule',
    'update:schedule',
    'delete:schedule',
    // Reservation CRUD
    'create:reservation',
    'read:reservation',
    'update:reservation',
    'delete:reservation',
  ]);

  // BUSINESS_OWNER permissions
  const businessOwnerRole = findRole('BUSINESS_OWNER');
  const businessOwnerPermissions = findPermissions([
    // Business CRUD
    'create:business',
    'read:business',
    'update:business',
    'delete:business',
    // Event CRUD
    'create:event',
    'read:event',
    'update:event',
    'delete:event',
    // Location CRUD
    'create:location',
    'read:location',
    'update:location',
    'delete:location',
    // Amenity CRUD
    'create:amenity',
    'read:amenity',
    'update:amenity',
    'delete:amenity',
    // Facility CRUD
    'create:facility',
    'read:facility',
    'update:facility',
    'delete:facility',
    // Schedule CRUD
    'create:schedule',
    'read:schedule',
    'update:schedule',
    'delete:schedule',
    // Reservation CRUD
    'create:reservation',
    'read:reservation',
    'update:reservation',
    'delete:reservation',
  ]);

  // BUSINESS_ADMIN permissions (like business owner except delete)
  const businessAdminRole = findRole('BUSINESS_ADMIN');
  const businessAdminPermissions = findPermissions([
    // Business CRU (no delete)
    'create:business',
    'read:business',
    'update:business',
    // Event CRU (no delete)
    'create:event',
    'read:event',
    'update:event',
    // Location CRU (no delete)
    'create:location',
    'read:location',
    'update:location',
    // Amenity CRU (no delete)
    'create:amenity',
    'read:amenity',
    'update:amenity',
    // Facility CRU (no delete)
    'create:facility',
    'read:facility',
    'update:facility',
    // Schedule CRU (no delete)
    'create:schedule',
    'read:schedule',
    'update:schedule',
    // Reservation CRUD
    'create:reservation',
    'read:reservation',
    'update:reservation',
    'delete:reservation',
  ]);

  // BUSINESS_MANAGER permissions (same as business admin)
  const businessManagerRole = findRole('BUSINESS_MANAGER');
  const businessManagerPermissions = businessAdminPermissions; // Same permissions

  // CLIENT_USER permissions
  const clientUserRole = findRole('CLIENT_USER');
  const clientUserPermissions = findPermissions([
    'read:own',
    // Reservation CRUD
    'create:reservation',
    'read:reservation',
    'update:reservation',
    'delete:reservation',
    // Read location and event
    'read:location',
    'read:event',
  ]);

  // Create role-permission assignments
  const rolePermissionData: { roleId: string; permissionId: string }[] = [];

  // PLATFORM_ROOT (ALL PERMISSIONS)
  if (platformRootRole) {
    allPermissions.forEach((permission) => {
      rolePermissionData.push({
        roleId: platformRootRole.id,
        permissionId: permission.id,
      });
    });
  }

  // PLATFORM_ADMIN
  if (platformAdminRole) {
    platformAdminPermissions.forEach((permission) => {
      if (permission) {
        rolePermissionData.push({
          roleId: platformAdminRole.id,
          permissionId: permission.id,
        });
      }
    });
  }

  // BUSINESS_OWNER
  if (businessOwnerRole) {
    businessOwnerPermissions.forEach((permission) => {
      if (permission) {
        rolePermissionData.push({
          roleId: businessOwnerRole.id,
          permissionId: permission.id,
        });
      }
    });
  }

  // BUSINESS_ADMIN
  if (businessAdminRole) {
    businessAdminPermissions.forEach((permission) => {
      if (permission) {
        rolePermissionData.push({
          roleId: businessAdminRole.id,
          permissionId: permission.id,
        });
      }
    });
  }

  // BUSINESS_MANAGER
  if (businessManagerRole) {
    businessManagerPermissions.forEach((permission) => {
      if (permission) {
        rolePermissionData.push({
          roleId: businessManagerRole.id,
          permissionId: permission.id,
        });
      }
    });
  }

  // CLIENT_USER
  if (clientUserRole) {
    clientUserPermissions.forEach((permission) => {
      if (permission) {
        rolePermissionData.push({
          roleId: clientUserRole.id,
          permissionId: permission.id,
        });
      }
    });
  }

  // Insert all role-permission assignments
  await prisma.rolePermission.createMany({
    data: rolePermissionData,
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${rolePermissionData.length} role-permission assignments`,
  );
}
