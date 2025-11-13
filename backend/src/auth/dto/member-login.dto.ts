import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class MemberLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  secret: string;
}
