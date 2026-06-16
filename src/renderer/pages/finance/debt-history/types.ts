// src/renderer/pages/finance/debt-history/types.ts
import type { DebtHistory } from "../../../api/core/debt_history";

export interface DebtHistoryWithDetails extends DebtHistory {
  // additional fields if needed – wala nang payment
}

export interface DebtHistoryFilters {
  debtId?: number;
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  limit?: number;
}