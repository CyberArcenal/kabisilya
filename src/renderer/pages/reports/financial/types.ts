// src/renderer/pages/analytics/financial/types.ts
export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface KPI {
  title: string;
  value: number | string;
  change?: number;
  icon: React.ReactNode;
  color: string;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  payments: number;
}

export interface TopPayer {
  workerId: number;
  workerName: string;
  totalNet: number;
  paymentCount: number;
}

export interface OverdueDebt {
  id: number;
  workerName: string;
  amount: number;
  balance: number;
  daysOverdue: number;
  status: string;
}