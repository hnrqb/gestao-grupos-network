import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
  fullName: string;

  @IsEmail({}, { message: 'Email inválido' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Nome da empresa deve ter pelo menos 2 caracteres' })
  company: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(50, {
    message: 'Por favor, explique com mais detalhes (mínimo 50 caracteres)',
  })
  whyParticipate: string;
}
