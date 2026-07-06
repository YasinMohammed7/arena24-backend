import { Controller, Get, Param, ParseIntPipe, Query } from "@nestjs/common";
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { ClientService } from "./client.service";
import { QueryOfferDto } from "./dto/query-offer.dto";
import { OfferResponseDto } from "@/business/offer/dto/offer-response.dto";
import { QueryOfferCategoryDto } from "@/business/offer-category/dto/query-offer-category.dto";
import { OfferCategoryResponseDto } from "@/business/offer-category/dto/offer-category-response.dto";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";

@ApiTags("Client")
@Controller("client")
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get("offer-categories")
  @ApiOperation({ summary: "List active offer categories for clients" })
  @ApiPaginatedResponse(OfferCategoryResponseDto)
  async findAll(@Query() queryDto: QueryOfferCategoryDto) {
    return this.clientService.findAllOfferCategories(queryDto);
  }

  @Get("locations")
  @ApiOperation({ summary: "List active locations for clients" })
  @ApiOkResponse({ description: "Active locations returned successfully" })
  async findAllActiveLocations() {
    return this.clientService.findAllActiveLocations();
  }

  @Get("location/:id")
  @ApiOperation({ summary: "Get an active location by ID for clients" })
  @ApiParam({ name: "id", type: Number, description: "Location ID" })
  @ApiOkResponse({ description: "Active location returned successfully" })
  @ApiNotFoundResponse({ description: "Location not found" })
  async findActiveLocationById(@Param("id", ParseIntPipe) id: number) {
    return this.clientService.findActiveLocationById(id);
  }

  @Get("events")
  @ApiOperation({ summary: "List active events for clients" })
  @ApiOkResponse({ description: "Active events returned successfully" })
  async findAllActiveEvents() {
    return this.clientService.findAllActiveEvents();
  }

  @Get("event/:id")
  @ApiOperation({ summary: "Get an active event by ID for clients" })
  @ApiParam({ name: "id", type: Number, description: "Event ID" })
  @ApiOkResponse({ description: "Active event returned successfully" })
  @ApiNotFoundResponse({ description: "Event not found" })
  async findActiveEventById(@Param("id", ParseIntPipe) id: number) {
    return this.clientService.findActiveEventById(id);
  }

  @Get("offers")
  @ApiOperation({ summary: "List active offers for clients" })
  @ApiPaginatedResponse(OfferResponseDto)
  async findAllOffers(@Query() queryDto: QueryOfferDto) {
    return this.clientService.findAllOffers(queryDto);
  }

  @Get("offer/:id")
  @ApiOperation({ summary: "Get an offer by ID for clients" })
  @ApiParam({ name: "id", type: Number, description: "Offer ID" })
  @ApiOkResponse({ description: "Offer returned successfully" })
  @ApiNotFoundResponse({ description: "Offer not found" })
  async findOfferById(@Param("id", ParseIntPipe) id: number) {
    return this.clientService.findOneOffer(id);
  }
}
