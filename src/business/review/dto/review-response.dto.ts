import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({
    description: 'Review ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Review comment text',
    example: 'Great food and excellent service!',
    nullable: true,
  })
  comment: string | null;

  @ApiProperty({
    description: 'Star rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  stars: number;

  @ApiProperty({
    description: 'User who created the review',
  })
  user: {
    id: string;
    name: string;
    email: string;
  };

  @ApiProperty({
    description: 'Location being reviewed',
  })
  location: {
    id: number;
    name: string;
    type: string;
  };

  @ApiProperty({
    description: 'Review creation timestamp',
    example: '2025-08-23T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Review last update timestamp',
    example: '2025-08-23T10:00:00.000Z',
  })
  updatedAt: Date;
}
