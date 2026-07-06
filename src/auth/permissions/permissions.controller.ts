import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import {
  CreatePermissionDto,
  AssignPermissionDto,
  AssignUserPermissionDto,
} from "./dto/create-permission.dto";
import { AuthGuard } from "@nestjs/passport";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@ApiTags("Permissions")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard("jwt")) // Apply JWT guard to all endpoints
@Controller("permissions")
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  // Permission endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["create:permission"])
  @Post("permissions")
  @ApiOperation({ summary: "Create a permission" })
  @ApiOkResponse({ description: "Permission created successfully" })
  @ApiBadRequestResponse({ description: "Invalid permission payload" })
  @ApiConflictResponse({ description: "Permission name already exists" })
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:permissions"])
  @Get("permissions")
  @ApiOperation({ summary: "Get all permissions" })
  @ApiOkResponse({ description: "Permissions retrieved successfully" })
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  // Role Assignment endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["assign:permission"])
  @Post("assign-permission")
  @ApiOperation({ summary: "Assign a permission to a role" })
  @ApiOkResponse({ description: "Permission assigned to role successfully" })
  @ApiBadRequestResponse({ description: "Invalid assignment payload" })
  @ApiNotFoundResponse({ description: "Role or permission not found" })
  @ApiConflictResponse({ description: "Role already has this permission" })
  assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.permissionsService.assignPermissionToRole(
      assignPermissionDto.roleId,
      assignPermissionDto.permissionId
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["revoke:permission"])
  @Delete("assign-permission/:roleId/:permissionId")
  @ApiOperation({ summary: "Remove a permission from a role" })
  @ApiParam({
    name: "roleId",
    type: "string",
    format: "uuid",
    description: "Role ID",
  })
  @ApiParam({
    name: "permissionId",
    type: "string",
    format: "uuid",
    description: "Permission ID",
  })
  @ApiOkResponse({ description: "Permission removed from role successfully" })
  @ApiNotFoundResponse({ description: "Role permission assignment not found" })
  removePermission(
    @Param("roleId", ParseUUIDPipe) roleId: string,
    @Param("permissionId", ParseUUIDPipe) permissionId: string
  ) {
    return this.permissionsService.removePermissionFromRole(
      roleId,
      permissionId
    );
  }

  // Direct User Permission endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["assign:userPermission"])
  @Post("assign-user-permission")
  @ApiOperation({ summary: "Assign a direct permission to a user" })
  @ApiOkResponse({ description: "Permission assigned to user successfully" })
  @ApiBadRequestResponse({ description: "Invalid assignment payload" })
  @ApiNotFoundResponse({ description: "User or permission not found" })
  @ApiConflictResponse({ description: "User already has this permission" })
  assignUserPermission(
    @Body() assignUserPermissionDto: AssignUserPermissionDto
  ) {
    return this.permissionsService.assignPermissionToUser(
      assignUserPermissionDto.userId,
      assignUserPermissionDto.permissionId,
      assignUserPermissionDto.assignedBy
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["revoke:userPermission"])
  @Delete("assign-user-permission/:userId/:permissionId")
  @ApiOperation({ summary: "Remove a direct permission from a user" })
  @ApiParam({
    name: "userId",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiParam({
    name: "permissionId",
    type: "string",
    format: "uuid",
    description: "Permission ID",
  })
  @ApiOkResponse({ description: "Permission removed from user successfully" })
  @ApiNotFoundResponse({ description: "User permission assignment not found" })
  removeUserPermission(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("permissionId", ParseUUIDPipe) permissionId: string
  ) {
    return this.permissionsService.removePermissionFromUser(
      userId,
      permissionId
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:userPermissionsDirect"])
  @Get("users/:userId/direct-permissions")
  @ApiOperation({ summary: "Get direct permissions assigned to a user" })
  @ApiParam({
    name: "userId",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiOkResponse({
    description: "Direct user permissions retrieved successfully",
  })
  getUserDirectPermissions(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.permissionsService.getUserDirectPermissions(userId);
  }

  // User-specific endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:userPermissionsAll"])
  @Get("users/:userId/permissions")
  @ApiOperation({ summary: "Get all permissions available to a user" })
  @ApiParam({
    name: "userId",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiOkResponse({ description: "User permissions retrieved successfully" })
  getUserPermissions(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }
}
