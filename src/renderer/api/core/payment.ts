// src/renderer/api/core/paymentAPI.ts
// Fixed pagination: backend returns { data, pagination } -> frontend expects { items, pagination }

import type { Assignment } from "./assignment";
import type { Debt } from "./debt";
import type { PaymentHistory } from "./payment_history";
import type { Pitak } from "./pitak";
import type { Session } from "./session";
import type { Worker } from "./worker";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

export interface Payment {
  id: number;
  grossPay: number;
  manualDeduction?: number | null;
  netPay: number;
  status: "pending" | "partially_paid" | "completed" | "cancelled";
  paymentDate?: string | null;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  periodStart?: string | null;
  periodEnd?: string | null;
  totalDebtDeduction: number;
  otherDeductions: number;
  deductionBreakdown?: any | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  idempotencyKey?: string | null;
  worker?: Worker;
  pitak?: Pitak;
  session?: Session;
  assignment?: Assignment | null;
  history?: PaymentHistory[];
  debtPayments?: Debt[];
  amountPaid?: number | null;
  lastPaymentDate?: string | null;
  debtDeductionTotal?: number | null;
}

export interface PaymentCreateData {
  workerId: number;
  pitakId: number;
  sessionId: number;
  assignmentId?: number | null;
  amount: number;
  grossPay?: number;
  manualDeduction?: number;
  netPay?: number;
  status?: "pending" | "partially_paid" | "completed" | "cancelled";
  paymentDate?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  periodStart?: string;
  periodEnd?: string;
  totalDebtDeduction?: number;
  otherDeductions?: number;
  deductionBreakdown?: any;
  notes?: string;
  idempotencyKey?: string;
  description?: string;
}

export interface PaymentUpdateData extends Partial<PaymentCreateData> {}

export type PaymentResponse = ApiResponse<Payment>;
export type PaymentsResponse = ApiResponse<PaginatedResponse<Payment>>;

export interface PaymentStats {
  totalGross: number;
  totalNet: number;
  totalDebtDeduction: number;
  breakdown: Record<string, number>;
}

export type PaymentStatsResponse = ApiResponse<PaymentStats>;

export interface PaymentFilters extends BaseFilters {
  workerId?: number;
  pitakId?: number;
  sessionId?: number;
  assignmentId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  idempotencyKey?: string;
}

class PaymentAPI {
  private channel = "payment";

  private async call<T = any>(
    method: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    if (!window.backendAPI?.payment) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.payment({ method, params });
  }

  private toPaginatedResponse<T>(raw: any): PaginatedResponse<T> {
    return {
      items: raw.data || [],
      pagination: raw.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
    };
  }

  async getAll(params?: PaymentFilters): Promise<PaymentsResponse> {
    try {
      const response = await this.call<any>("getAllPayments", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: this.toPaginatedResponse<Payment>(response.data),
        };
      }
      throw new Error(response.message || "Failed to fetch payments");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch payments");
    }
  }

  async getById(id: number): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("getPaymentById", {
        id,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch payment");
    }
  }

  async getByWorker(
    workerId: number,
    params?: Omit<PaymentFilters, "workerId">,
  ): Promise<PaymentsResponse> {
    return this.getAll({ ...params, workerId });
  }

  async getByPitak(
    pitakId: number,
    params?: Omit<PaymentFilters, "pitakId">,
  ): Promise<PaymentsResponse> {
    return this.getAll({ ...params, pitakId });
  }

  async getBySession(
    sessionId: number,
    params?: Omit<PaymentFilters, "sessionId">,
  ): Promise<PaymentsResponse> {
    return this.getAll({ ...params, sessionId });
  }

  async getStats(filters?: PaymentFilters): Promise<PaymentStatsResponse> {
    try {
      const response = await this.call<PaymentStatsResponse>(
        "getPaymentStats",
        filters || {},
      );
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  async create(data: PaymentCreateData): Promise<PaymentResponse> {
    try {
      const payload = { ...data };
      if (data.amount === undefined && data.grossPay !== undefined) {
        payload.amount = data.grossPay;
      }
      const response = await this.call<PaymentResponse>(
        "createPayment",
        payload,
      );
      if (response.status) return response;
      throw new Error(response.message || "Failed to create payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create payment");
    }
  }

  async update(id: number, data: PaymentUpdateData): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("updatePayment", {
        id,
        ...data,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update payment");
    }
  }

  async updateStatus(id: number, status: string): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("updateStatus", {
        id,
        status,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update payment status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update payment status");
    }
  }

  async delete(id: number): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("deletePayment", {
        id,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete payment");
    }
  }

  async restore(id: number): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("restorePayment", {
        id,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore payment");
    }
  }
  async recordPayment(
    id: number,
    data: {
      amountPaid: number;
      applyToDebt?: number;
      paymentMethod?: string;
      referenceNumber?: string;
      notes?: string;
    },
  ): Promise<PaymentResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PaymentResponse>("recordPayment", {
        id,
        ...data,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to record payment");
    } catch (error: any) {
      throw new Error(error.message || "Failed to record payment");
    }
  }

  async recordWorkerPayment(params: {
    workerId: number;
    totalAmount: number;
    debtDeduction: number;
    paymentMethod: string;
    referenceNumber?: string;
    notes?: string;
  }): Promise<ApiResponse<any>> {
    return this.call("recordWorkerPayment", params);
  }
}

const paymentAPI = new PaymentAPI();
export default paymentAPI;
