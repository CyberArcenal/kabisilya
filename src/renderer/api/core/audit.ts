// src/renderer/api/core/auditLogAPI.ts
// No pagination from backend – returns plain array.
// Types adjusted for clarity.

export interface AuditLogEntry {
  id: number;
  action: string;
  entity: string;
  entityId?: number;
  timestamp: string;
  user?: string | null;
  description?: string | null;
  newData?: string | null;
  previousData?: string | null;
}

export interface AuditLogsResponse {
  status: boolean;
  message: string;
  data: AuditLogEntry[]; // plain array, no pagination metadata
}

export interface AuditLogResponse {
  status: boolean;
  message: string;
  data: AuditLogEntry;
}

export interface RecentActivityResponse {
  status: boolean;
  message: string;
  data: {
    items: AuditLogEntry[];
    limit: number;
  };
}

export interface ValidationResponse {
  status: boolean;
  message: string;
  data: boolean;
}

class AuditLogAPI {
  private async call<T = any>(method: string, params: Record<string, any> = {}): Promise<T> {
    if (!window.backendAPI?.auditLog) {
      throw new Error("Electron API (auditLog) not available");
    }
    return window.backendAPI.auditLog({ method, params });
  }

  async getAll(params?: {
    entity?: string;
    action?: string;
    actor?: string;
    startDate?: string;
    endDate?: string;
    sortBy?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    limit?: number;
  }): Promise<AuditLogsResponse> {
    try {
      const response = await this.call<AuditLogsResponse>("getAllAuditLogs", params || {});
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch audit logs");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch audit logs");
    }
  }

  async getById(id: number): Promise<AuditLogResponse> {
    try {
      if (!id || id <= 0) throw new Error("Invalid ID");
      const response = await this.call<AuditLogResponse>("getAuditLogById", { id });
      if (response.status) return response;
      throw new Error(response.message || "Failed to fetch audit log");
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch audit log");
    }
  }

  async getByEntity(params: {
    entity: string;
    entityId?: number;
    page?: number;
    limit?: number;
  }): Promise<AuditLogsResponse> {
    return this.getAll({
      entity: params.entity,
      page: params.page,
      limit: params.limit,
    });
  }

  async getByUser(params: { user: string; page?: number; limit?: number }): Promise<AuditLogsResponse> {
    return this.getAll({ actor: params.user, page: params.page, limit: params.limit });
  }

  async getByAction(params: { action: string; page?: number; limit?: number }): Promise<AuditLogsResponse> {
    return this.getAll({ action: params.action, page: params.page, limit: params.limit });
  }

  async getByDateRange(params: {
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogsResponse> {
    return this.getAll({
      startDate: params.startDate,
      endDate: params.endDate,
      page: params.page,
      limit: params.limit,
    });
  }

  async search(params: {
    searchTerm?: string;
    entity?: string;
    user?: string;
    action?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<AuditLogsResponse> {
    const { entity, user, action, startDate, endDate, page, limit } = params;
    return this.getAll({ entity, actor: user, action, startDate, endDate, page, limit });
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivityResponse> {
    try {
      const response = await this.getAll({ limit, sortBy: "timestamp", sortOrder: "DESC" });
      return {
        status: response.status,
        message: response.message,
        data: { items: response.data, limit },
      };
    } catch (error: any) {
      throw new Error(error.message || "Failed to fetch recent activity");
    }
  }

  // Unsupported methods
  async exportCSV(): Promise<any> { throw new Error("Export to CSV is not implemented in the backend."); }
  async generateReport(): Promise<any> { throw new Error("Generate report is not implemented in the backend."); }
  async getSummary(): Promise<any> { throw new Error("Audit summary is not implemented in the backend."); }
  async getStats(): Promise<any> { throw new Error("Audit stats is not implemented in the backend."); }
  async getCounts(): Promise<any> { throw new Error("Audit counts is not implemented in the backend."); }
  async getTopActivities(): Promise<any> { throw new Error("Top activities is not implemented in the backend."); }

  async hasLogs(entity: string, entityId?: number): Promise<boolean> {
    try {
      const response = await this.getByEntity({ entity, limit: 100 });
      if (!response.status) return false;
      if (!entityId) return response.data.length > 0;
      return response.data.some((log) => log.entityId === entityId);
    } catch {
      return false;
    }
  }

  async getLatestEntry(entity: string, entityId: number): Promise<AuditLogEntry | null> {
    try {
      const response = await this.getByEntity({ entity, limit: 10 });
      if (!response.status || response.data.length === 0) return null;
      const exactMatches = response.data.filter((log) => log.entityId === entityId);
      if (exactMatches.length === 0) return null;
      return exactMatches[0];
    } catch {
      return null;
    }
  }

  async isAvailable(): Promise<boolean> {
    return !!window.backendAPI?.auditLog;
  }
}

const auditLogAPI = new AuditLogAPI();
export default auditLogAPI;