import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { OfferService } from "./offer.service";
import { OfferController } from "./offer.controller";
import { Offers } from "@/database/entities/offers";
import { OfferCategories } from "@/database/entities/offerCategories";
import { Locations } from "@/database/entities/locations";
import { coverUploadOptions } from "./multer.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Offers, OfferCategories, Locations]),
    MulterModule.register(coverUploadOptions),
  ],
  controllers: [OfferController],
  providers: [OfferService],
})
export class OfferModule {}
