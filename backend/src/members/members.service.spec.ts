import { BadRequestException, NotFoundException } from '@nestjs/common';
import type { InvitationsService } from '../invitations/invitations.service';
import type { MemberAuthService } from '../auth/member-auth.service';
import type { PrismaService } from '../prisma/prisma.service';
import { MembersService } from './members.service';

type MembersPrismaMock = {
  prisma: PrismaService;
  mocks: {
    member: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
    };
  };
};

const createMockPrisma = (): MembersPrismaMock => {
  const memberMocks = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  };

  const prisma = {
    member: memberMocks,
  } as unknown as PrismaService;

  return { prisma, mocks: { member: memberMocks } };
};

const mockApplication = {
  id: 'app-1',
  fullName: 'Jane Doe',
  email: 'jane@example.com',
  company: 'Company',
};

describe('MembersService', () => {
  let prisma: PrismaService;
  let prismaMocks: ReturnType<typeof createMockPrisma>['mocks'];
  let service: MembersService;
  let invitationsService: jest.Mocked<
    Pick<InvitationsService, 'validateToken' | 'markAsUsed'>
  >;
  let memberAuthService: jest.Mocked<
    Pick<MemberAuthService, 'generateSecret' | 'hashSecret' | 'generateToken'>
  >;

  beforeEach(() => {
    const mock = createMockPrisma();
    prisma = mock.prisma;
    prismaMocks = mock.mocks;
    invitationsService = {
      validateToken: jest.fn(),
      markAsUsed: jest.fn(),
    };
    memberAuthService = {
      generateSecret: jest.fn(),
      hashSecret: jest.fn(),
      generateToken: jest.fn(),
    };
    service = new MembersService(
      prisma,
      invitationsService as unknown as InvitationsService,
      memberAuthService as unknown as MemberAuthService,
    );

    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create member with generated secret', async () => {
      invitationsService.validateToken.mockResolvedValue({
        application: mockApplication,
      });
      prismaMocks.member.findUnique.mockResolvedValue(null);
      memberAuthService.generateSecret.mockReturnValue('secret');
      memberAuthService.hashSecret.mockReturnValue('hash');
      prismaMocks.member.create.mockResolvedValue({
        id: 'member-1',
        fullName: mockApplication.fullName,
        email: mockApplication.email,
        company: mockApplication.company,
      });
      memberAuthService.generateToken.mockReturnValue('jwt-token');

      await expect(
        service.create({
          token: 'invite-token',
          phone: '123',
        }),
      ).resolves.toMatchObject({
        token: 'jwt-token',
        authSecret: 'secret',
      });

      expect(invitationsService.validateToken).toHaveBeenCalledWith(
        'invite-token',
      );
      expect(prismaMocks.member.create).toHaveBeenCalled();
      const [createArgs] = (prismaMocks.member.create.mock.calls.at(-1) ??
        []) as Array<{
        data: { applicationId: string; authSecretHash: string };
      }>;
      expect(createArgs.data.applicationId).toBe(mockApplication.id);
      expect(createArgs.data.authSecretHash).toBe('hash');
      expect(invitationsService.markAsUsed).toHaveBeenCalledWith(
        'invite-token',
      );
    });

    it('should throw when member already exists for application', async () => {
      invitationsService.validateToken.mockResolvedValue({
        application: mockApplication,
      });
      prismaMocks.member.findUnique.mockResolvedValue({ id: 'member-1' });

      await expect(
        service.create({ token: 'invite-token' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return members ordered by createdAt desc', async () => {
      prismaMocks.member.findMany.mockResolvedValue([{ id: 'member-1' }]);

      await service.findAll();

      expect(prismaMocks.member.findMany).toHaveBeenCalled();
      const [findAllArgs] = (prismaMocks.member.findMany.mock.calls.at(-1) ??
        []) as Array<{ orderBy: { createdAt: 'desc' } }>;
      expect(findAllArgs.orderBy).toEqual({ createdAt: 'desc' });
    });
  });

  describe('findOne', () => {
    it('should throw when member not found', async () => {
      prismaMocks.member.findUnique.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('getDirectory', () => {
    it('should list directory ordered by name', async () => {
      prismaMocks.member.findMany.mockResolvedValue([]);

      await service.getDirectory();

      expect(prismaMocks.member.findMany).toHaveBeenCalled();
      const [directoryArgs] = (prismaMocks.member.findMany.mock.calls.at(-1) ??
        []) as Array<{ orderBy: { fullName: 'asc' } }>;
      expect(directoryArgs.orderBy).toEqual({ fullName: 'asc' });
    });
  });
});
