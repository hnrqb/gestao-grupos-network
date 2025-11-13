import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaService } from '../prisma/prisma.service';
import { IndicationsService } from './indications.service';

interface IndicationsPrismaMock {
  prisma: PrismaService;
  memberFindUnique: jest.Mock;
  indicationCreate: jest.Mock;
  indicationFindMany: jest.Mock;
  indicationFindUnique: jest.Mock;
  indicationUpdate: jest.Mock;
}

const createMockPrisma = (): IndicationsPrismaMock => {
  const memberFindUnique = jest.fn();
  const indicationCreate = jest.fn();
  const indicationFindMany = jest.fn();
  const indicationFindUnique = jest.fn();
  const indicationUpdate = jest.fn();

  const prisma = {
    member: {
      findUnique: memberFindUnique,
    },
    indication: {
      create: indicationCreate,
      findMany: indicationFindMany,
      findUnique: indicationFindUnique,
      update: indicationUpdate,
    },
  } as unknown as PrismaService;

  return {
    prisma,
    memberFindUnique,
    indicationCreate,
    indicationFindMany,
    indicationFindUnique,
    indicationUpdate,
  };
};

const baseIndication = {
  id: 'ind-1',
  fromMemberId: 'member-1',
  toMemberId: 'member-2',
  contactInfo: 'Contact',
  description: 'Desc',
  status: 'NEW',
  createdAt: new Date(),
  updatedAt: new Date(),
  fromMember: {
    id: 'member-1',
    fullName: 'From',
    email: 'from@example.com',
    company: 'From Co',
  },
  toMember: {
    id: 'member-2',
    fullName: 'To',
    email: 'to@example.com',
    company: 'To Co',
  },
};

describe('IndicationsService', () => {
  let prisma: IndicationsPrismaMock;
  let service: IndicationsService;

  beforeEach(() => {
    prisma = createMockPrisma();
    service = new IndicationsService(prisma.prisma);
  });

  describe('create', () => {
    it('should throw when indicating self', async () => {
      await expect(
        service.create('member-1', {
          targetMemberId: 'member-1',
          contactInfo: 'info',
          description: 'desc',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should create indication and trim data', async () => {
      prisma.memberFindUnique.mockResolvedValue({ id: 'member-2' });
      prisma.indicationCreate.mockResolvedValue({
        ...baseIndication,
        contactInfo: 'info',
        description: 'desc',
      });

      await expect(
        service.create('member-1', {
          targetMemberId: 'member-2',
          contactInfo: ' info ',
          description: ' desc ',
        }),
      ).resolves.toMatchObject({
        id: baseIndication.id,
        contactInfo: 'info',
        description: 'desc',
      });
    });
  });

  describe('findForMember', () => {
    it('should return created and received lists', async () => {
      prisma.indicationFindMany
        .mockResolvedValueOnce([baseIndication])
        .mockResolvedValueOnce([{ ...baseIndication, id: 'ind-2' }]);

      const result = await service.findForMember('member-1');

      expect(result.created).toHaveLength(1);
      expect(result.received).toHaveLength(1);
    });
  });

  describe('updateStatus', () => {
    it('should throw when indication does not exist', async () => {
      prisma.indicationFindUnique.mockResolvedValue(null);

      await expect(
        service.updateStatus('member-1', 'ind-1', { status: 'CLOSED' }),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should forbid when member is not recipient', async () => {
      prisma.indicationFindUnique.mockResolvedValue(baseIndication);

      await expect(
        service.updateStatus('stranger', 'ind-1', { status: 'CLOSED' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should allow recipient to update status', async () => {
      prisma.indicationFindUnique.mockResolvedValue(baseIndication);
      prisma.indicationUpdate.mockResolvedValue({
        ...baseIndication,
        status: 'CLOSED',
      });

      await expect(
        service.updateStatus(baseIndication.toMemberId, 'ind-1', {
          status: 'CLOSED',
        }),
      ).resolves.toMatchObject({ status: 'CLOSED' });
    });
  });
});
