import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIndicationDto } from './dto/create-indication.dto';
import { UpdateIndicationStatusDto } from './dto/update-indication-status.dto';

const memberSelect = {
  id: true,
  fullName: true,
  email: true,
  company: true,
};

@Injectable()
export class IndicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(memberId: string, dto: CreateIndicationDto) {
    if (memberId === dto.targetMemberId) {
      throw new BadRequestException('Não é possível indicar a si mesmo');
    }

    const targetMember = await this.prisma.member.findUnique({
      where: { id: dto.targetMemberId },
      select: { id: true },
    });

    if (!targetMember) {
      throw new NotFoundException('Membro indicado não encontrado');
    }

    const indication = await this.prisma.indication.create({
      data: {
        fromMemberId: memberId,
        toMemberId: dto.targetMemberId,
        contactInfo: dto.contactInfo.trim(),
        description: dto.description.trim(),
      },
      include: {
        fromMember: { select: memberSelect },
        toMember: { select: memberSelect },
      },
    });

    return this.toResponse(indication);
  }

  async findForMember(memberId: string) {
    const [created, received] = await Promise.all([
      this.prisma.indication.findMany({
        where: { fromMemberId: memberId },
        orderBy: { createdAt: 'desc' },
        include: {
          fromMember: { select: memberSelect },
          toMember: { select: memberSelect },
        },
      }),
      this.prisma.indication.findMany({
        where: { toMemberId: memberId },
        orderBy: { createdAt: 'desc' },
        include: {
          fromMember: { select: memberSelect },
          toMember: { select: memberSelect },
        },
      }),
    ]);

    return {
      created: created.map((item) => this.toResponse(item)),
      received: received.map((item) => this.toResponse(item)),
    };
  }

  async updateStatus(
    memberId: string,
    indicationId: string,
    dto: UpdateIndicationStatusDto,
  ) {
    const indication = await this.prisma.indication.findUnique({
      where: { id: indicationId },
      include: {
        fromMember: { select: memberSelect },
        toMember: { select: memberSelect },
      },
    });

    if (!indication) {
      throw new NotFoundException('Indicação não encontrada');
    }

    if (
      indication.fromMemberId !== memberId &&
      indication.toMemberId !== memberId
    ) {
      throw new ForbiddenException('Você não tem acesso a esta indicação');
    }

    const updated = await this.prisma.indication.update({
      where: { id: indicationId },
      data: {
        status: dto.status,
      },
      include: {
        fromMember: { select: memberSelect },
        toMember: { select: memberSelect },
      },
    });

    return this.toResponse(updated);
  }

  private toResponse(indication: any) {
    return {
      id: indication.id,
      contactInfo: indication.contactInfo,
      description: indication.description,
      status: indication.status,
      createdAt: indication.createdAt,
      updatedAt: indication.updatedAt,
      fromMember: indication.fromMember,
      toMember: indication.toMember,
    };
  }
}


