// src/renderer/pages/farms/pitak/types.ts
import type { Pitak } from "../../../api/core/pitak";
import type { Worker } from "../../../api/core/worker";

export interface PitakWithWorkers extends Pitak {
  workers?: Worker[];
}