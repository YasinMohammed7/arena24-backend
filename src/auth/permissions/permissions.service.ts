import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  // Permission methods
  async createPermission(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = await this.prisma.permission.create({
        data: createPermissionDto,
      });
      return {
        message: 'Permission created successfully',
        data: permission,
      };
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new ConflictException('Permission name already exists');
      }
      throw error;
    }
  }

  async getPermissions() {
    return this.prisma.permission.findMany({
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  // Assignment methods
  async assignPermissionToRole(roleId: string, permissionId: string) {
    // Check if role exists
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check if permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('Role already has this permission');
    }

    const rolePermission = await this.prisma.rolePermission.create({
      data: { roleId, permissionId },
      include: {
        role: true,
        permission: true,
      },
    });

    return {
      message: 'Permission assigned to role successfully',
      data: rolePermission,
    };
  }

  // Direct User Permission methods
  async assignPermissionToUser(
    userId: string,
    permissionId: string,
    assignedBy?: string,
  ) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: { userId, permissionId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException('User already has this permission');
    }

    const userPermission = await this.prisma.userPermission.create({
      data: {
        userId,
        permissionId,
        assignedBy: assignedBy || null,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        permission: true,
      },
    });

    return {
      message: 'Permission assigned to user successfully',
      data: userPermission,
    };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (!rolePermission) {
      throw new NotFoundException('Role permission assignment not found');
    }

    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    return {
      message: 'Permission removed from role successfully',
    };
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    const userPermission = await this.prisma.userPermission.findUnique({
      where: {
        userId_permissionId: { userId, permissionId },
      },
    });

    if (!userPermission) {
      throw new NotFoundException('User permission assignment not found');
    }

    await this.prisma.userPermission.delete({
      where: {
        userId_permissionId: { userId, permissionId },
      },
    });

    return {
      message: 'Permission removed from user successfully',
    };
  }

  async getUserRoles(userId: string) {
    return this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async getUserDirectPermissions(userId: string) {
    return this.prisma.userPermission.findMany({
      where: { userId },
      include: {
        permission: true,
      },
    });
  }

  async getUserPermissions(userId: string) {
    const userRoles = await this.getUserRoles(userId);
    const directPermissions = await this.getUserDirectPermissions(userId);
    const permissions = new Set();

    // Add permissions from roles
    userRoles.forEach((userRole) => {
      userRole.role.rolePermissions.forEach((rolePermission) => {
        permissions.add(rolePermission.permission);
      });
    });

    // Add direct permissions
    directPermissions.forEach((userPermission) => {
      permissions.add(userPermission.permission);
    });

    return Array.from(permissions);
  }

  // Utility methods for checking permissions

  async userHasPermission(
    userId: string,
    permissionName: string,
  ): Promise<boolean> {
    // Check role-based permissions
    const userWithRolePermission = await this.prisma.user.findFirst({
      where: {
        id: userId,
        userRoles: {
          some: {
            role: {
              rolePermissions: {
                some: {
                  permission: { name: permissionName },
                },
              },
            },
          },
        },
      },
    });

    if (userWithRolePermission) {
      return true;
    }

    // Check direct permissions
    const userWithDirectPermission = await this.prisma.user.findFirst({
      where: {
        id: userId,
        userPermissions: {
          some: {
            permission: { name: permissionName },
          },
        },
      },
    });

    return !!userWithDirectPermission;
  }
}
