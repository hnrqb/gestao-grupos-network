import { IsEmail, IsNotEmpty, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateMemberDto {
  @IsUUID()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  position?: string;

  @IsString()
  @IsOptional()
  companyDescription?: string;

  @IsString()
  @IsOptional()
  linkedinUrl?: string;
}

