import { Module } from "@nestjs/common";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Role } from "@/database/entities/role";

@Module({
  imports: [TypeOrmModule.forFeature([Role])], // Add your entities here if needed
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService], // Export for use in other modules
})
export class RolesModule {}
