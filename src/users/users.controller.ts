import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  Req,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthorizationGuard } from '@/auth/guards/authorization.guard';
import {
  Authorize,
  HasRoleOr,
  RequirePermission,
} from '@/auth/decorators/authorize.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Example: Has PLATFORM_ADMIN role OR BUSINESS_OWNER role OR read:own permission
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['read:own', 'read:any'])
  @Get()
  findAll(@Request() req, @Query('includeDeleted') includeDeleted?: string) {
    return this.usersService.findAll(req);
  }

  // Example: Has BUSINESS_OWNER role OR PLATFORM_MANAGER role OR read:own permission
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['read:own'])
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @Request() req,
    @Query('includeDeleted') includeDeleted?: string,
  ) {
    // If user has 'read:any' permission or PLATFORM_* role, show any user
    const hasReadAny =
      req.user?.permissions?.includes('read:any') ||
      req.user?.roles?.some((role: string) => role.startsWith('PLATFORM_'));
    const includeDeletedUsers = includeDeleted === 'true';
    return this.usersService.findOne(
      id,
      req.user,
      hasReadAny ? 'any' : 'own',
      includeDeletedUsers,
    );
  }

  // Activate user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ['PLATFORM_ADMIN', 'PLATFORM_MANAGER'],
    permissions: ['activate:user'],
  })
  @Patch(':id/activate')
  activateUser(@Param('id') id: string, @Request() req) {
    const hasManageAny =
      req.user?.permissions?.includes('activate:user') ||
      req.user?.roles?.some((role: string) => role.startsWith('PLATFORM_'));
    return this.usersService.activateUser(
      id,
      req.user,
      hasManageAny ? 'any' : 'own',
    );
  }

  // Deactivate user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ['PLATFORM_ADMIN', 'PLATFORM_MANAGER'],
    permissions: ['deactivate:user'],
  })
  @Patch(':id/deactivate')
  deactivateUser(@Param('id') id: string, @Request() req) {
    const hasManageAny =
      req.user?.permissions?.includes('deactivate:user') ||
      req.user?.roles?.some((role: string) => role.startsWith('PLATFORM_'));
    return this.usersService.deactivateUser(
      id,
      req.user,
      hasManageAny ? 'any' : 'own',
    );
  }

  // Soft delete user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ['PLATFORM_ADMIN', 'PLATFORM_MANAGER'],
    permissions: ['delete:user'],
  })
  @Delete(':id/soft')
  softDeleteUser(@Param('id') id: string, @Request() req) {
    const hasDeleteAny =
      req.user?.permissions?.includes('delete:user') ||
      req.user?.roles?.some((role: string) => role.startsWith('PLATFORM_'));
    return this.usersService.softDeleteUser(
      id,
      req.user,
      hasDeleteAny ? 'any' : 'own',
    );
  }

  // Restore user endpoint
  @UseGuards(AuthorizationGuard)
  @Authorize({
    roles: ['PLATFORM_ADMIN', 'PLATFORM_MANAGER'],
    permissions: ['restore:user'],
  })
  @Patch(':id/restore')
  restoreUser(@Param('id') id: string, @Request() req) {
    const hasRestoreAny =
      req.user?.permissions?.includes('restore:user') ||
      req.user?.roles?.some((role: string) => role.startsWith('PLATFORM_'));
    return this.usersService.restoreUser(
      id,
      req.user,
      hasRestoreAny ? 'any' : 'own',
    );
  }

  // Example: Must have update:user permission
  @UseGuards(AuthorizationGuard)
  // @RequirePermission('update:user')
  @Patch(':id')
  @UseInterceptors(
      FileInterceptor('picture', {
        storage: diskStorage({
          destination: './public/uploads/user',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
      }),
    )
  update(@Param('id') id: string, 
         @Body() updateUserDto: UpdateUserDto,
         @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.update(id, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }

  // Example: Must have delete:user permission
  @UseGuards(AuthorizationGuard)
  @RequirePermission('delete:user')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @Delete()
  removeMe(@Req() req: any) {
    return this.usersService.remove(req.user.id);
  }

  @UseGuards(AuthorizationGuard)
  @Patch()
  @UseInterceptors(
      FileInterceptor('picture', {
        storage: diskStorage({
          destination: './public/uploads/user',
          filename: (req, file, cb) => {
            const uniqueSuffix =
              Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, uniqueSuffix + extname(file.originalname));
          },
        }),
      }),
    )
  updateMe(@Req() req: any, 
         @Body() updateUserDto: UpdateUserDto,
         @UploadedFile() file: Express.Multer.File,
  ) {
    return this.usersService.update(req.user.id, {
      ...updateUserDto,
      ...(file && { imageUrl: `/uploads/user/${file.filename}` }),
    });
  }
}
