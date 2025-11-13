import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

describe('DashboardController', () => {
  const service = {
    getPerformanceMetrics: jest.fn(),
  } as unknown as DashboardService;

  const controller = new DashboardController(service);

  it('should delegate to service', async () => {
    (service.getPerformanceMetrics as jest.Mock).mockResolvedValue({
      activeMembers: { value: 1, isMock: false },
      indicationsThisMonth: { value: 2, isMock: false },
      thankYousThisMonth: { value: 0, isMock: true },
      generatedAt: new Date().toISOString(),
    });

    await expect(controller.getPerformanceDashboard()).resolves.toEqual(
      expect.objectContaining({
        activeMembers: { value: 1, isMock: false },
      }),
    );
  });
});
