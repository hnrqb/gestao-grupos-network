import { Controller, Get, UseGuards } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import type { PerformanceDashboard } from './dashboard.service';
import { AdminGuard } from '../common/guards/admin.guard';

@Controller({ path: 'admin/dashboard', version: '1' })
@UseGuards(AdminGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getPerformanceDashboard(): Promise<PerformanceDashboard> {
    return this.dashboardService.getPerformanceMetrics();
  }
}
