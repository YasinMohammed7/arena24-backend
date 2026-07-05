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
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  ParseUUIDPipe,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiParam,
} from "@nestjs/swagger";
import { MediaService } from "./media.service";
import { CreateMediaDto } from "./dto/create-media.dto";
import { FindMediaQueryDto } from "./dto/find-media-query.dto";
import { MAX_FILE_SIZE } from "./multer.config";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";

@ApiTags("media")
@Controller("media")
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post("upload")
  @ApiOperation({ summary: "Upload a media file for an entity" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Media file plus its owner reference",
    schema: {
      type: "object",
      required: ["file", "modelType", "modelId", "type"],
      properties: {
        file: { type: "string", format: "binary" },
        modelType: { type: "string", example: "Location" },
        modelId: { type: "string", example: "42" },
        type: { type: "string", example: "cover" },
      },
    },
  })
  @ApiCreatedResponse({ description: "Media uploaded and stored" })
  @ApiBadRequestResponse({
    description:
      "Missing/invalid fields, no file, or unsupported file type/size",
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadFile(
    @Body() dto: CreateMediaDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
          new FileTypeValidator({
            fileType: /^image\/(jpeg|png|webp|svg\+xml)$/,
          }),
        ],
      })
    )
    file: Express.Multer.File
  ) {
    return this.mediaService.create(dto, file);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "List media for a given entity" })
  @ApiOkResponse({ description: "Array of matching media records" })
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:own", "read:media"])
  @Get()
  async getMedia(@Query() query: FindMediaQueryDto) {
    return this.mediaService.findForModel(query);
  }

  @ApiBearerAuth("access-token")
  @ApiOperation({ summary: "Delete a media record and its stored file" })
  @ApiParam({ name: "id", description: "Media id (uuid)" })
  @ApiOkResponse({ description: "Media deleted" })
  @ApiNotFoundResponse({ description: "Media not found" })
  @UseGuards(JwtAuthGuard)
  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["delete:media"])
  @Delete(":id")
  async deleteMedia(@Param("id", ParseUUIDPipe) id: string) {
    return this.mediaService.delete(id);
  }
}
