// src/renderer/pages/finance/debts/types.ts

import type { Debt } from "../../../api/core/debt";

export interface DebtWithDetails extends Debt {
  // Additional fields if needed
}

export interface DebtFormData {
  workerId: number;
  sessionId: number;
  amount: number;
  dueDate?: string;
  interestRate?: number;
  reason?: string;
  status?: string;
}