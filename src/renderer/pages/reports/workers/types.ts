// src/renderer/pages/analytics/workers/types.ts
export interface WorkersOverview {
  summary: {
    total: number;
    active: number;
    inactive: number;
    onLeave: number;
    activePercentage: number;
  };
  financial: {
    totalDebt: number;
    averageDebt: number;
    topDebtors: Array<{
      id: number;
      name: string;
      totalDebt: number;
      currentBalance: number;
    }>;
  };
  assignments: {
    active: number;
    averagePerWorker: number;
  };
}

export interface TopPerformer {
  workerId: number;
  workerName: string;
  metric: string;
  value: number;
  secondaryValue: number;
  secondaryLabel: string;
}

export interface WorkerPerformanceRow {
  workerId: number;
  workerName: string;
  assignmentsCompleted: number;
  totalLuwang: number;
  totalGrossPay: number;
  totalNetPay: number;
  paymentCount: number;
  productivityScore: number;
}