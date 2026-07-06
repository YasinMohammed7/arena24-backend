import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Role } from "@/database/entities/role";
import { User } from "@/database/entities/user";
import { UserRoles } from "@/database/entities/userRoles";
import { QueryFailedError, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRoles)
    private readonly userRolesRepo: Repository<UserRoles>
  ) {}
  // Role methods
  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const role = this.roleRepo.create(createRoleDto);
      const savedRole = await this.roleRepo.save(role);

      return {
        message: "Role created successfully",
        data: savedRole,
      };
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new ConflictException("Role name already exists");
        }
      }

      throw error;
    }
  }

  async getRoles() {
    return this.roleRepo.find({
      relations: {
        rolePermissions: {
          permission: true,
        },
        userRoles: {
          user: true,
        },
      },
      select: {
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
        userRoles: {
          roleId: true,
          userId: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async getRoleById(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: {
        rolePermissions: {
          permission: true,
        },
        userRoles: {
          user: true,
        },
      },
      select: {
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
        userRoles: {
          userId: true,
          roleId: true,
          user: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    return role;
  }

  async deleteRole(id: string) {
    const role = await this.roleRepo.findOne({
      where: { id },
      relations: {
        userRoles: true,
      },
      select: {
        id: true,
        userRoles: {
          roleId: true,
          userId: true,
        },
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    if (role.userRoles.length > 0) {
      throw new ConflictException(
        "Cannot delete role that has users assigned to it"
      );
    }

    await this.roleRepo.delete(id);

    return { message: "Role deleted successfully" };
  }

  // Assignment methods
  async assignRoleToUser(userId: string, roleId: string) {
    const user = await this.userRepo.findOne({
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

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    const userAlreadyHasRole = await this.userRolesRepo.exists({
      where: {
        userId,
        roleId,
      },
    });

    if (userAlreadyHasRole) {
      throw new ConflictException("User already has this role");
    }

    await this.userRolesRepo.insert({
      userId,
      roleId,
    });

    return {
      message: "Role assigned to user successfully",
      data: {
        userId,
        roleId,
        user,
        role,
      },
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

  // Remove assignments
  async removeRoleFromUser(userId: string, roleId: string) {
    const userRoleExists = await this.userRolesRepo.exists({
      where: {
        userId,
        roleId,
      },
    });

    if (!userRoleExists) {
      throw new NotFoundException("User role assignment not found");
    }

    await this.userRolesRepo.delete({
      userId,
      roleId,
    });

    return {
      message: "Role removed from user successfully",
    };
  }
}
