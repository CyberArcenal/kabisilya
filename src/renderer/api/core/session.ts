// src/renderer/api/core/sessionAPI.ts
// Fixed pagination: backend returns { data: Session[], pagination } at top level

import type { Assignment } from "./assignment";
import type { Bukid } from "./bukid";
import type { Debt } from "./debt";
import type { Payment } from "./payment";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

export interface Session {
  id: number;
  name: string;
  seasonType?: string | null;
  year: number;
  startDate: string;
  endDate?: string | null;
  status: "active" | "closed" | "archived";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  bukids?: Bukid[];
  assignments?: Assignment[];
  payments?: Payment[];
  debts?: Debt[];
}

export interface SessionCreateData {
  name: string;
  year: number;
  startDate: string;
  seasonType?: string;
  endDate?: string;
  status?: string;
  notes?: string;
}

export interface SessionUpdateData extends Partial<SessionCreateData> {}

export type SessionResponse = ApiResponse<Session>;
export type SessionsResponse = ApiResponse<PaginatedResponse<Session>>;

export interface SessionStats {
  totalSessions: number;
  statusBreakdown: Record<string, number>;
  sessionDetails?: {
    totalAssignments: number;
    totalPayments: number;
    totalDebts: number;
  } | null;
}

export type SessionStatsResponse = ApiResponse<SessionStats>;

export interface SessionFilters extends BaseFilters {
  status?: string;
  year?: number;
  seasonType?: string;
  startDateFrom?: string;
  startDateTo?: string;
}

class SessionAPI {
  private channel = "session";

  private async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (!window.backendAPI?.session) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.session({ method, params });
  }

  // READ (with pagination)
  async getAll(params?: SessionFilters): Promise<SessionsResponse> {
    try {
      const response = await this.call<any>("getAllSessions", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: {
            items: response.data,           // array of sessions
            pagination: response.pagination || { page: 1, limit: 50, total: 0, pages: 0 },
          },
        };
      }
      throw new Error(response.message || "Failed to fetch sessions");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch sessions");
    }
  }

  async getById(id: number): Promise<SessionResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<SessionResponse>("getSessionById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch session");
    }
  }

  async getActive(): Promise<SessionResponse> {
    try {
      const response = await this.call<SessionResponse>("getActiveSession");
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch active session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch active session");
    }
  }

  async getStats(sessionId?: number): Promise<SessionStatsResponse> {
    try {
      const response = await this.call<SessionStatsResponse>("getSessionStats", { sessionId });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  // WRITE
  async create(data: SessionCreateData): Promise<SessionResponse> {
    try {
      const response = await this.call<SessionResponse>("createSession", data);
      if (response.status) return response;
      throw new Error(response.message || "Failed to create session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create session");
    }
  }

  async update(id: number, data: SessionUpdateData): Promise<SessionResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<SessionResponse>("updateSession", { id, ...data });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update session");
    }
  }

  async updateStatus(id: number, status: string): Promise<SessionResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<SessionResponse>("updateStatus", { id, status });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update session status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update session status");
    }
  }

  async delete(id: number): Promise<SessionResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<SessionResponse>("deleteSession", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete session");
    }
  }

  async restore(id: number): Promise<SessionResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<SessionResponse>("restoreSession", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore session");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore session");
    }
  }
}

const sessionAPI = new SessionAPI();
export default sessionAPI;