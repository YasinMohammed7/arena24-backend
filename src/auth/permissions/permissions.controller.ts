import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  AssignPermissionDto,
  AssignUserPermissionDto,
} from './dto/create-permission.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizationGuard } from '@/auth/guards/authorization.guard';
import { HasRoleOr } from '@/auth/decorators/authorize.decorator';

@UseGuards(AuthGuard('jwt')) // Apply JWT guard to all endpoints
@Controller('permissions')
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  // Permission endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['create:permission'])
  @Post('permissions')
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.createPermission(createPermissionDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:permissions'])
  @Get('permissions')
  getPermissions() {
    return this.permissionsService.getPermissions();
  }

  // Role Assignment endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['assign:permission'])
  @Post('assign-permission')
  assignPermission(@Body() assignPermissionDto: AssignPermissionDto) {
    return this.permissionsService.assignPermissionToRole(
      assignPermissionDto.roleId,
      assignPermissionDto.permissionId,
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['revoke:permission'])
  @Delete('assign-permission/:roleId/:permissionId')
  removePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.removePermissionFromRole(
      roleId,
      permissionId,
    );
  }

  // Direct User Permission endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['assign:userPermission'])
  @Post('assign-user-permission')
  assignUserPermission(
    @Body() assignUserPermissionDto: AssignUserPermissionDto,
  ) {
    return this.permissionsService.assignPermissionToUser(
      assignUserPermissionDto.userId,
      assignUserPermissionDto.permissionId,
      assignUserPermissionDto.assignedBy,
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['revoke:userPermission'])
  @Delete('assign-user-permission/:userId/:permissionId')
  removeUserPermission(
    @Param('userId') userId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.permissionsService.removePermissionFromUser(
      userId,
      permissionId,
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:userPermissionsDirect'])
  @Get('users/:userId/direct-permissions')
  getUserDirectPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserDirectPermissions(userId);
  }

  // User-specific endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:userPermissionsAll'])
  @Get('users/:userId/permissions')
  getUserPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserPermissions(userId);
  }
}
