// src/components/Selects/DebtSelect.tsx
import React, { useCallback } from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { CreditCard } from "lucide-react";
import debtAPI from "../../api/core/debt";

interface DebtSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  workerFilter?: number | null;
  disabled?: boolean;
  placeholder?: string;
}

const DebtSelect: React.FC<DebtSelectProps> = ({ workerFilter, ...props }) => {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(amount);

  const fetchDebts = useCallback(async (search: string): Promise<Option[]> => {
    const params: any = { search, limit: 100 };
    if (workerFilter) params.workerId = workerFilter;
    const res = await debtAPI.getAll(params);
    if (!res.status) return [];
    return res.data.items.map((d) => ({
      id: d.id,
      label: `${d.worker?.name || "Unknown"} - ${formatCurrency(d.balance)}`,
      subLabel: `Due: ${d.dueDate ? new Date(d.dueDate).toLocaleDateString() : "N/A"} • Status: ${d.status}`,
      icon: <CreditCard className="w-4 h-4" />,
    }));
  }, [workerFilter]);
  return <SearchableSelect {...props} fetchOptions={fetchDebts} icon={<CreditCard className="w-4 h-4" />} placeholder={props.placeholder || "Select a debt..."} />;
};

export default DebtSelect;