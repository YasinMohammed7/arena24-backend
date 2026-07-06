import { Module } from "@nestjs/common";
import { ClientService } from "./client.service";
import { ClientController } from "./client.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Locations } from "@/database/entities/locations";
import { Media } from "@/database/entities/media";
import { Offers } from "@/database/entities/offers";
import { OfferCategories } from "@/database/entities/offerCategories";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Locations,
      Media,
      Event,
      Offers,
      OfferCategories,
    ]),
  ],
  controllers: [ClientController],
  providers: [ClientService],
})
export class ClientModule {}
