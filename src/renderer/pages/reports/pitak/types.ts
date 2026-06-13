// src/renderer/pages/analytics/pitak/types.ts
export interface PitakProductivityData {
  summary: {
    totalPitaks: number;
    activePitaks: number;
    harvestedPitaks: number;
    totalCompletedLuwang: number;
    averageCompletionRate: number;
    averageUtilization: number;
  };
  pitaks: Array<{
    pitakId: number;
    location: string;
    status: string;
    totalLuwang: number;
    bukidName: string;
    metrics: {
      completedLuwang: number;
      activeLuwang: number;
      totalAssignments: number;
      completionRate: number;
      averageLuwangPerAssignment: number;
      utilization: number;
    };
  }>;
  financial: {
    totalPayments: number;
    totalGrossPay: number;
    totalNetPay: number;
    totalDeductions: number;
    avgGrossPay: number;
    avgNetPay: number;
    deductionRate: number;
  };
  topPerformers: Array<{
    pitakId: number;
    location: string;
    completionRate: number;
    utilization: number;
    score: number;
  }>;
}