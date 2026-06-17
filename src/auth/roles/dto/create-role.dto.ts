import { IsString, IsNotEmpty, Length } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @Length(2, 50)
  name: string;
}

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  roleId: string;
}
