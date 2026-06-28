import { IsString, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateMediaDto {
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

  @ApiProperty({ description: "Media slot / type", example: "cover" })
  @IsString()
  @IsNotEmpty()
  type: string;
}
