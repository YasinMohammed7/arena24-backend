import {
  IsString,
  IsInt,
  IsOptional,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateOfferDto {
  @ApiProperty({
    description: 'Offer name',
    example: 'Summer Special - 30% Off All Pizzas',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Offer description',
    example: 'Get 30% off on all our delicious pizzas this summer!',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description:
      'Offer image URL (will be set automatically if file is uploaded)',
    example: '/uploads/offers/image.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({
    description: 'Offer start date',
    example: '2025-08-01T00:00:00.000Z',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Offer end date',
    example: '2025-08-31T23:59:59.000Z',
  })
  @IsDateString()
  endDate: string;

  @ApiPropertyOptional({
    description: 'Discount percentage (0-100)',
    minimum: 0,
    maximum: 100,
    example: 30,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'Discount must be at least 0%' })
  @Max(100, { message: 'Discount must be at most 100%' })
  discount?: number;

  @ApiPropertyOptional({
    description: 'Location ID (null for global offers)',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @ApiProperty({
    description: 'Offer category ID',
    example: 1,
  })
  @Type(() => Number)
  @IsInt()
  categoryId: number;
}
