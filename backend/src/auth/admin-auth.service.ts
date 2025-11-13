import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';

interface AdminJwtPayload {
  sub: 'admin';
  type: 'admin';
}

export interface AdminAuthResponse {
  token: string;
  expiresIn: number;
}

@Injectable()
export class AdminAuthService {
  private readonly adminKey = process.env.ADMIN_KEY;
  private readonly jwtSecret = process.env.ADMIN_JWT_SECRET;
  private readonly defaultExpiresIn = '12h';

  constructor() {
    if (!this.adminKey) {
      throw new Error('ADMIN_KEY is not defined in environment variables');
    }

    if (!this.jwtSecret) {
      throw new Error(
        'ADMIN_JWT_SECRET is not defined in environment variables',
      );
    }
  }

  login(providedKey: string): AdminAuthResponse {
    if (!providedKey || providedKey !== this.adminKey) {
      throw new UnauthorizedException('Chave administrativa inválida');
    }

    const payload: AdminJwtPayload = {
      sub: 'admin',
      type: 'admin',
    };

    const token = jwt.sign(payload, this.jwtSecret!, {
      expiresIn: this.defaultExpiresIn,
    });

    return {
      token,
      expiresIn: this.parseExpiresIn(this.defaultExpiresIn),
    };
  }

  verifyToken(token: string): AdminJwtPayload {
    const payload = jwt.verify(token, this.jwtSecret!) as AdminJwtPayload;

    if (payload.type !== 'admin') {
      throw new UnauthorizedException('Token inválido para administrador');
    }

    return payload;
  }

  private parseExpiresIn(expiresIn: string | number): number {
    if (typeof expiresIn === 'number') {
      return expiresIn;
    }

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 12 * 60 * 60;
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 60 * 60;
      case 'd':
        return value * 24 * 60 * 60;
      default:
        return 12 * 60 * 60;
    }
  }
}
