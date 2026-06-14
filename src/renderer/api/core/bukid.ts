// src/renderer/api/core/bukidAPI.ts
// Fixed pagination: backend returns { data, pagination } -> frontend expects { items, pagination }

import type { Pitak } from "./pitak";
import type { Session } from "./session";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

// ----------------------------------------------------------------------
// 📦 Bukid-specific Types
// ----------------------------------------------------------------------

export interface Bukid {
  id: number;
  name: string;
  status: "initiated" | "active" | "completed" | "cancelled";
  notes?: string | null;
  location?: string | null;
  area?: number | null;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  session: Session;
  pitaks?: Pitak[];
}

export interface BukidCreateData {
  name: string;
  sessionId: number;
  status?: "initiated" | "active" | "completed" | "cancelled";
  notes?: string;
  location?: string;
  area?: number;
  description?: string;
}

export interface BukidUpdateData extends Partial<BukidCreateData> {}

export type BukidResponse = ApiResponse<Bukid>;
export type BukidsResponse = ApiResponse<PaginatedResponse<Bukid>>;

export interface BukidStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  initiated: number;
  totalArea: number;
  // totalPitaks: number;// uncomment if needed
}

export type BukidStatsResponse = ApiResponse<BukidStats>;

export interface BukidFilters extends BaseFilters {
  sessionId?: number;
  status?: string;
}

// ----------------------------------------------------------------------
// 🧠 BukidAPI Class (with pagination transformation)
// ----------------------------------------------------------------------

class BukidAPI {
  private channel = "bukid";

  private async call<T = any>(
    method: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    if (!window.backendAPI?.bukid) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.bukid({ method, params });
  }

  /**
   * Transform backend pagination response to frontend format
   * Backend: { data: T[], pagination: {...} }
   * Frontend: { items: T[], pagination: {...} }
   */
  private toPaginatedResponse<T>(raw: any): PaginatedResponse<T> {
    return {
      items: raw.data || [],
      pagination: raw.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
    };
  }

  // 🔎 READ (with pagination)

  async getAll(params?: BukidFilters): Promise<BukidsResponse> {
    try {
      const response = await this.call<any>("getAllBukids", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: this.toPaginatedResponse<Bukid>(response.data),
        };
      }
      throw new Error(response.message || "Failed to fetch bukids");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch bukids");
    }
  }

  async getById(id: number): Promise<BukidResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<BukidResponse>("getBukidById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch bukid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch bukid");
    }
  }

  async getBySession(
    sessionId: number,
    params?: Omit<BukidFilters, "sessionId">,
  ): Promise<BukidsResponse> {
    return this.getAll({ ...params, sessionId });
  }

  async getStats(filters?: {
    sessionId?: number;
    status?: string;
    search?: string;
  }): Promise<BukidStatsResponse> {
    try {
      const response = await this.call<BukidStatsResponse>(
        "getBukidStats",
        filters || {},
      );
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  // ✏️ WRITE

  async create(data: BukidCreateData): Promise<BukidResponse> {
    try {
      const response = await this.call<BukidResponse>("createBukid", data);
      if (response.status) return response;
      throw new Error(response.message || "Failed to create bukid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create bukid");
    }
  }

  async update(id: number, data: BukidUpdateData): Promise<BukidResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<BukidResponse>("updateBukid", {
        id,
        ...data,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update bukid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update bukid");
    }
  }

  async updateStatus(id: number, status: string): Promise<BukidResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<BukidResponse>("updateStatus", {
        id,
        status,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update bukid status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update bukid status");
    }
  }

  async delete(id: number): Promise<BukidResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<BukidResponse>("deleteBukid", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete bukid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete bukid");
    }
  }

  async restore(id: number): Promise<BukidResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<BukidResponse>("restoreBukid", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore bukid");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore bukid");
    }
  }
}

const bukidAPI = new BukidAPI();
export default bukidAPI;
