import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DashboardMetric {
  value: number;
  isMock: boolean;
}

export interface PerformanceDashboard {
  activeMembers: DashboardMetric;
  indicationsThisMonth: DashboardMetric;
  thankYousThisMonth: DashboardMetric;
  generatedAt: string;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPerformanceMetrics(): Promise<PerformanceDashboard> {
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

    const [activeMembers, indicationsThisMonth] = await Promise.all([
      this.prisma.member.count(),
      this.prisma.indication.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
    ]);

    // Ainda não há recurso de "obrigados" na plataforma.
    // Mantemos um valor mockado enquanto a funcionalidade não é implementada.
    const thankYousThisMonth = 0;

    return {
      activeMembers: {
        value: activeMembers,
        isMock: false,
      },
      indicationsThisMonth: {
        value: indicationsThisMonth,
        isMock: false,
      },
      thankYousThisMonth: {
        value: thankYousThisMonth,
        isMock: true,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}


