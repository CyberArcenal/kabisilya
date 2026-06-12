// src/renderer/pages/finance/worker-payments/types.ts

import type { Payment } from "../../../api/core/payment";

export interface PaymentWithDetails extends Payment {
  // Additional fields if needed
}

export interface PaymentFormData {
  workerId: number;
  pitakId: number;
  sessionId: number;
  assignmentId?: number | null;
  amount: number;        // gross pay
  manualDeduction?: number;
  netPay?: number;       // auto-calculated
  paymentDate?: string;
  notes?: string;
  status?: string;
}