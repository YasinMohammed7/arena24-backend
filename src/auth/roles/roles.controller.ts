import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, AssignRoleDto } from './dto/create-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { AuthorizationGuard } from '@/auth/guards/authorization.guard';
import { HasRoleOr } from '@/auth/decorators/authorize.decorator';

@UseGuards(AuthGuard('jwt')) // Apply JWT guard to all endpoints
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  // Role endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['create:role'])
  @Post('roles')
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.createRole(createRoleDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:roles'])
  @Get('roles')
  getRoles() {
    return this.rolesService.getRoles();
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:role'])
  @Get('roles/:id')
  getRoleById(@Param('id') id: string) {
    return this.rolesService.getRoleById(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['delete:role'])
  @Delete('role/:id')
  deleteRole(@Param('id') id: string) {
    return this.rolesService.deleteRole(id);
  }
  // Assignment endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['assign:role'])
  @Post('assign-role')
  assignRole(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(
      assignRoleDto.userId,
      assignRoleDto.roleId,
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['revoke:role'])
  @Delete('assign-role/:userId/:roleId')
  removeRole(@Param('userId') userId: string, @Param('roleId') roleId: string) {
    return this.rolesService.removeRoleFromUser(userId, roleId);
  }

  // User-specific endpoints
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['PLATFORM_ADMIN'], ['read:userRoles'])
  @Get('users/:userId/roles')
  getUserRoles(@Param('userId') userId: string) {
    return this.rolesService.getUserRoles(userId);
  }
}
