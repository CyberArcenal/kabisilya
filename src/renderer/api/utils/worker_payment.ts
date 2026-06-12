// src/renderer/api/utils/workerPaymentAPI.ts
// @ts-check
// src/renderer/api/workerPaymentAPI.ts
// @ts-check
import type { Debt } from "../core/debt";
import type { DebtHistory } from "../core/debt_history";
import type { Payment } from "../core/payment";
import type { PaymentHistory } from "../core/payment_history";
import type { Worker } from "../core/worker";

// ----------------------------------------------------------------------
// 📦 Types (aligned with backend response)
// ----------------------------------------------------------------------

export interface WorkerWithStats extends Worker {
  pendingAmount: number; // sum of netPay of pending/partially paid payments
  totalDebt: number; // sum of debt balances
  lastPaymentDate: string | null;
}

export interface WorkerPaymentsResponse {
  status: boolean;
  message: string;
  data: WorkerWithStats[];
}

export interface PayAllParams {
  workerId: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PayAllResponse {
  status: boolean;
  message: string;
  data: Payment[]; // updated payments
}

export interface PayDebtParams {
  workerId: number;
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PayDebtResponse {
  status: boolean;
  message: string;
  data: {
    payments: Payment[]; // updated payments (with new netPay, totalDebtDeduction, possibly status)
    debts: Debt[]; // updated debts (with new balances, status)
    histories: DebtHistory[]; // debt history entries
    paymentHistories: PaymentHistory;
  };
   unappliedAmount: number | null;
}

// ----------------------------------------------------------------------
// 🧠 WorkerPaymentAPI Class
// ----------------------------------------------------------------------

class WorkerPaymentAPI {
  private channel = "workerPayment";

  private async call<T = any>(
    method: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    if (!window.backendAPI?.workerPayment) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.workerPayment({ method, params });
  }

  // 🔎 READ

  /**
   * Get all workers with computed payment and debt stats
   */
  async getAll(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
  }): Promise<WorkerPaymentsResponse> {
    try {
      const response = await this.call<WorkerPaymentsResponse>(
        "getAllWorkerPayments",
        params || {},
      );
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch worker payments");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch worker payments");
    }
  }

  // ✏️ WRITE

  /**
   * Pay all pending payments for a worker in a session
   */
  async payAll(params: PayAllParams): Promise<PayAllResponse> {
    try {
      const response = await this.call<PayAllResponse>("payAll", params);
      if (response.status) return response;
      throw new Error(response.message || "Failed to process payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to process payment");
    }
  }

  /**
   * Pay against a worker's total debt in a session.
   * The amount is distributed across outstanding debts (oldest first).
   */
  async payDebt(params: PayDebtParams): Promise<PayDebtResponse> {
    try {
      const response = await this.call<PayDebtResponse>("payDebt", params);
      if (response.status) return response;
      throw new Error(response.message || "Failed to pay debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to pay debt");
    }
  }
}

const workerPaymentAPI = new WorkerPaymentAPI();
export default workerPaymentAPI;
