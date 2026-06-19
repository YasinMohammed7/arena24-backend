import { IsString, IsInt, Min, Max, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiPropertyOptional({
    description: "Review comment text",
    example: "Great food and excellent service!",
  })
  @IsOptional()
  @IsString()
  comment?: string;

  @ApiProperty({
    description: "Star rating from 1 to 5",
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1, { message: "Stars must be at least 1" })
  @Max(5, { message: "Stars must be at most 5" })
  stars: number;

  @ApiProperty({
    description: "ID of the location being reviewed",
    example: 1,
  })
  @IsInt()
  locationId: number;
}
