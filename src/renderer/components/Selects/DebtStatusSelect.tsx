// src/components/Selects/DebtStatusSelect.tsx
import React from "react";

const statuses = [
  { value: "pending", label: "Pending" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "cancelled", label: "Cancelled" },
  { value: "overdue", label: "Overdue" },
  { value: "settled", label: "Settled" },
];

interface DebtStatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

const DebtStatusSelect: React.FC<DebtStatusSelectProps> = ({ value, onChange, disabled = false }) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
      style={{
        backgroundColor: "var(--input-bg)",
        borderColor: "var(--input-border)",
        color: "var(--text-primary)",
      }}
    >
      {statuses.map((s) => (
        <option key={s.value} value={s.value}>{s.label}</option>
      ))}
    </select>
  );
};

export default DebtStatusSelect;