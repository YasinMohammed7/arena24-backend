import { ApiProperty } from "@nestjs/swagger";

class PermissionInfoDto {
  @ApiProperty({ description: "Permission ID" })
  id: string;

  @ApiProperty({ description: "Permission name", example: "create:own" })
  name: string;
}

class RolePermissionInfoDto {
  @ApiProperty({ description: "Role ID" })
  roleId: string;

  @ApiProperty({ description: "Permission ID" })
  permissionId: string;

  @ApiProperty({ description: "Permission details" })
  permission: PermissionInfoDto;
}

export class RoleResponseDto {
  @ApiProperty({ description: "Role ID" })
  id: string;

  @ApiProperty({ description: "Role name", example: "BUSINESS_OWNER" })
  name: string;

  @ApiProperty({
    description: "Permissions assigned to this role",
    type: [RolePermissionInfoDto],
  })
  rolePermissions: RolePermissionInfoDto[];
}
