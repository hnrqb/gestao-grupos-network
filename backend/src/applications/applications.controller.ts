import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller({ path: 'applications', version: '1' })
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createApplicationDto: CreateApplicationDto) {
    return this.applicationsService.create(createApplicationDto);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll(@Query('status') status?: string) {
    const parsedStatus = this.parseStatus(status);
    return this.applicationsService.findAll(parsedStatus);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }

  @Post(':id/approve')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  approve(@Param('id') id: string) {
    return this.applicationsService.approve(id);
  }

  @Post(':id/reject')
  @UseGuards(AdminGuard)
  @HttpCode(HttpStatus.OK)
  reject(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.applicationsService.reject(id, reason);
  }

  private parseStatus(value?: string): ApplicationStatus | undefined {
    if (!value) {
      return undefined;
    }

    const normalized = value.toUpperCase() as ApplicationStatus;
    const validStatuses = Object.values(ApplicationStatus) as string[];
    if (!validStatuses.includes(normalized)) {
      throw new BadRequestException('Status de aplicação inválido.');
    }

    return normalized;
  }
}
