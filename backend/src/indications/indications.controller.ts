import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { IndicationsService } from './indications.service';
import { MemberJwtGuard } from '../common/guards/member-jwt.guard';
import { CreateIndicationDto } from './dto/create-indication.dto';
import { UpdateIndicationStatusDto } from './dto/update-indication-status.dto';
import type { Request } from 'express';

@Controller('indications')
@UseGuards(MemberJwtGuard)
export class IndicationsController {
  constructor(private readonly indicationsService: IndicationsService) {}

  @Post()
  create(
    @Req() request: Request,
    @Body() createIndicationDto: CreateIndicationDto,
  ) {
    return this.indicationsService.create(
      request.member!.id,
      createIndicationDto,
    );
  }

  @Get()
  findAll(@Req() request: Request) {
    return this.indicationsService.findForMember(request.member!.id);
  }

  @Patch(':id/status')
  updateStatus(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() updateIndicationStatusDto: UpdateIndicationStatusDto,
  ) {
    return this.indicationsService.updateStatus(
      request.member!.id,
      id,
      updateIndicationStatusDto,
    );
  }
}