import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  AUTHORIZATION_KEY,
  AuthorizationRequirement,
} from '../decorators/authorize.decorator';
import { User } from '@/auth/interfaces/user.interface';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * The decorator (e.g., @RequireRole) attaches metadata specifying required roles/permissions.
   * The guard (this class) enforces the authorization logic at runtime by reading that metadata.
   */
  canActivate(context: ExecutionContext): boolean {
    const authRequirement =
      this.reflector.getAllAndOverride<AuthorizationRequirement>(
        AUTHORIZATION_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!authRequirement) return true;

    const request = context.switchToHttp().getRequest<{ user?: User }>();
    const { user } = request;
    if (!user) throw new UnauthorizedException();

    // Normalize user roles to string array (handles both string[] and {name: string}[])
    const userRoles = this.normalizeRoles(user.roles);

    const { roles, permissions, operator = 'OR' } = authRequirement;

    // Check roles
    const hasRequiredRole = this.checkRoles(userRoles, roles || []);

    // Check permissions
    const hasRequiredPermission = this.checkPermissions(
      user.permissions || [],
      permissions || [],
    );

    let granted: boolean;
    // Apply operator logic
    if (operator === 'AND') {
      granted =
        (!roles || hasRequiredRole) && (!permissions || hasRequiredPermission);
    } else {
      granted = hasRequiredRole || hasRequiredPermission;
    }

    // Always grant access for PLATFORM_ROOT (but still determine scope)
    if (userRoles.includes('PLATFORM_ROOT')) {
      granted = true;
    }

    if (!granted) throw new ForbiddenException('Insufficient permissions');

    // console.log('=== AUTHORIZATION GUARD DEBUG ===');
    // console.log('User roles:', userRoles);
    // console.log('Required permissions:', permissions);
    // console.log('User permissions:', user.permissions);
    // console.log('Has required role:', hasRequiredRole);
    // console.log('Has required permission:', hasRequiredPermission);

    // Determine the actual granted permission based on user's capabilities
    const grantedPermission = this.determineGrantedPermission(
      user,
      permissions || [],
    );

    // Attach auth scope to request (for service-level filtering)
    request['authScope'] = {
      roles: userRoles,
      permissions: permissions,
      grantedPermission: grantedPermission, // The actual permission the user was granted
    };

    // console.log('Setting authScope on request:', request['authScope']);
    // console.log('================================');

    return true;
  }

  private normalizeRoles(roles: any[]): string[] {
    return Array.isArray(roles)
      ? roles.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
      : [];
  }

  private checkRoles(userRoles: string[], requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) return false;

    return userRoles.some((userRole: string) =>
      requiredRoles.some((requiredRole) => {
        // Exact match
        if (userRole === requiredRole) return true;

        // Wildcard: PLATFORM_ROOT can access any PLATFORM_* role
        if (userRole.endsWith('_ROOT')) {
          const prefix = userRole.slice(0, -5); // Remove '_ROOT'
          return requiredRole.startsWith(prefix + '_');
        }

        return false;
      }),
    );
  }

  private checkPermissions(
    userPermissions: string[],
    requiredPermissions: string[],
  ): boolean {
    if (!requiredPermissions || requiredPermissions.length === 0) return false;

    return requiredPermissions.some((permission) =>
      userPermissions.includes(permission),
    );
  }

  private determineGrantedPermission(
    user: User,
    requiredPermissions: string[],
  ): string | null {
    const userRoles = this.normalizeRoles(user.roles);
    const userPermissions = user.permissions || [];

    // Platform roles get the highest permission available
    if (userRoles.some((role) => role.startsWith('PLATFORM_'))) {
      // Find the "any" permission if available, otherwise return the first permission
      const anyPermission = requiredPermissions.find((p) => p.endsWith(':any'));
      return anyPermission || requiredPermissions[0] || null;
    }

    // Find all permissions the user has from the required list
    const availablePermissions = requiredPermissions.filter((permission) =>
      userPermissions.includes(permission),
    );

    if (availablePermissions.length === 0) {
      return null;
    }

    // Prioritize ":any" permissions over ":own" permissions
    const anyPermission = availablePermissions.find((p) => p.endsWith(':any'));
    if (anyPermission) {
      return anyPermission;
    }

    // If no ":any" permission, return the first available permission
    return availablePermissions[0];
  }
}
