import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApplicationStatus } from '@prisma/client';
import type { PrismaService } from '../prisma/prisma.service';
import { ApplicationsService } from './applications.service';

type ApplicationsPrismaMock = {
  prisma: PrismaService;
  mocks: {
    application: {
      findUnique: jest.Mock;
      create: jest.Mock;
      findMany: jest.Mock;
      update: jest.Mock;
    };
    indication: {
      count: jest.Mock;
    };
    invitationToken: {
      create: jest.Mock;
    };
    transaction: jest.Mock;
  };
};

const createMockPrisma = (): ApplicationsPrismaMock => {
  const applicationMocks = {
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  };

  const indicationMocks = {
    count: jest.fn(),
  };

  const invitationMocks = {
    create: jest.fn(),
  };

  const transactionMock = jest
    .fn()
    .mockImplementation((actions: Promise<unknown>[]) => Promise.all(actions));

  const prisma = {
    application: applicationMocks,
    indication: indicationMocks,
    invitationToken: invitationMocks,
    $transaction: transactionMock,
  } as unknown as PrismaService;

  return {
    prisma,
    mocks: {
      application: applicationMocks,
      indication: indicationMocks,
      invitationToken: invitationMocks,
      transaction: transactionMock,
    },
  };
};

describe('ApplicationsService', () => {
  const baseApplication = {
    id: 'app-1',
    fullName: 'John Doe',
    email: 'john@example.com',
    company: 'ACME',
    whyParticipate: 'Networking',
    status: ApplicationStatus.PENDING,
    createdAt: new Date(),
    reviewedAt: null,
    rejectionReason: null,
  };

  const approvedApplication = {
    ...baseApplication,
    status: ApplicationStatus.APPROVED,
    reviewedAt: new Date(),
  };

  const mockInvitation = {
    applicationId: baseApplication.id,
    token: 'token',
    expiresAt: new Date(),
  };

  let prisma: PrismaService;
  let mocks: ReturnType<typeof createMockPrisma>['mocks'];
  let service: ApplicationsService;

  beforeAll(() => {
    jest.useFakeTimers().setSystemTime(new Date('2025-01-15T12:00:00Z'));
    jest.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  afterAll(() => {
    jest.useRealTimers();
    (Math.random as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    const mock = createMockPrisma();
    prisma = mock.prisma;
    mocks = mock.mocks;
    service = new ApplicationsService(prisma);
  });

  describe('create', () => {
    it('should create application when email is unique', async () => {
      mocks.application.findUnique.mockResolvedValue(null);
      mocks.application.create.mockResolvedValue(baseApplication);

      await expect(
        service.create({
          fullName: baseApplication.fullName,
          email: baseApplication.email,
          company: baseApplication.company,
          whyParticipate: baseApplication.whyParticipate,
        }),
      ).resolves.toMatchObject({
        id: baseApplication.id,
        status: baseApplication.status,
      });

      expect(mocks.application.create).toHaveBeenCalledWith({
        data: {
          fullName: baseApplication.fullName,
          email: baseApplication.email,
          company: baseApplication.company,
          whyParticipate: baseApplication.whyParticipate,
        },
      });
    });

    it('should throw when email already exists', async () => {
      mocks.application.findUnique.mockResolvedValue(baseApplication);

      await expect(
        service.create({
          fullName: baseApplication.fullName,
          email: baseApplication.email,
          company: baseApplication.company,
          whyParticipate: baseApplication.whyParticipate,
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should forward status filter', async () => {
      mocks.application.findMany.mockResolvedValue([baseApplication]);

      await service.findAll(ApplicationStatus.APPROVED);

      expect(mocks.application.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: ApplicationStatus.APPROVED },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return application when found', async () => {
      mocks.application.findUnique.mockResolvedValue({
        ...baseApplication,
        invitationToken: mockInvitation,
        member: null,
      });

      await expect(service.findOne(baseApplication.id)).resolves.toMatchObject({
        id: baseApplication.id,
      });
    });

    it('should throw NotFoundException when missing', async () => {
      mocks.application.findUnique.mockResolvedValue(null);

      await expect(service.findOne(baseApplication.id)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('approve', () => {
    beforeEach(() => {
      mocks.application.findUnique.mockResolvedValue({
        ...baseApplication,
        invitationToken: null,
        member: null,
      });
      mocks.application.update.mockResolvedValue(approvedApplication);
      mocks.invitationToken.create.mockResolvedValue(mockInvitation);
    });

    it('should update application and create invitation token', async () => {
      await expect(service.approve(baseApplication.id)).resolves.toMatchObject({
        message: 'Aplicação aprovada com sucesso!',
      });
      expect(mocks.transaction).toHaveBeenCalled();
      expect(mocks.invitationToken.create).toHaveBeenCalled();
      const [payload] = (mocks.invitationToken.create.mock.calls.at(-1) ??
        []) as Array<{ data: { applicationId: string } }>;
      expect(payload.data.applicationId).toBe(baseApplication.id);
    });

    it('should reject non pending applications', async () => {
      mocks.application.findUnique.mockResolvedValue(approvedApplication);

      await expect(service.approve(baseApplication.id)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('reject', () => {
    it('should reject applications with reason', async () => {
      mocks.application.findUnique.mockResolvedValue({
        ...baseApplication,
        invitationToken: null,
        member: null,
      });
      mocks.application.update.mockResolvedValue({
        ...baseApplication,
        status: ApplicationStatus.REJECTED,
        reviewedAt: new Date(),
        rejectionReason: 'Porque sim',
      });

      await expect(
        service.reject(baseApplication.id, 'Porque sim'),
      ).resolves.toEqual(
        expect.objectContaining({
          message: 'Aplicação rejeitada',
        }),
      );

      expect(mocks.application.update).toHaveBeenCalled();
      const [updatePayload] = (mocks.application.update.mock.calls.at(-1) ??
        []) as Array<{
        where: { id: string };
        data: { status: ApplicationStatus; rejectionReason: string | null };
      }>;
      expect(updatePayload.where.id).toBe(baseApplication.id);
      expect(updatePayload.data.status).toBe(ApplicationStatus.REJECTED);
      expect(updatePayload.data.rejectionReason).toBe('Porque sim');
    });

    it('should throw when application not pending', async () => {
      mocks.application.findUnique.mockResolvedValue(approvedApplication);

      await expect(service.reject(baseApplication.id)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });
});
