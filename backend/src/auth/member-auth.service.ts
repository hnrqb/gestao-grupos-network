import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { createHmac, randomBytes } from 'crypto';

interface MemberPayload {
  sub: string;
  email: string;
  type: 'member';
}

@Injectable()
export class MemberAuthService {
  private readonly jwtSecret = process.env.MEMBER_JWT_SECRET;
  private readonly secretSalt =
    process.env.MEMBER_SECRET_SALT || 'member-secret-salt';

  constructor(private readonly prisma: PrismaService) {
    if (!this.jwtSecret) {
      throw new Error('MEMBER_JWT_SECRET is not defined in environment variables');
    }
  }

  generateSecret(): string {
    return randomBytes(16).toString('hex');
  }

  hashSecret(secret: string): string {
    return createHmac('sha256', this.secretSalt).update(secret).digest('hex');
  }

  generateToken(member: { id: string; email: string }) {
    const payload: MemberPayload = {
      sub: member.id,
      email: member.email,
      type: 'member',
    };

    const token = jwt.sign(payload, this.jwtSecret!, {
      expiresIn: '7d',
    });

    return token;
  }

  async validateToken(token: string) {
    try {
      const payload = jwt.verify(token, this.jwtSecret!) as MemberPayload;

      if (payload.type !== 'member') {
        throw new UnauthorizedException('Token inválido');
      }

      const member = await this.prisma.member.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          fullName: true,
          email: true,
          company: true,
        },
      });

      if (!member) {
        throw new UnauthorizedException('Membro não encontrado');
      }

      return member;
    } catch (error) {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }

  async login(email: string, secret: string) {
    const member = await this.prisma.member.findUnique({
      where: { email },
      select: {
        id: true,
        fullName: true,
        email: true,
        company: true,
        authSecretHash: true,
      },
    });

    if (!member || !member.authSecretHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const secretHash = this.hashSecret(secret);
    if (secretHash !== member.authSecretHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const token = this.generateToken(member);

    return {
      token,
      member: {
        id: member.id,
        fullName: member.fullName,
        email: member.email,
        company: member.company,
      },
    };
  }
}


