import { IsString, IsNotEmpty, Length, IsOptional } from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
}

export class AssignPermissionDto {
  @IsString()
  @IsNotEmpty()
  roleId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;
}

export class AssignUserPermissionDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  permissionId: string;

  @IsString()
  @IsOptional()
  assignedBy?: string;
}
