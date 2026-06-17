import { IsString, IsNotEmpty, Matches, Length } from 'class-validator';

export class VerifyCodeDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?\d{10,20}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, {
    message: 'Contact must be a valid email address or phone number',
  })
  contact: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'Code must be exactly 4 digits' })
  @Matches(/^\d{4}$/, { message: 'Code must contain only digits' })
  code: string;
}
