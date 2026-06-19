import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { Prisma } from "../../../generated/prisma";

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  // Role methods
  async createRole(createRoleDto: CreateRoleDto) {
    try {
      const role = await this.prisma.role.create({
        data: createRoleDto,
      });
      return {
        message: "Role created successfully",
        data: role,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new ConflictException("Role name already exists");
      }
      throw error;
    }
  }

  async getRoles() {
    return this.prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
  }

  async getRoleById(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
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
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundException("Role not found");
    }

    // Check if role has users assigned to it
    if (role.userRoles.length > 0) {
      throw new ConflictException(
        "Cannot delete role that has users assigned to it"
      );
    }

    await this.prisma.role.delete({
      where: { id },
    });

    return { message: "Role deleted successfully" };
  }

  // Assignment methods
  async assignRoleToUser(userId: string, roleId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new NotFoundException("Role not found");
    }

    // Check if assignment already exists
    const existingAssignment = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (existingAssignment) {
      throw new ConflictException("User already has this role");
    }

    const userRole = await this.prisma.userRole.create({
      data: { userId, roleId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: true,
      },
    });

    return {
      message: "Role assigned to user successfully",
      data: userRole,
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

  // Remove assignments
  async removeRoleFromUser(userId: string, roleId: string) {
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    if (!userRole) {
      throw new NotFoundException("User role assignment not found");
    }

    await this.prisma.userRole.delete({
      where: {
        userId_roleId: { userId, roleId },
      },
    });

    return {
      message: "Role removed from user successfully",
    };
  }
}
