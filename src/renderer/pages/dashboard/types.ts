// src/renderer/pages/dashboard/types.ts
import type { AuditLogEntry } from "../../api/core/audit";

export interface DashboardData {
  totalWorkers: number;
  activeAssignments: number;
  completedAssignments: number;
  totalPaymentsMonth: number;
  outstandingDebts: number;
  currentSession: {
    id: number;
    name: string;
    year: number;
    status: string;
  } | null;
  assignmentsPerMonth: Array<{
    month: string;
    assignments: number;
  }>;
  paymentsVsDebts: Array<{
    month: string;
    payments: number;
    debts: number;
  }>;
  recentActivities: AuditLogEntry[];
}