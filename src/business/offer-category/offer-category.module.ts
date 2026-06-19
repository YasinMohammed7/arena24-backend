import { Module } from "@nestjs/common";
import { OfferCategoryService } from "./offer-category.service";
import { OfferCategoryController } from "./offer-category.controller";
import { PrismaModule } from "@/prisma/prisma.module";

@Module({
  imports: [PrismaModule],
  controllers: [OfferCategoryController],
  providers: [OfferCategoryService],
  exports: [OfferCategoryService],
})
export class OfferCategoryModule {}
