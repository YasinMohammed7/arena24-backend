import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthorizationGuard } from '@/auth/guards/authorization.guard';
import { HasRoleOr } from '@/auth/decorators/authorize.decorator';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    [key: string]: any;
  };
}

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ['BUSINESS_OWNER', 'PLATFORM_MANAGER'],
    ['create:any', 'create:business'],
  )
  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.businessService.create(createBusinessDto, req.user.id);
  }

  @Get()
  async findAll(
    @Request() req: AuthenticatedRequest,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ) {
    console.log('Business created by user:', req.user.id);
    return this.businessService.findAll(req.user.id, page, limit);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['read:business'])
  @Get('my-businesses')
  async getMyBusinesses(@Request() req: AuthenticatedRequest) {
    return this.businessService.getBusinessesByUser(req.user.id);
  }

  @Get('business/:id')
  async findOne(@Param('id') id: number, @Request() req: AuthenticatedRequest) {
    return this.businessService.findOne(id, req.user.id);
  }

  @Get('business/:id/stats')
  async getBusinessStats(
    @Param('id') id: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.businessService.getBusinessStats(id, req.user.id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['update:business'])
  @Patch('business/:id')
  async update(
    @Param('id') id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.businessService.update(id, updateBusinessDto, req.user.id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(['BUSINESS_OWNER', 'PLATFORM_MANAGER'], ['delete:business'])
  @Delete('business/:id')
  async remove(@Param('id') id: number, @Request() req: AuthenticatedRequest) {
    await this.businessService.remove(id, req.user.id);
    return { message: 'Business deleted successfully' };
  }
}
