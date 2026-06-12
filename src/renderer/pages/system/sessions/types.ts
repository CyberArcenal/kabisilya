// src/renderer/pages/system/sessions/types.ts

import type { Session } from "../../../api/core/session";

export interface SessionWithDetails extends Session {
  // Extra fields for stats
  totalBukids?: number;
  totalAssignments?: number;
  totalPayments?: number;
  totalDebts?: number;
}

export interface SessionFormData {
  name: string;
  year: number;
  startDate: string;
  endDate?: string;
  seasonType?: string;
  status: string;
  notes?: string;
}