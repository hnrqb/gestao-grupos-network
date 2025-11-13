import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  private readonly invitationExpirationDays = 7;

  constructor(private prisma: PrismaService) {}

  async create(createApplicationDto: CreateApplicationDto) {
    const existingApplication = await this.prisma.application.findUnique({
      where: { email: createApplicationDto.email },
    });

    if (existingApplication) {
      throw new BadRequestException('Email já cadastrado');
    }

    const application = await this.prisma.application.create({
      data: {
        fullName: createApplicationDto.fullName,
        email: createApplicationDto.email,
        company: createApplicationDto.company,
        whyParticipate: createApplicationDto.whyParticipate,
      },
    });

    return {
      id: application.id,
      status: application.status,
      message: 'Aplicação submetida com sucesso! Aguarde aprovação.',
    };
  }

  async findAll(status?: ApplicationStatus) {
    const where = status ? { status } : {};

    return this.prisma.application.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        whyParticipate: true,
        status: true,
        createdAt: true,
        reviewedAt: true,
        rejectionReason: true,
      },
    });
  }

  async findOne(id: string) {
    const application = await this.prisma.application.findUnique({
      where: { id },
      include: {
        invitationToken: true,
        member: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Aplicação não encontrada');
    }

    return application;
  }

  async approve(id: string) {
    const application = await this.findOne(id);

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Apenas aplicações pendentes podem ser aprovadas',
      );
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.invitationExpirationDays);

    await this.prisma.$transaction([
      this.prisma.application.update({
        where: { id },
        data: {
          status: ApplicationStatus.APPROVED,
          reviewedAt: new Date(),
        },
      }),
      this.prisma.invitationToken.create({
        data: {
          applicationId: id,
          token,
          expiresAt,
        },
      }),
    ]);

    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/register/${token}`;

    return {
      token,
      inviteLink,
      expiresAt,
      message: 'Aplicação aprovada com sucesso!',
    };
  }

  async reject(id: string, reason?: string) {
    const application = await this.findOne(id);

    if (application.status !== ApplicationStatus.PENDING) {
      throw new BadRequestException(
        'Apenas aplicações pendentes podem ser rejeitadas',
      );
    }

    await this.prisma.application.update({
      where: { id },
      data: {
        status: ApplicationStatus.REJECTED,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });

    return {
      message: 'Aplicação rejeitada',
    };
  }

  private generateToken(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
  }
}
