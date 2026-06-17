import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOfferCategoryDto {
  @ApiPropertyOptional({
    description: 'Offer category name',
    example: 'Updated Pizza Specials',
  })
  @IsOptional()
  @IsString()
  name?: string;
}
