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
import { RolesService } from "./roles.service";
import { CreateRoleDto, AssignRoleDto } from "./dto/create-role.dto";
import { RoleResponseDto } from "./dto/role-response.dto";
import { AuthGuard } from "@nestjs/passport";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@ApiTags("Roles")
@ApiBearerAuth("access-token")
@UseGuards(AuthGuard("jwt")) // Apply JWT guard to all endpoints
@Controller("roles")
export class RolesController {
  constructor(private rolesService: RolesService) {}

  // Role endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["create:role"])
  @Post()
  @ApiOperation({ summary: "Create a role" })
  @ApiOkResponse({ description: "Role created successfully" })
  @ApiBadRequestResponse({ description: "Invalid role payload" })
  @ApiConflictResponse({ description: "Role name already exists" })
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:roles"])
  @Get()
  @ApiOperation({ summary: "Get all roles with their permissions" })
  @ApiOkResponse({
    description: "Roles retrieved successfully with permissions",
    type: [RoleResponseDto],
  })
  getRoles() {
    return this.rolesService.getRoles();
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:role"])
  @Get(":id")
  @ApiOperation({ summary: "Get a role by ID with its permissions" })
  @ApiParam({
    name: "id",
    type: "string",
    format: "uuid",
    description: "Role ID",
  })
  @ApiOkResponse({
    description: "Role retrieved successfully with permissions",
    type: RoleResponseDto,
  })
  @ApiNotFoundResponse({ description: "Role not found" })
  getRoleById(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.getRoleById(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["delete:role"])
  @Delete(":id")
  @ApiOperation({ summary: "Delete a role" })
  @ApiParam({
    name: "id",
    type: "string",
    format: "uuid",
    description: "Role ID",
  })
  @ApiOkResponse({ description: "Role deleted successfully" })
  @ApiNotFoundResponse({ description: "Role not found" })
  @ApiConflictResponse({
    description: "Cannot delete role that has users assigned to it",
  })
  deleteRole(@Param("id", ParseUUIDPipe) id: string) {
    return this.rolesService.deleteRole(id);
  }
  // Assignment endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["assign:role"])
  @Post("assign-role")
  @ApiOperation({ summary: "Assign a role to a user" })
  @ApiOkResponse({ description: "Role assigned to user successfully" })
  @ApiBadRequestResponse({ description: "Invalid assignment payload" })
  @ApiNotFoundResponse({ description: "User or role not found" })
  @ApiConflictResponse({ description: "User already has this role" })
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["revoke:role"])
  @Delete("assign-role/:userId/:roleId")
  @ApiOperation({ summary: "Remove a role from a user" })
  @ApiParam({
    name: "userId",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiParam({
    name: "roleId",
    type: "string",
    format: "uuid",
    description: "Role ID",
  })
  @ApiOkResponse({ description: "Role removed from user successfully" })
  @ApiNotFoundResponse({ description: "User role assignment not found" })
  removeRole(
    @Param("userId", ParseUUIDPipe) userId: string,
    @Param("roleId", ParseUUIDPipe) roleId: string
  ) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  // User-specific endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["PLATFORM_ADMIN"], ["read:userRoles"])
  @Get("users/:userId/roles")
  @ApiOperation({ summary: "Get roles assigned to a user" })
  @ApiParam({
    name: "userId",
    type: "string",
    format: "uuid",
    description: "User ID",
  })
  @ApiOkResponse({ description: "User roles retrieved successfully" })
  getUserRoles(@Param("userId", ParseUUIDPipe) userId: string) {
    return this.rolesService.getUserRoles(userId);
  }
}
