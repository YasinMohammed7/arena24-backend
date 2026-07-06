import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { Permission } from "@/database/entities/permission";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "@/database/entities/role";
import { RolePermission } from "@/database/entities/rolePermissions";
import { User } from "@/database/entities/user";
import { UserPermissions } from "@/database/entities/userPermissions";
import { UserRoles } from "@/database/entities/userRoles";
import { QueryFailedError, Repository } from "typeorm";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepo: Repository<Permission>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
    @InjectRepository(RolePermission)
    private readonly rolePermissionRepo: Repository<RolePermission>,
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(UserPermissions)
    private readonly userPermissionsRepo: Repository<UserPermissions>,
    @InjectRepository(UserRoles)
    private readonly userRolesRepo: Repository<UserRoles>
  ) {}

  // Permission methods
  async createPermission(createPermissionDto: CreatePermissionDto) {
    try {
      const permission = this.permissionsRepo.create(createPermissionDto);
      const savedPermission = await this.permissionsRepo.save(permission);

      return {
        message: "Permission created successfully",
        data: savedPermission,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new ConflictException("Permission name already exists");
        }
      }

      throw error;
    }
  }

  async getPermissions() {
    return this.permissionsRepo.find({
      relations: {
        rolePermissions: {
          role: true,
        },
      },
      select: {
        id: true,
        name: true,
        rolePermissions: {
          roleId: true,
          permissionId: true,
          role: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  // Assignment methods
  async assignPermissionToRole(roleId: string, permissionId: string) {
    const role = await this.rolesRepo.findOne({
      where: { id: roleId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    const permission = await this.permissionsRepo.findOne({
      where: { id: permissionId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    const roleAlreadyHasPermission = await this.rolePermissionRepo.exists({
      where: {
        roleId,
        permissionId,
      },
    });

    if (roleAlreadyHasPermission) {
      throw new ConflictException("Role already has this permission");
    }

    await this.rolePermissionRepo.insert({
      roleId,
      permissionId,
    });

    return {
      message: "Permission assigned to role successfully",
      data: {
        roleId,
        permissionId,
        role,
        permission,
      },
    };
  }

  // Direct User Permission methods
  async assignPermissionToUser(
    userId: string,
    permissionId: string,
    assignedBy?: string
  ) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const permission = await this.permissionsRepo.findOne({
      where: { id: permissionId },
      select: {
        id: true,
        name: true,
      },
    });

    if (!permission) {
      throw new NotFoundException("Permission not found");
    }

    const userAlreadyHasPermission = await this.userPermissionsRepo.exists({
      where: {
        userId,
        permissionId,
      },
    });

    if (userAlreadyHasPermission) {
      throw new ConflictException("User already has this permission");
    }

    await this.userPermissionsRepo.insert({
      userId,
      permissionId,
      assignedBy: assignedBy || null,
    });

    return {
      message: "Permission assigned to user successfully",
      data: {
        userId,
        permissionId,
        assignedBy: assignedBy || null,
        user,
        permission,
      },
    };
  }

  async removePermissionFromRole(roleId: string, permissionId: string) {
    const result = await this.rolePermissionRepo.delete({
      roleId,
      permissionId,
    });

    if (!result.affected) {
      throw new NotFoundException("Role permission assignment not found");
    }

    return {
      message: "Permission removed from role successfully",
    };
  }

  async removePermissionFromUser(userId: string, permissionId: string) {
    const result = await this.userPermissionsRepo.delete({
      userId,
      permissionId,
    });

    if (!result.affected) {
      throw new NotFoundException("User permission assignment not found");
    }

    return {
      message: "Permission removed from user successfully",
    };
  }

  async getUserRoles(userId: string) {
    return this.userRolesRepo.find({
      where: { userId },
      relations: {
        role: {
          rolePermissions: {
            permission: true,
          },
        },
      },
      select: {
        userId: true,
        roleId: true,
        role: {
          id: true,
          name: true,
          rolePermissions: {
            roleId: true,
            permissionId: true,
            permission: {
              id: true,
              name: true,
            },
          },
        },
      },
    });
  }

  async getUserDirectPermissions(userId: string) {
    return this.userPermissionsRepo.find({
      where: { userId },
      relations: {
        permission: true,
      },
      select: {
        userId: true,
        permissionId: true,
        assignedBy: true,
        permission: {
          id: true,
          name: true,
        },
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
    permissionName: string
  ): Promise<boolean> {
    const hasRolePermission = await this.userRolesRepo.exists({
      where: {
        userId,
        role: {
          rolePermissions: {
            permission: {
              name: permissionName,
            },
          },
        },
      },
    });

    if (hasRolePermission) {
      return true;
    }

    return this.userPermissionsRepo.exists({
      where: {
        userId,
        permission: {
          name: permissionName,
        },
      },
    });
  }
}
