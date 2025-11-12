import { IsString, MinLength } from 'class-validator';

export class AdminLoginDto {
  @IsString()
  @MinLength(1, { message: 'A chave administrativa é obrigatória' })
  key!: string;
}


