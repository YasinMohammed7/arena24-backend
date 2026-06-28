import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class FindMediaQueryDto {
  @ApiProperty({
    description: "Entity type the media belongs to",
    example: "Location",
  })
  @IsString()
  @IsNotEmpty()
  modelType: string;

  @ApiProperty({ description: "Id of the related entity", example: "42" })
  @IsString()
  @IsNotEmpty()
  modelId: string;

  @ApiPropertyOptional({
    description: "Filter by media slot / type",
    example: "cover",
  })
  @IsOptional()
  @IsString()
  type?: string;
}
