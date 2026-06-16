import { useState } from "react";

export const useDebtSummarySelection = () => {
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  return [selectedWorkerIds, setSelectedWorkerIds] as const;
};