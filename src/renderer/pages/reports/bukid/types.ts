// src/renderer/pages/reports/bukid/types.ts
export interface KPI {
  title: string;
  value: number | string;
  change?: number; // percentage change from previous period
  icon: React.ReactNode;
  color: string;
}

export interface ProductionDataPoint {
  month: string;
  totalLuwang: number;
  assignmentCount: number;
}

export interface PitakSummary {
  id: number;
  location: string;
  totalLuwang: number;
  completedLuwang: number;
  completionRate: number;
  totalAssignments: number;
  totalPayments: number;
}