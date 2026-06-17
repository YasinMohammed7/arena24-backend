import { Controller, Get, Param, ParseIntPipe, Query, ValidationPipe } from '@nestjs/common';
import { ClientService } from './client.service';
import { QueryOfferDto, ParsedQueryOfferDto } from './dto/query-offer.dto';
import { QueryOfferCategoryDto } from '@/business/offer-category/dto/query-offer-category.dto';

@Controller('client')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Get('offer-categories')
  async findAll(@Query(ValidationPipe) queryDto: QueryOfferCategoryDto){
    return this.clientService.findAllOfferCategories(queryDto);
  }
  
  @Get('locations')
  async findAllActiveLocations() {
    return this.clientService.findAllActiveLocations();
  }

  @Get('location/:id')
  async findActiveLocationById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findActiveLocationById(id);
  }

  @Get('events')
  async findAllActiveEvents() {
    return this.clientService.findAllActiveEvents();
  }

  @Get('event/:id')
  async findActiveEventById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findActiveEventById(id);
  }

  @Get('offers')
  async findAllOffers(@Query() queryDto: QueryOfferDto) {
    // Convert string query parameters to proper types
    const parsedQuery: ParsedQueryOfferDto = {
      ...queryDto,
      locationId: queryDto.locationId ? Number(queryDto.locationId) : undefined,
      categoryId: queryDto.categoryId ? Number(queryDto.categoryId) : undefined,
      minDiscount: queryDto.minDiscount
        ? Number(queryDto.minDiscount)
        : undefined,
      activeOnly:
        queryDto.activeOnly !== undefined
          ? queryDto.activeOnly === 'true'
          : true,
      globalOnly: queryDto.globalOnly ? queryDto.globalOnly === 'true' : false,
      page: queryDto.page ? Number(queryDto.page) : 1,
      limit: queryDto.limit ? Number(queryDto.limit) : 10,
    };

    return this.clientService.findAllOffers(parsedQuery);
  }

  @Get('offer/:id')
  async findOfferById(@Param('id', ParseIntPipe) id: number) {
    return this.clientService.findOneOffer(id);
  }
}
