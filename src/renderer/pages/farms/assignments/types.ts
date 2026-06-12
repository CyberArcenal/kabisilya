// src/renderer/pages/farms/assignments/types.ts

import type { Assignment } from "../../../api/core/assignment";

export interface AssignmentWithDetails extends Assignment {
  // Additional fields if needed
}

export interface AssignmentFormData {
  workerId: number;
  pitakId: number;
  sessionId: number;
  assignmentDate: string;
  notes?: string;
  status?: string;
}

export interface BulkAssignData {
  workerIds: number[];
  pitakId: number;
  sessionId: number;
  assignmentDate: string;
  notes?: string;
}