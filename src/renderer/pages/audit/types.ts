// src/renderer/pages/audit/types.ts

import type { AuditLogEntry } from "../../api/core/audit";

export interface AuditLogWithDetails extends AuditLogEntry {
  // Additional fields if needed
}

export interface AuditFilters {
  search?: string;
  entity?: string;
  action?: string;
  user?: string;
  startDate?: string;
  endDate?: string;
}