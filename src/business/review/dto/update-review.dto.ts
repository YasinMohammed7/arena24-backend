import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({
    description: 'Review comment text',
    example: 'Updated review: Great food and excellent service!',
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiPropertyOptional({
    description: 'Star rating from 1 to 5',
    minimum: 1,
    maximum: 5,
    example: 4,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Stars must be at least 1' })
  @Max(5, { message: 'Stars must be at most 5' })
  stars?: number;
}
