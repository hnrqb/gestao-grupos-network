import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const memberId =
      request.headers['x-member-id'] || request.headers['X-Member-Id'];

    if (!memberId || typeof memberId !== 'string') {
      throw new UnauthorizedException('Membro não autenticado');
    }

    const member = await this.prisma.member.findUnique({
      where: { id: memberId },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
      },
    });

    if (!member) {
      throw new UnauthorizedException('Membro não encontrado ou inválido');
    }

    request.member = member;
    return true;
  }
}


