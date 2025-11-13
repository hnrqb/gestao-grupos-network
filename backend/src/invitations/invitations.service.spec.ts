import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { InvitationsService } from './invitations.service';

type InvitationsPrismaMock = {
  prisma: PrismaService;
  mocks: {
    invitationFindUnique: jest.Mock;
    invitationUpdate: jest.Mock;
  };
};

const createMockPrisma = (): InvitationsPrismaMock => {
  const mocks = {
    invitationFindUnique: jest.fn(),
    invitationUpdate: jest.fn(),
  };

  const prisma = {
    invitationToken: {
      findUnique: mocks.invitationFindUnique,
      update: mocks.invitationUpdate,
    },
  } as unknown as PrismaService;

  return { prisma, mocks };
};

describe('InvitationsService', () => {
  let prisma: PrismaService;
  let mocks: ReturnType<typeof createMockPrisma>['mocks'];
  let service: InvitationsService;

  beforeEach(() => {
    const mock = createMockPrisma();
    prisma = mock.prisma;
    mocks = mock.mocks;
    service = new InvitationsService(prisma);
    jest.useFakeTimers().setSystemTime(new Date('2025-01-01T00:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should return application info when token is valid', async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      token: 'valid',
      used: false,
      expiresAt: new Date('2025-01-10T00:00:00Z'),
      application: {
        id: 'app-1',
        fullName: 'Applicant',
        email: 'test@example.com',
        company: 'Company',
      },
    });

    await expect(service.validateToken('valid')).resolves.toEqual({
      valid: true,
      application: {
        id: 'app-1',
        fullName: 'Applicant',
        email: 'test@example.com',
        company: 'Company',
      },
    });
  });

  it('should throw when token not found', async () => {
    mocks.invitationFindUnique.mockResolvedValue(null);

    await expect(service.validateToken('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('should throw when token already used', async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      used: true,
      expiresAt: new Date('2025-01-10T00:00:00Z'),
      application: {},
    });

    await expect(service.validateToken('used')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should throw when token expired', async () => {
    mocks.invitationFindUnique.mockResolvedValue({
      used: false,
      expiresAt: new Date('2024-12-31T00:00:00Z'),
      application: {},
    });

    await expect(service.validateToken('expired')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('should mark token as used', async () => {
    await service.markAsUsed('token');
    expect(mocks.invitationUpdate).toHaveBeenCalledWith({
      where: { token: 'token' },
      data: { used: true },
    });
  });
});
