// src/renderer/pages/workers/types.ts

import type { Worker } from "../../api/core/worker";

export interface WorkerWithDetails extends Worker {
  // Additional fields if needed
}

export interface WorkerFormData {
  name: string;
  contact?: string;
  email?: string;
  address?: string;
  status: string;
  hireDate?: string;
}