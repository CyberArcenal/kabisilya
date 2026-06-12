// src/renderer/api/core/debtAPI.ts
// Fixed pagination: backend returns { data, pagination } -> frontend expects { items, pagination }

import type { DebtHistory } from "./debt_history";
import type { Session } from "./session";
import type { Worker } from "./worker";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

// ----------------------------------------------------------------------
// 📦 Debt-specific Types
// ----------------------------------------------------------------------

export interface Debt {
  id: number;
  originalAmount: number;
  amount: number;
  reason?: string | null;
  balance: number;
  status: "pending" | "partially_paid" | "paid" | "cancelled" | "overdue" | "settled";
  dateIncurred: string;
  dueDate?: string | null;
  paymentTerm?: string | null;
  interestRate: number;
  totalInterest: number;
  totalPaid: number;
  lastPaymentDate?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  worker?: Worker;
  session?: Session;
  history?: DebtHistory[];
}

export interface DebtCreateData {
  workerId: number;
  sessionId: number;
  amount: number;
  originalAmount?: number;
  reason?: string;
  dueDate?: string;
  paymentTerm?: string;
  interestRate?: number;
  status?: "pending" | "partially_paid" | "paid" | "cancelled" | "overdue" | "settled";
}

export interface DebtUpdateData extends Partial<DebtCreateData> {}

export type DebtResponse = ApiResponse<Debt>;
export type DebtsResponse = ApiResponse<PaginatedResponse<Debt>>;

export interface DebtStats {
  totalDebts: number;
  statusBreakdown: Record<string, number>;
  totalAmount: number;
  totalBalance: number;
}

export type DebtStatsResponse = ApiResponse<DebtStats>;

export interface DebtFilters extends BaseFilters {
  workerId?: number;
  sessionId?: number;
  status?: string;
  dueDateStart?: string;
  dueDateEnd?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ----------------------------------------------------------------------
// 🧠 DebtAPI Class (with pagination transformation)
// ----------------------------------------------------------------------

class DebtAPI {
  private channel = "debt";

  private async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (!window.backendAPI?.debt) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.debt({ method, params });
  }

  private toPaginatedResponse<T>(raw: any): PaginatedResponse<T> {
    return {
      items: raw.data || [],
      pagination: raw.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
    };
  }

  // 🔎 READ

  async getAll(params?: DebtFilters): Promise<DebtsResponse> {
    try {
      const response = await this.call<any>("getAllDebts", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: this.toPaginatedResponse<Debt>(response.data),
        };
      }
      throw new Error(response.message || "Failed to fetch debts");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch debts");
    }
  }

  async getById(id: number): Promise<DebtResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtResponse>("getDebtById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch debt");
    }
  }

  async getByWorker(
    workerId: number,
    params?: Omit<DebtFilters, "workerId">
  ): Promise<DebtsResponse> {
    return this.getAll({ ...params, workerId });
  }

  async getBySession(
    sessionId: number,
    params?: Omit<DebtFilters, "sessionId">
  ): Promise<DebtsResponse> {
    return this.getAll({ ...params, sessionId });
  }

  async getStats(sessionId?: number): Promise<DebtStatsResponse> {
    try {
      const response = await this.call<DebtStatsResponse>("getDebtStats", { sessionId });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  // ✏️ WRITE

  async create(data: DebtCreateData): Promise<DebtResponse> {
    try {
      const response = await this.call<DebtResponse>("createDebt", data);
      if (response.status) return response;
      throw new Error(response.message || "Failed to create debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create debt");
    }
  }

  async update(id: number, data: DebtUpdateData): Promise<DebtResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtResponse>("updateDebt", { id, ...data });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update debt");
    }
  }

  async updateStatus(id: number, status: string): Promise<DebtResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtResponse>("updateStatus", { id, status });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update debt status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update debt status");
    }
  }

  async delete(id: number): Promise<DebtResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtResponse>("deleteDebt", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete debt");
    }
  }

  async restore(id: number): Promise<DebtResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtResponse>("restoreDebt", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore debt");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore debt");
    }
  }
}

const debtAPI = new DebtAPI();
export default debtAPI;