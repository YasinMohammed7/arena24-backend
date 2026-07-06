import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcryptjs";
import { applyOwnershipFilter } from "@/common/ownership.util";
import { promises as fs } from "fs";
import * as path from "path";
import { AuthUser } from "@/auth/interfaces/auth-user.interface";
import { RequestWithAuthScope } from "@/auth/interfaces/authenticated-request.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "@/database/entities/user";
import { IsNull, QueryFailedError, Repository } from "typeorm";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>
  ) {}

  async findAll(req: RequestWithAuthScope) {
    const user = req.user;

    // Get the actual permission granted by the authorization guard from the route decorator
    const scope = req.authScope?.grantedPermission || "read:own";

    const where = applyOwnershipFilter<User, "ownerId">(
      {},
      user,
      scope,
      "ownerId"
    );

    return this.userRepo.find({
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
    const notDeletedWhere = includeDeleted ? {} : { deletedAt: IsNull() };

    const where =
      scope === "own"
        ? [
            {
              id: user.id,
              ...notDeletedWhere,
            },
            {
              id,
              ownerId: user.id,
              ...notDeletedWhere,
            },
          ]
        : {
            id,
            ...notDeletedWhere,
          };

    const foundUser = await this.userRepo.findOne({
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

    await this.userRepo.update(id, { isActive: true });

    const updatedUser = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async deactivateUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope);

    if (!targetUser.isActive) {
      throw new BadRequestException("User is already inactive");
    }

    await this.userRepo.update(id, { isActive: false });

    const updatedUser = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        isActive: true,
        updatedAt: true,
      },
    });

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async softDeleteUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope);

    if (targetUser.deletedAt) {
      throw new BadRequestException("User is already deleted");
    }

    await this.userRepo.update(id, { deletedAt: new Date() });

    const updatedUser = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async restoreUser(id: string, user: AuthUser, scope: "own" | "any") {
    const targetUser = await this.findOne(id, user, scope, true);

    if (!targetUser.deletedAt) {
      throw new BadRequestException("User is not deleted");
    }

    await this.userRepo.update(id, { deletedAt: null });

    const updatedUser = await this.userRepo.findOne({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        deletedAt: true,
        updatedAt: true,
      },
    });

    if (!updatedUser) {
      throw new NotFoundException("User not found");
    }

    return updatedUser;
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        imageUrl: true,
      },
    });

    if (!existingUser) {
      throw new NotFoundException("User not found");
    }

    const updateData = {
      ...updateUserDto,
      ...(updateUserDto.password && {
        password: await bcrypt.hash(updateUserDto.password, 10),
      }),
    };

    try {
      await this.userRepo.update(userId, updateData);

      const updatedUser = await this.userRepo.findOne({
        where: { id: userId },
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

      if (!updatedUser) {
        throw new NotFoundException("User not found");
      }

      if (updateUserDto.imageUrl && existingUser.imageUrl) {
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
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new BadRequestException("Email or phone already exists");
        }
      }

      throw error;
    }
  }

  async remove(userId: string) {
    const result = await this.userRepo.delete(userId);

    if (!result.affected) {
      throw new NotFoundException("User not found");
    }

    return { message: "User permanently deleted", id: userId };
  }
}
