// src/renderer/pages/farms/bukid/types.ts
import type { Bukid } from "../../../api/core/bukid";
import type { Pitak } from "../../../api/core/pitak";

export interface BukidWithPitaks extends Bukid {
  pitaks?: Pitak[];
}

export interface BukidFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface BukidFormData {
  name: string;
  sessionId: number;
  status: string;
  location?: string;
  area?: number;
  description?: string;
}