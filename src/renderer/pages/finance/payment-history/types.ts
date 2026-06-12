// src/renderer/pages/finance/payment-history/types.ts

import type { PaymentHistory } from "../../../api/core/payment_history";

export interface PaymentHistoryWithDetails extends PaymentHistory {
  // Additional fields if needed
}

export interface PaymentHistoryFilters {
  paymentId?: number;
  actionType?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}