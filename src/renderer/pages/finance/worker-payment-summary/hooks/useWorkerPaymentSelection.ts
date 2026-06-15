// src/renderer/pages/finance/worker-payment-summary/hooks/useWorkerPaymentSelection.ts
import { useState } from "react";

export const useWorkerPaymentSelection = () => {
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  return [selectedWorkerIds, setSelectedWorkerIds] as const;
};