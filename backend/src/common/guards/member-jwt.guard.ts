import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { MemberAuthService } from '../../auth/member-auth.service';

@Injectable()
export class MemberJwtGuard implements CanActivate {
  constructor(private readonly memberAuthService: MemberAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Token não informado');
    }

    const [scheme, token] = authHeader.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Formato de token inválido');
    }

    const member = await this.memberAuthService.validateToken(token);
    request.member = member;
    request.memberToken = token;

    return true;
  }
}
