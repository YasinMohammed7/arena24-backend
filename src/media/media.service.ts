import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import * as fs from "fs";

@Injectable()
export class MediaService {
  constructor(private prisma: PrismaService) {}

  async create(
    modelType: string,
    modelId: string,
    type: string,
    file: Express.Multer.File
  ) {
    const filePath = file.path;
    const fileUrl = `/uploads/${modelType}/${type}/${file.filename}`;

    return this.prisma.media.create({
      data: {
        modelType,
        modelId,
        type,
        fileName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        path: filePath,
        url: fileUrl,
        altText: file.originalname,
        sortOrder: 0,
      },
    });
  }

  async findForModel(modelType: string, modelId: string, type?: string) {
    return this.prisma.media.findMany({
      where: {
        modelType,
        modelId,
        ...(type && { type }),
      },
    });
  }

  async delete(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } });
    if (!media) throw new NotFoundException("Media not found");

    fs.unlinkSync(media.path);
    return this.prisma.media.delete({ where: { id } });
  }
}
