import { IsString, IsNotEmpty, Matches } from 'class-validator';

export class SendVerificationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?\d{10,20}|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})$/, {
    message: 'Contact must be a valid email address or phone number',
  })
  contact: string;
}
