import {
  IsString,
  IsNotEmpty,
  Length,
  IsOptional,
  IsUUID,
} from "class-validator";

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  name: string;
}

export class AssignPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @IsUUID()
  @IsNotEmpty()
  permissionId: string;
}

export class AssignUserPermissionDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  permissionId: string;

  @IsUUID()
  @IsOptional()
  assignedBy?: string;
}
