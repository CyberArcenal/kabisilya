// src/renderer/api/core/debtHistoryAPI.ts
// Fixed pagination: backend returns { data, pagination } -> frontend expects { items, pagination }
// ✅ Wala nang payment relation

import type { Debt } from "./debt";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

// ----------------------------------------------------------------------
// 📦 DebtHistory-specific Types
// ----------------------------------------------------------------------

export interface DebtHistory {
  id: number;
  amountPaid: number;
  previousBalance: number;
  newBalance: number;
  transactionType: string;
  paymentMethod?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  transactionDate: string;
  createdAt: string;
  updatedAt?: string;
  deletedAt?: string | null;
  debt?: Debt;
  // ❌ payment?: Payment | null; // inalis na
}

export interface DebtHistoryCreateData {
  debtId: number;
  amountPaid: number;
  previousBalance: number;
  newBalance: number;
  transactionType?: string;
  paymentMethod?: string;
  referenceNumber?: string;
  notes?: string;
  transactionDate?: string;
  performedBy?: string; // idinagdag para sa audit
}

export interface DebtHistoryUpdateData extends Partial<DebtHistoryCreateData> {}

export type DebtHistoryResponse = ApiResponse<DebtHistory>;
export type DebtHistoriesResponse = ApiResponse<PaginatedResponse<DebtHistory>>;

export interface DebtHistoryStats {
  totalEntries: number;
  typeBreakdown: Record<string, number>;
  totalPayments: number;
}

export type DebtHistoryStatsResponse = ApiResponse<DebtHistoryStats>;

export interface DebtHistoryFilters extends BaseFilters {
  debtId?: number;
  // ❌ paymentId?: number; // inalis na
  transactionType?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

// ----------------------------------------------------------------------
// 🧠 DebtHistoryAPI Class (with pagination transformation)
// ----------------------------------------------------------------------

class DebtHistoryAPI {
  private channel = "debtHistory";

  private async call<T = any>(
    method: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    if (!window.backendAPI?.debtHistory) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.debtHistory({ method, params });
  }

  private toPaginatedResponse<T>(raw: any): PaginatedResponse<T> {
    return {
      items: raw.data || [],
      pagination: raw.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
    };
  }

  // 🔎 READ

  async getAll(params?: DebtHistoryFilters): Promise<DebtHistoriesResponse> {
    try {
      const response = await this.call<any>("getAllDebtHistories", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: this.toPaginatedResponse<DebtHistory>(response.data),
        };
      }
      throw new Error(response.message || "Failed to fetch debt histories");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch debt histories");
    }
  }

  async getById(id: number): Promise<DebtHistoryResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtHistoryResponse>("getDebtHistoryById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch debt history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch debt history");
    }
  }

  async getByDebt(
    debtId: number,
    params?: Omit<DebtHistoryFilters, "debtId">,
  ): Promise<DebtHistoriesResponse> {
    return this.getAll({ ...params, debtId });
  }

  async getStats(debtId?: number): Promise<DebtHistoryStatsResponse> {
    try {
      const response = await this.call<DebtHistoryStatsResponse>("getDebtHistoryStats", { debtId });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  // ✏️ WRITE

  async create(data: DebtHistoryCreateData): Promise<DebtHistoryResponse> {
    try {
      // Remove any paymentId if accidentally passed
      const { paymentId, ...cleanData } = data as any;
      const response = await this.call<DebtHistoryResponse>("createDebtHistory", cleanData);
      if (response.status) return response;
      throw new Error(response.message || "Failed to create debt history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create debt history");
    }
  }

  async update(id: number, data: DebtHistoryUpdateData): Promise<DebtHistoryResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const { paymentId, ...cleanData } = data as any;
      const response = await this.call<DebtHistoryResponse>("updateDebtHistory", { id, ...cleanData });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update debt history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update debt history");
    }
  }

  async delete(id: number): Promise<DebtHistoryResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtHistoryResponse>("deleteDebtHistory", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete debt history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete debt history");
    }
  }

  async restore(id: number): Promise<DebtHistoryResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<DebtHistoryResponse>("restoreDebtHistory", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore debt history");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore debt history");
    }
  }
}

const debtHistoryAPI = new DebtHistoryAPI();
export default debtHistoryAPI;