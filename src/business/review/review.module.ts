import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { Reviews } from "@/database/entities/reviews";
import { User } from "@/database/entities/user";
import { Locations } from "@/database/entities/locations";

@Module({
  imports: [TypeOrmModule.forFeature([Reviews, User, Locations])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
