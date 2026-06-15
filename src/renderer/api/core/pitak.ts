// src/renderer/api/core/pitakAPI.ts
// Fixed pagination: backend returns { data: Pitak[], pagination } at top level

import type { Assignment } from "./assignment";
import type { Bukid } from "./bukid";
import type { Payment } from "./payment";
import type { PaginatedResponse, ApiResponse, BaseFilters } from "../shared";

export interface Pitak {
  id: number;
  location: string;
  totalLuwang?: number;
  layoutType?: string;
  sideLengths?: any | null;
  areaSqm?: number;
  area?: number;
  notes?: string | null;
  description?: string | null;
  status: "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  bukid?: Bukid;
  assignments?: Assignment[];
  payments?: Payment[];
}

export interface PitakCreateData {
  bukidId: number;
  location?: string;
  layoutType?: string;
  sideLengths?: any;
  areaSqm?: number;
  area?: number;
  notes?: string;
  description?: string;
  status?: "active" | "completed" | "cancelled";
  totalLuwang?: number;
}

export interface PitakUpdateData extends Partial<PitakCreateData> {}

export type PitakResponse = ApiResponse<Pitak>;
export type PitaksResponse = ApiResponse<PaginatedResponse<Pitak>>;

export interface PitakStats {
  total: number;
  active: number;
  completed: number;
  cancelled: number;
  totalArea: number;
}

export type PitakStatsResponse = ApiResponse<PitakStats>;

export interface PitakFilters extends BaseFilters {
  bukidId?: number;
  status?: string;
  sessionId?: number;
  minArea?: number;
  maxArea?: number;
}

class PitakAPI {
  private channel = "pitak";

  private async call<T = any>(
    method: string,
    params: Record<string, any> = {},
  ): Promise<T> {
    if (!window.backendAPI?.pitak) {
      throw new Error(`Electron API (${this.channel}) not available`);
    }
    return window.backendAPI.pitak({ method, params });
  }

  async getAll(params?: PitakFilters): Promise<PitaksResponse> {
    try {
      const response = await this.call<any>("getAllPitaks", params || {});
      if (response.status) {
        return {
          status: true,
          message: response.message,
          data: {
            items: response.data, // array of pitaks
            pagination: response.pagination || {
              page: 1,
              limit: 50,
              total: 0,
              pages: 0,
            },
          },
        };
      }
      throw new Error(response.message || "Failed to fetch pitaks");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pitaks");
    }
  }

  async getById(id: number): Promise<PitakResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PitakResponse>("getPitakById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch pitak");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch pitak");
    }
  }

  async getByBukid(
    bukidId: number,
    params?: Omit<PitakFilters, "bukidId">,
  ): Promise<PitaksResponse> {
    return this.getAll({ ...params, bukidId });
  }

  async getStats(params?: PitakFilters): Promise<PitakStatsResponse> {
    try {
      const response = await this.call<PitakStatsResponse>("getPitakStats", {
        ...params
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch stats");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch stats");
    }
  }

  async create(data: PitakCreateData): Promise<PitakResponse> {
    try {
      const payload = { ...data };
      if (payload.area !== undefined && payload.areaSqm === undefined) {
        payload.areaSqm = payload.area;
        delete payload.area;
      }
      const response = await this.call<PitakResponse>("createPitak", payload);
      if (response.status) return response;
      throw new Error(response.message || "Failed to create pitak");
    } catch (error: any) {
      throw new Error(error.message || "Failed to create pitak");
    }
  }

  async update(id: number, data: PitakUpdateData): Promise<PitakResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const payload = { ...data };
      if (payload.area !== undefined && payload.areaSqm === undefined) {
        payload.areaSqm = payload.area;
        delete payload.area;
      }
      const response = await this.call<PitakResponse>("updatePitak", {
        id,
        ...payload,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update pitak");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update pitak");
    }
  }

  async updateStatus(
    id: number,
    status: "active" | "completed" | "cancelled",
  ): Promise<PitakResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PitakResponse>("updateStatus", {
        id,
        status,
      });
      if (response.status) return response;
      throw new Error(response.message || "Failed to update pitak status");
    } catch (error: any) {
      throw new Error(error.message || "Failed to update pitak status");
    }
  }

  async delete(id: number): Promise<PitakResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PitakResponse>("deletePitak", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to delete pitak");
    } catch (error: any) {
      throw new Error(error.message || "Failed to delete pitak");
    }
  }

  async restore(id: number): Promise<PitakResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<PitakResponse>("restorePitak", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to restore pitak");
    } catch (error: any) {
      throw new Error(error.message || "Failed to restore pitak");
    }
  }
}

const pitakAPI = new PitakAPI();
export default pitakAPI;
