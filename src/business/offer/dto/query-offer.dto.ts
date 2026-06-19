import {
  IsOptional,
  IsInt,
  IsString,
  Min,
  IsDateString,
  IsBoolean,
} from "class-validator";
import { Type, Transform } from "class-transformer";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryOfferDto {
  @ApiPropertyOptional({
    description: "Filter by location ID (null for global offers)",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  locationId?: number;

  @ApiPropertyOptional({
    description: "Filter by category ID",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;

  @ApiPropertyOptional({
    description: "Filter by offer name (partial match)",
    example: "pizza",
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: "Filter offers starting from this date",
    example: "2025-08-01T00:00:00.000Z",
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: "Filter offers ending before this date",
    example: "2025-12-31T23:59:59.000Z",
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: "Filter by minimum discount percentage",
    minimum: 0,
    maximum: 100,
    example: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minDiscount?: number;

  @ApiPropertyOptional({
    description: "Show only active offers (default: true)",
    default: true,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  activeOnly?: boolean = true;

  @ApiPropertyOptional({
    description: "Show only global offers (locationId is null)",
    default: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  @IsBoolean()
  globalOnly?: boolean = false;

  @ApiPropertyOptional({
    description: "Page number for pagination",
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: "Number of items per page",
    minimum: 1,
    maximum: 100,
    default: 10,
    example: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
