import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "@/database/entities/role";
import { User } from "@/database/entities/user";
import { UserRoles } from "@/database/entities/userRoles";

@Module({
  imports: [TypeOrmModule.forFeature([Role, User, UserRoles])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService],
})
export class RolesModule {}
