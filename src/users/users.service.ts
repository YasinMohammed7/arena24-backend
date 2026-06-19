import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcryptjs";
import { applyOwnershipFilter } from "@/common/ownership.util";
import { promises as fs } from "fs";
import * as path from "path";
import { Prisma } from "@prisma/client";
import { Request } from "express";
import { AuthUser } from "@/auth/decorators/current-user.decorator";

/**
 * Request shape consumed by `findAll`: the JWT strategy attaches `user` and the
 * AuthorizationGuard attaches `authScope` (used for service-level filtering).
 * Mirrors the controller's `RequestWithAuthScope`.
 */
type RequestWithAuthScope = Request & {
  user: AuthUser;
  authScope?: {
    roles: string[];
    permissions?: string[];
    grantedPermission: string | null;
  };
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(req: RequestWithAuthScope) {
    // console.log('=== SERVICE DEBUG ===');
    // console.log('req.authScope:', req.authScope);
    // console.log('req.authScope?.grantedPermission:', req.authScope?.grantedPermission);
    // console.log('req.user:', req.user);
    // console.log('====================');

    const user = req.user;

    // Get the actual permission granted by the authorization guard from the route decorator
    const scope = req.authScope?.grantedPermission || "read:own";

    const where = applyOwnershipFilter({}, user, scope, "ownerId");

    return this.prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        ownerId: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(
    id: string,
    user: AuthUser,
    scope: "own" | "any",
    includeDeleted = false
  ) {
    const where: Prisma.UserWhereInput = { id };

    if (scope === "own") {
      // Users can only see their own data or users they own
      where.OR = [{ id: user.id }, { ownerId: user.id }];
    }

    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const foundUser = await this.prisma.user.findFirst({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        ownerId: true,
        isActive: true,
        deletedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!foundUser) {
      throw new NotFoundException("User not found");
    }

    return foundUser;
  }

  async activateUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope);

    if (targetUser.isActive) {
      throw new BadRequestException("User is already active");
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async deactivateUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope);

    if (!targetUser.isActive) {
      throw new BadRequestException("User is already inactive");
    }

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });
  }

  async softDeleteUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope);

    if (targetUser.deletedAt) {
      throw new BadRequestException("User is already deleted");
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  }

  async restoreUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope, true);

    if (!targetUser.deletedAt) {
      throw new BadRequestException("User is not deleted");
    }

    return this.prisma.user.update({
      where: { id },
      data: { deletedAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        deletedAt: true,
        updatedAt: true,
      },
    });
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // If password is being updated, hash it
    const updateData: Prisma.UserUpdateInput = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
          ownerId: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          imageUrl: true,
        },
      });

      if (updateUserDto.imageUrl && existingUser.imageUrl) {
        console.log("yasin", existingUser.imageUrl);
        const absPath = path.join(
          process.cwd(),
          "public",
          existingUser.imageUrl
        );
        try {
          await fs.unlink(absPath);
        } catch (err) {
          if (
            !(err instanceof Error) ||
            (err as NodeJS.ErrnoException).code !== "ENOENT"
          ) {
            console.error("Error deleting old file:", err);
          }
        }
      }

      return updatedUser;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new BadRequestException("Email or phone already exists");
      }
      throw error;
    }
  }

  async remove(userId: string) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    // Perform hard delete
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: "User permanently deleted", id: userId };
  }
}
