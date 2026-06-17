import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferCategoryDto {
  @ApiProperty({
    description: 'Offer category name',
    example: 'Pizza Specials',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
