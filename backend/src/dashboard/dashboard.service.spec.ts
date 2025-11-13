import type { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';

const createMockPrisma = () => {
  const mocks = {
    memberCount: jest.fn(),
    indicationCount: jest.fn(),
  };

  const prisma = {
    member: {
      count: mocks.memberCount,
    },
    indication: {
      count: mocks.indicationCount,
    },
  } as unknown as PrismaService;

  return { prisma, mocks };
};

describe('DashboardService', () => {
  let prisma: PrismaService;
  let mocks: ReturnType<typeof createMockPrisma>['mocks'];
  let service: DashboardService;

  beforeEach(() => {
    const mock = createMockPrisma();
    prisma = mock.prisma;
    mocks = mock.mocks;
    service = new DashboardService(prisma);
    jest.useFakeTimers().setSystemTime(new Date('2025-02-10T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should calculate metrics with current month filter', async () => {
    mocks.memberCount.mockResolvedValue(42);
    mocks.indicationCount.mockResolvedValue(7);

    const result = await service.getPerformanceMetrics();

    expect(mocks.memberCount).toHaveBeenCalled();
    expect(mocks.indicationCount).toHaveBeenCalledWith({
      where: {
        createdAt: {
          gte: new Date(Date.UTC(2025, 1, 1)),
        },
      },
    });
    expect(result).toMatchObject({
      activeMembers: { value: 42, isMock: false },
      indicationsThisMonth: { value: 7, isMock: false },
      thankYousThisMonth: { value: 0, isMock: true },
    });
    expect(new Date(result.generatedAt).toISOString()).toEqual(
      result.generatedAt,
    );
  });
});
