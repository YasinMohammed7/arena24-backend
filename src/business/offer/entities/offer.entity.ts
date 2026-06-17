import { ApiProperty } from '@nestjs/swagger';

export class Offer {
  @ApiProperty({
    description: 'Offer ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Offer name',
    example: 'Summer Special - 30% Off All Pizzas',
  })
  name: string;

  @ApiProperty({
    description: 'Offer description',
    example: 'Get 30% off on all our delicious pizzas this summer!',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({
    description: 'Offer image URL',
    example: 'https://example.com/offer-image.jpg',
  })
  image: string;

  @ApiProperty({
    description: 'Offer start date',
    example: '2025-08-01T00:00:00.000Z',
  })
  startDate: Date;

  @ApiProperty({
    description: 'Offer end date',
    example: '2025-08-31T23:59:59.000Z',
  })
  endDate: Date;

  @ApiProperty({
    description: 'Discount percentage (0-100)',
    example: 30,
    nullable: true,
  })
  discount: number | null;

  @ApiProperty({
    description: 'Location ID (null for global offers)',
    example: 1,
    nullable: true,
  })
  locationId: number | null;

  @ApiProperty({
    description: 'Offer category ID',
    example: 1,
  })
  categoryId: number;

  @ApiProperty({
    description: 'Offer creation timestamp',
    example: '2025-08-23T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Offer last update timestamp',
    example: '2025-08-23T10:00:00.000Z',
  })
  updatedAt: Date;
}
