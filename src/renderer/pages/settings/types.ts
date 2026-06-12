// src/renderer/pages/settings/types.ts
export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: "admin" | "manager" | "viewer";
  isActive: boolean;
  createdAt: string;
}

export interface BackupFile {
  name: string;
  size: number;
  createdAt: string;
}

export interface GeneralSettings {
  farmName: string;
  defaultRatePerLuwang: number;
  enableAutoPenalty: boolean;
  penaltyRate: number;
  penaltyGraceDays: number;
}