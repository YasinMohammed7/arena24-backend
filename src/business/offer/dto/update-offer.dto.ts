import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
  IsUrl,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateOfferDto {
  @ApiPropertyOptional({
    description: 'Offer name',
    example: 'Updated Summer Special - 40% Off All Pizzas',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Updated offer description with better details!',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Offer image URL',
    example: 'https://example.com/updated-offer-image.jpg',
  })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Image must be a valid URL' })
  image?: string;

  @ApiPropertyOptional({
    description: 'Offer start date',
    example: '2025-08-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Offer end date',
    example: '2025-08-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100)',
    minimum: 0,
    maximum: 100,
    example: 40,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Discount must be at least 0%' })
  @Max(100, { message: 'Discount must be at most 100%' })
  discount?: number;

  @ApiPropertyOptional({
    description: 'Location ID (null for global offers)',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @ApiPropertyOptional({
    description: 'Offer category ID',
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
