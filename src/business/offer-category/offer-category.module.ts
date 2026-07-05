import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OfferCategoryService } from "./offer-category.service";
import { OfferCategoryController } from "./offer-category.controller";
import { OfferCategories } from "@/database/entities/offerCategories";
import { Offers } from "@/database/entities/offers";

@Module({
  imports: [TypeOrmModule.forFeature([OfferCategories, Offers])],
  controllers: [OfferCategoryController],
  providers: [OfferCategoryService],
})
export class OfferCategoryModule {}
