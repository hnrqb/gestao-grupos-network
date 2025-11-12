import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateIndicationDto {
  @IsUUID()
  targetMemberId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  contactInfo: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}


