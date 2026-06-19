import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from "@nestjs/common";
import { EventService } from "./event.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@Controller("business/events")
@UseGuards(JwtAuthGuard)
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:event"]
  )
  @Post()
  @UseInterceptors(
    FileInterceptor("cover", {
      storage: diskStorage({
        destination: "./public/uploads/events/cover",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const eventData = {
      ...createEventDto,
      imageUrl: file ? `/uploads/events/cover/${file.filename}` : undefined,
    };
    return this.eventService.create(eventData);
  }

  @Get()
  findAll() {
    return this.eventService.findAll();
  }

  @Get("location/:locationId")
  findByLocation(@Param("locationId", ParseIntPipe) locationId: number) {
    return this.eventService.findByLocation(locationId);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:event"]
  )
  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("cover", {
      storage: diskStorage({
        destination: "./public/uploads/events/cover",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    const eventData = {
      ...updateEventDto,
      imageUrl: file ? `/uploads/events/cover/${file.filename}` : undefined,
    };
    return this.eventService.update(id, eventData);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:event"]
  )
  @Delete(":id")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:event"]
  )
  @Patch(":eventId/facility/:facilityId/toggle-status")
  toggleEventFacilityStatus(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("facilityId", ParseIntPipe) facilityId: number
  ) {
    return this.eventService.toggleEventFacilityStatus(eventId, facilityId);
  }
}
