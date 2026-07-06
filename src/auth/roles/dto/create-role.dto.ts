import { IsString, IsNotEmpty, IsUUID, Length } from "class-validator";

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;
}

export class AssignRoleDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  roleId: string;
}
