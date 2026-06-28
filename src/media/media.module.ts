import { Module } from "@nestjs/common";
import { MulterModule } from "@nestjs/platform-express";
import { MediaService } from "./media.service";
import { MediaController } from "./media.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Media } from "@/database/entities/media";
import { multerOptions } from "./multer.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Media]),
    MulterModule.register(multerOptions),
  ],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
