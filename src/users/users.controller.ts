import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Request } from "express";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import {
  Authorize,
  HasRoleOr,
  RequirePermission,
} from "@/auth/decorators/authorize.decorator";
import {
  CurrentUser,
  AuthUser,
} from "@/auth/decorators/current-user.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";

/**
 * Request shape consumed by `findAll`: the JWT strategy attaches `user` and the
 * AuthorizationGuard attaches `authScope` (used for service-level filtering).
 */
interface RequestWithAuthScope extends Request {
  user: AuthUser;
  authScope?: {
    roles: string[];
    permissions?: string[];
    grantedPermission: string | null;
  };
}

@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Example: Has PLATFORM_ADMIN role OR BUSINESS_OWNER role OR read:own permission
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own", "read:any"])
  @Get()
  findAll(@Req() req: RequestWithAuthScope) {
    return this.usersService.findAll(req);
  }

  // Example: Has BUSINESS_OWNER role OR PLATFORM_MANAGER role OR read:own permission
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own"])
  @Get(":id")
  findOne(
    @Param("id") id: string,
    @CurrentUser() user: AuthUser,
    @Query("includeDeleted") includeDeleted?: string
  ) {
    // If user has 'read:any' permission or PLATFORM_* role, show any user
    const hasReadAny =
      user.permissions.includes("read:any") ||
      user.roles.some((role: string) => role.startsWith("PLATFORM_"));
    const includeDeletedUsers = includeDeleted === "true";
    return this.usersService.findOne(
      id,
      user,
      hasReadAny ? "any" : "own",
      includeDeletedUsers
    );
  }

  // Activate user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["activate:user"],
  })
  @Patch(":id/activate")
  activateUser(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const hasManageAny =
      user.permissions.includes("activate:user") ||
      user.roles.some((role: string) => role.startsWith("PLATFORM_"));
    return this.usersService.activateUser(
      id,
      user,
      hasManageAny ? "any" : "own"
    );
  }

  // Deactivate user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["deactivate:user"],
  })
  @Patch(":id/deactivate")
  deactivateUser(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const hasManageAny =
      user.permissions.includes("deactivate:user") ||
      user.roles.some((role: string) => role.startsWith("PLATFORM_"));
    return this.usersService.deactivateUser(
      id,
      user,
      hasManageAny ? "any" : "own"
    );
  }

  // Soft delete user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["delete:user"],
  })
  @Delete(":id/soft")
  softDeleteUser(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const hasDeleteAny =
      user.permissions.includes("delete:user") ||
      user.roles.some((role: string) => role.startsWith("PLATFORM_"));
    return this.usersService.softDeleteUser(
      id,
      user,
      hasDeleteAny ? "any" : "own"
    );
  }

  // Restore user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["restore:user"],
  })
  @Patch(":id/restore")
  restoreUser(@Param("id") id: string, @CurrentUser() user: AuthUser) {
    const hasRestoreAny =
      user.permissions.includes("restore:user") ||
      user.roles.some((role: string) => role.startsWith("PLATFORM_"));
    return this.usersService.restoreUser(
      id,
      user,
      hasRestoreAny ? "any" : "own"
    );
  }

  // Example: Must have update:user permission
  @UseGuards(AuthorizationGuard)
  // @RequirePermission('update:user')
  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("picture", {
      storage: diskStorage({
        destination: "./public/uploads/user",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  update(
    @Param("id") id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.usersService.update(id, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }

  // Example: Must have delete:user permission
  @UseGuards(AuthorizationGuard)
  @RequirePermission("delete:user")
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @Delete()
  removeMe(@CurrentUser("id") userId: string) {
    return this.usersService.remove(userId);
  }

  @UseGuards(AuthorizationGuard)
  @Patch()
  @UseInterceptors(
    FileInterceptor("picture", {
      storage: diskStorage({
        destination: "./public/uploads/user",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  updateMe(
    @CurrentUser("id") userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.usersService.update(userId, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }
}
