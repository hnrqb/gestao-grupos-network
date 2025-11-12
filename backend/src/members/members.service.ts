import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InvitationsService } from '../invitations/invitations.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { MemberAuthService } from '../auth/member-auth.service';

@Injectable()
export class MembersService {
  constructor(
    private prisma: PrismaService,
    private invitationsService: InvitationsService,
    private memberAuthService: MemberAuthService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
    // Validate token
    const { application } = await this.invitationsService.validateToken(
      createMemberDto.token,
    );

    // Check if member already exists for this application
    const existingMember = await this.prisma.member.findUnique({
      where: { applicationId: application.id },
    });

    if (existingMember) {
      throw new BadRequestException('Cadastro já realizado para esta aplicação');
    }

    // Create member
    const authSecret = this.memberAuthService.generateSecret();
    const authSecretHash = this.memberAuthService.hashSecret(authSecret);

    const member = await this.prisma.member.create({
      data: {
        applicationId: application.id,
        fullName: application.fullName,
        email: application.email,
        company: application.company,
        phone: createMemberDto.phone,
        position: createMemberDto.position,
        companyDescription: createMemberDto.companyDescription,
        linkedinUrl: createMemberDto.linkedinUrl,
        authSecretHash,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
      },
    });

    // Mark token as used
    await this.invitationsService.markAsUsed(createMemberDto.token);

    const token = this.memberAuthService.generateToken(member);

    return {
      message: 'Cadastro realizado com sucesso!',
      member,
      token,
      authSecret,
    };
  }

  async findAll() {
    return this.prisma.member.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        position: true,
        phone: true,
        linkedinUrl: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async findOne(id: string) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      include: {
        application: true,
      },
    });

    if (!member) {
      throw new NotFoundException('Membro não encontrado');
    }

    return member;
  }

  async getDirectory() {
    return this.prisma.member.findMany({
      orderBy: { fullName: 'asc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
      },
    });
  }
}
