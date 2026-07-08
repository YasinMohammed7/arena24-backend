import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Media } from "@/database/entities/media";
import { CreateMediaDto } from "./dto/create-media.dto";
import { FindMediaQueryDto } from "./dto/find-media-query.dto";
import * as fs from "fs";

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>
  ) {}

  async create(dto: CreateMediaDto, file: Express.Multer.File) {
    // If the file landed in the temp directory (body fields weren't available
    // at multer storage time), move it to its final location.
    if (file.path.includes("/temp/")) {
      const dir = `./public/uploads/${dto.modelType}/${dto.type}`;
      fs.mkdirSync(dir, { recursive: true });
      const dest = `${dir}/${file.filename}`;
      fs.renameSync(file.path, dest);
      file.path = dest;
    }

    const media = this.mediaRepo.create({
      modelType: dto.modelType,
      modelId: dto.modelId,
      type: dto.type,
      fileName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      url: `/uploads/${dto.modelType}/${dto.type}/${file.filename}`,
      altText: file.originalname,
      sortOrder: 0,
    });

    return this.mediaRepo.save(media);
  }

  async findForModel(query: FindMediaQueryDto) {
    const { modelType, modelId, type } = query;
    return this.mediaRepo.findBy({
      modelType,
      modelId,
      ...(type && { type }),
    });
  }

  async delete(id: string) {
    const media = await this.mediaRepo.findOneBy({ id });
    if (!media) throw new NotFoundException("Media not found");

    try {
      fs.unlinkSync(media.path);
    } catch (err) {
      console.warn(
        `File not found on disk, removing DB record only: ${media.path}`,
        err
      );
    }
    return this.mediaRepo.remove(media);
  }
}
