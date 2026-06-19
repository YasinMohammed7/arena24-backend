import { SetMetadata } from "@nestjs/common";

export interface AuthorizationRequirement {
  roles?: string[];
  permissions?: string[];
  operator?: "AND" | "OR"; // Default is 'OR'
}

export const AUTHORIZATION_KEY = "authorization";

/**
 * Flexible authorization decorator that supports:
 * - Role-based access
 * - Permission-based access
 * - OR logic between roles and permissions
 * - AND logic within roles or permissions
 *
 * Examples:
 * @Authorize({ roles: ['ADMIN'], permissions: ['read:users'] }) // Has ADMIN role OR read:users permission
 * @Authorize({ roles: ['ADMIN', 'MANAGER'], operator: 'AND' }) // Must have BOTH ADMIN AND MANAGER roles
 * @Authorize({ permissions: ['read:users', 'write:users'] }) // Has read:users OR write:users permission
 */
export const Authorize = (requirement: AuthorizationRequirement) =>
  SetMetadata(AUTHORIZATION_KEY, requirement);

export const HasRoleOr = (roles: string[], permissions: string[]) =>
  Authorize({ roles, permissions, operator: "OR" });

export const HasRoleAnd = (roles: string[], permissions: string[]) =>
  Authorize({ roles, permissions, operator: "AND" });

export const RequireRole = (...roles: string[]) => Authorize({ roles });

export const RequirePermission = (...permissions: string[]) =>
  Authorize({ permissions });
