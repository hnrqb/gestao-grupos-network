import { IsEnum } from 'class-validator';
import { IndicationStatus } from '@prisma/client';

export class UpdateIndicationStatusDto {
  @IsEnum(IndicationStatus)
  status: IndicationStatus;
}


