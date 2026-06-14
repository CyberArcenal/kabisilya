import { useState, useEffect, useCallback } from "react";
import paymentAPI from "../../../../api/core/payment";

interface PaymentStats {
  totalGross: number;
  totalNet: number;
  totalDebtDeduction: number;
  breakdown: Record<string, number>;
}

export const usePaymentsStats = (filters: {
  search?: string;
  workerId?: number;
  sessionId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [stats, setStats] = useState<PaymentStats>({
    totalGross: 0,
    totalNet: 0,
    totalDebtDeduction: 0,
    breakdown: {},
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.getStats(filters);
      if (res.status && res.data) {
        setStats(res.data);
      }
    } catch (error) {
      console.error("Failed to fetch payment stats", error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, statsLoading: loading, refetchStats: fetchStats };
};