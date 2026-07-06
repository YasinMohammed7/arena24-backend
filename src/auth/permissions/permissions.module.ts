import { Module } from "@nestjs/common";
import { PermissionsService } from "./permissions.service";
import { PermissionsController } from "./permissions.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "@/database/entities/permission";
import { Role } from "@/database/entities/role";
import { RolePermission } from "@/database/entities/rolePermissions";
import { User } from "@/database/entities/user";
import { UserPermissions } from "@/database/entities/userPermissions";
import { UserRoles } from "@/database/entities/userRoles";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permission,
      Role,
      RolePermission,
      User,
      UserPermissions,
      UserRoles,
    ]),
  ], // Add your entities here if needed
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService], // Export for use in other modules
})
export class PermissionsModule {}
