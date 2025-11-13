import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { AdminAuthService } from './admin-auth.service';

describe('AdminAuthService', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      ADMIN_KEY: 'super-secret-key',
      ADMIN_JWT_SECRET: 'jwt-secret',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should login with valid key and return token', () => {
    const service = new AdminAuthService();

    const result = service.login('super-secret-key');

    expect(result.token).toEqual(expect.any(String));
    expect(result.expiresIn).toBeGreaterThan(0);

    const payload = jwt.verify(result.token, 'jwt-secret');
    expect(payload).toMatchObject({ sub: 'admin', type: 'admin' });
  });

  it('should throw on invalid key', () => {
    const service = new AdminAuthService();

    expect(() => service.login('wrong')).toThrow(UnauthorizedException);
  });

  it('should verify token and reject invalid tokens', () => {
    const service = new AdminAuthService();
    const { token } = service.login('super-secret-key');

    expect(service.verifyToken(token)).toMatchObject({
      sub: 'admin',
      type: 'admin',
    });

    expect(() => service.verifyToken('invalid')).toThrow();
  });
});
