import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseUUIDPipe,
  Patch,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { UsersService } from "./users.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import {
  Authorize,
  HasRoleOr,
  RequirePermission,
} from "@/auth/decorators/authorize.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";
import { AuthUser } from "@/auth/interfaces/auth-user.interface";
import { RequestWithAuthScope } from "@/auth/interfaces/authenticated-request.interface";
import { userPictureUploadOptions } from "./multer.config";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard("jwt"))
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own", "read:any"])
  @Get()
  @ApiOperation({ summary: "List users visible to the current user" })
  @ApiOkResponse({ description: "Users returned successfully" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  findAll(@Req() req: RequestWithAuthScope) {
    return this.usersService.findAll(req);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own"])
  @Get(":id")
  @ApiOperation({ summary: "Get one user by ID" })
  @ApiParam({ name: "id", type: String })
  @ApiQuery({
    name: "includeDeleted",
    required: false,
    type: Boolean,
    description: "Include soft-deleted users",
  })
  @ApiOkResponse({ description: "User returned successfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  findOne(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser,
    @Query("includeDeleted", new DefaultValuePipe(false), ParseBoolPipe)
    includeDeleted: boolean
  ) {
    return this.usersService.findOne(
      id,
      user,
      this.getUserScope(user, "read:any"),
      includeDeleted
    );
  }

  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["activate:user"],
  })
  @Patch(":id/activate")
  @ApiOperation({ summary: "Activate a user" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "User activated successfully" })
  @ApiBadRequestResponse({ description: "User is already active" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  activateUser(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.usersService.activateUser(
      id,
      user,
      this.getUserScope(user, "activate:user")
    );
  }

  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["deactivate:user"],
  })
  @Patch(":id/deactivate")
  @ApiOperation({ summary: "Deactivate a user" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "User deactivated successfully" })
  @ApiBadRequestResponse({ description: "User is already inactive" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  deactivateUser(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.usersService.deactivateUser(
      id,
      user,
      this.getUserScope(user, "deactivate:user")
    );
  }

  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["delete:user"],
  })
  @Delete(":id/soft")
  @ApiOperation({ summary: "Soft-delete a user" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "User soft-deleted successfully" })
  @ApiBadRequestResponse({ description: "User is already deleted" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  softDeleteUser(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.usersService.softDeleteUser(
      id,
      user,
      this.getUserScope(user, "delete:user")
    );
  }

  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ["PLATFORM_ADMIN", "PLATFORM_MANAGER"],
    permissions: ["restore:user"],
  })
  @Patch(":id/restore")
  @ApiOperation({ summary: "Restore a soft-deleted user" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "User restored successfully" })
  @ApiBadRequestResponse({ description: "User is not deleted" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required role or permission" })
  restoreUser(
    @Param("id", ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthUser
  ) {
    return this.usersService.restoreUser(
      id,
      user,
      this.getUserScope(user, "restore:user")
    );
  }

  @UseGuards(AuthorizationGuard)
  @RequirePermission("update:user")
  @Patch(":id")
  @UseInterceptors(FileInterceptor("picture", userPictureUploadOptions))
  @ApiOperation({ summary: "Update a user" })
  @ApiParam({ name: "id", type: String })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        picture: { type: "string", format: "binary" },
        password: { type: "string" },
        imageUrl: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
    },
  })
  @ApiOkResponse({ description: "User updated successfully" })
  @ApiBadRequestResponse({
    description: "Invalid payload or duplicate email/phone",
  })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required permission" })
  update(
    @Param("id", ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.update(id, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }

  @UseGuards(AuthorizationGuard)
  @RequirePermission("delete:user")
  @Delete(":id")
  @ApiOperation({ summary: "Permanently delete a user" })
  @ApiParam({ name: "id", type: String })
  @ApiOkResponse({ description: "User permanently deleted" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiForbiddenResponse({ description: "Missing required permission" })
  remove(@Param("id", ParseUUIDPipe) id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @Delete()
  @ApiOperation({ summary: "Permanently delete the current user" })
  @ApiOkResponse({ description: "Current user permanently deleted" })
  @ApiNotFoundResponse({ description: "User not found" })
  removeMe(@CurrentUser("id") userId: string) {
    return this.usersService.remove(userId);
  }

  @UseGuards(AuthorizationGuard)
  @Patch()
  @UseInterceptors(FileInterceptor("picture", userPictureUploadOptions))
  @ApiOperation({ summary: "Update the current user" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        picture: { type: "string", format: "binary" },
        password: { type: "string" },
        imageUrl: { type: "string" },
        name: { type: "string" },
        email: { type: "string" },
        phone: { type: "string" },
      },
    },
  })
  @ApiOkResponse({ description: "Current user updated successfully" })
  @ApiBadRequestResponse({
    description: "Invalid payload or duplicate email/phone",
  })
  @ApiNotFoundResponse({ description: "User not found" })
  updateMe(
    @CurrentUser("id") userId: string,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    return this.usersService.update(userId, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }

  private getUserScope(user: AuthUser, permission: string): "own" | "any" {
    const hasAnyScope =
      user.permissions.includes(permission) ||
      user.roles.some((role) => role.startsWith("PLATFORM_"));

    return hasAnyScope ? "any" : "own";
  }
}
