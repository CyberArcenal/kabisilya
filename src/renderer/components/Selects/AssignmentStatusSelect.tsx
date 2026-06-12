// src/components/Selects/AssignmentStatusSelect.tsx
import React from "react";

const statuses = [
  { value: "initiated", label: "Initiated" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

interface AssignmentStatusSelectProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
}

const AssignmentStatusSelect: React.FC<AssignmentStatusSelectProps> = ({ value, onChange, disabled = false }) => {
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

export default AssignmentStatusSelect;