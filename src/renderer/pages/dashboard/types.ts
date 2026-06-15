// src/renderer/pages/dashboard/types.ts
import type { AuditLogEntry } from "../../api/core/audit";
import type { Session } from "../../api/core/session";

export interface DashboardData {
  totalWorkers: number;
  activeAssignments: number;
  completedAssignments: number;
  totalPaymentsMonth: number;
  outstandingDebts: number;
  currentSession: Session | null;
  assignmentsPerMonth: Array<{ month: string; assignments: number }>;
  paymentsVsDebts: Array<{ month: string; payments: number; debts: number }>;
  recentActivities: AuditLogEntry[];
  topWorkers: Array<{ name: string; totalLuwang: number }>;
  upcomingDebts: Array<{
    id: number;
    worker: string;
    amount: number;
    dueDays: number;
  }>;
}
