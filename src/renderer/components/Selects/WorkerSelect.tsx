// src/components/Selects/WorkerSelect.tsx
import React from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { User } from "lucide-react";
import workerAPI from "../../api/core/worker";

interface WorkerSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const WorkerSelect: React.FC<WorkerSelectProps> = (props) => {
  const fetchWorkers = async (search: string): Promise<Option[]> => {
    const res = await workerAPI.getAll({ search, limit: 100, sortBy: "name", sortOrder: "ASC" });
    if (!res.status) return [];
    return res.data.items.map((w) => ({
      id: w.id,
      label: w.name,
      subLabel: w.email || w.contact || undefined,
      icon: <User className="w-4 h-4" />,
    }));
  };
  return <SearchableSelect {...props} fetchOptions={fetchWorkers} icon={<User className="w-4 h-4" />} placeholder={props.placeholder || "Select a worker..."} />;
};

export default WorkerSelect;