import { ApiProperty } from '@nestjs/swagger';

export class OfferCategoryResponseDto {
  @ApiProperty({
    description: 'Offer category ID',
    example: 1
  })
  id: number;

  @ApiProperty({
    description: 'Offer category name',
    example: 'Pizza Specials'
  })
  name: string;

  @ApiProperty({
    description: 'Number of active offers in this category',
    example: 5
  })
  offerCount?: number;

  @ApiProperty({
    description: 'Category creation timestamp',
    example: '2025-08-23T10:00:00.000Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Category last update timestamp',
    example: '2025-08-23T10:00:00.000Z'
  })
  updatedAt: Date;
}
