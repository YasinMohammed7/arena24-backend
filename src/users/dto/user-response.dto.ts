import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({ description: "User ID" })
  id: string;

  @ApiProperty({ description: "User email", example: "user@example.com" })
  email: string;

  @ApiProperty({ description: "User name", example: "John Doe" })
  name: string;

  @ApiProperty({ description: "User phone", example: "1234567890" })
  phone: string;

  @ApiProperty({ description: "Owner ID", nullable: true })
  ownerId: string | null;

  @ApiProperty({ description: "Whether the user is active", example: true })
  isActive: boolean;

  @ApiProperty({ description: "Soft-delete timestamp", nullable: true })
  deletedAt: Date | null;

  @ApiProperty({ description: "Creation timestamp" })
  createdAt: Date;

  @ApiProperty({ description: "Last update timestamp" })
  updatedAt: Date;

  @ApiProperty({
    description: "Role names assigned to the user",
    example: ["BUSINESS_OWNER"],
  })
  roles: string[];

  @ApiProperty({
    description: "All permission names from the user's roles",
    example: ["create:own", "read:own", "update:own"],
  })
  permissions: string[];
}
