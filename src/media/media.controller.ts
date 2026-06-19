import {
  Controller,
  Post,
  Body,
  UploadedFile,
  UseInterceptors,
  Get,
  Query,
  Delete,
  Param,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import * as fs from "fs";
import { MediaService } from "./media.service";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: (req, file, cb) => {
          // Parse the body manually to get modelType and type
          let modelType = "";
          let type = "";

          // For multipart/form-data, we need to parse the body differently
          const body = req.body as { modelType?: string; type?: string };
          if (body) {
            modelType = body.modelType ?? "";
            type = body.type ?? "";
          }

          // If still undefined, try to get from headers or other sources
          if (!modelType || !type) {
            // Extract from the raw body if available
            const bodyStr = body ? JSON.stringify(body) : "";
            console.log("Body content:", bodyStr, "Headers:", req.headers);

            // Fallback to a temporary directory
            const uploadPath = `./public/uploads/temp`;
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
            return;
          }

          const uploadPath = `./public/uploads/${modelType}/${type}`;
          fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  async uploadFile(
    @Body("modelType") modelType: string,
    @Body("modelId") modelId: string,
    @Body("type") type: string,
    @UploadedFile() file: Express.Multer.File
  ) {
    // Check if file was uploaded
    if (!file) {
      throw new Error("No file uploaded");
    }

    // If file was uploaded to temp directory, move it to correct location
    if (file.path.includes("/temp/")) {
      const correctPath = `./public/uploads/${modelType}/${type}`;
      fs.mkdirSync(correctPath, { recursive: true });

      const newFilePath = `${correctPath}/${file.filename}`;
      fs.renameSync(file.path, newFilePath);

      // Update file object with correct path
      file.path = newFilePath;
    }

    return this.mediaService.create(modelType, modelId, type, file);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own", "read:media"])
  @Get()
  async getMedia(
    @Query("modelType") modelType: string,
    @Query("modelId") modelId: string,
    @Query("type") type?: string
  ) {
    return this.mediaService.findForModel(modelType, modelId, type);
  }

  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["delete:media"])
  @Delete(":id")
  async deleteMedia(@Param("id") id: string) {
    return this.mediaService.delete(id);
  }
}
