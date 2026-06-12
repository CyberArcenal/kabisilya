// src/renderer/pages/notification-logs/types.ts

import type { NotificationLogEntry } from "../../api/core/notificationLog";

export interface NotificationLogWithDetails extends NotificationLogEntry {
  // Additional fields if needed
}

export interface NotificationLogFilters {
  status?: string | string[];
  recipient_email?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}