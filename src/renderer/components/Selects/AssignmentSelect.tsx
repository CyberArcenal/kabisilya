// src/components/Selects/AssignmentSelect.tsx
import React, { useCallback } from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { Calendar } from "lucide-react";
import assignmentAPI from "../../api/core/assignment";

interface AssignmentSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  workerFilter?: number | null;
  pitakFilter?: number | null;
  disabled?: boolean;
  placeholder?: string;
}

const AssignmentSelect: React.FC<AssignmentSelectProps> = ({
  workerFilter,
  pitakFilter,
  ...props
}) => {
  const fetchAssignments = useCallback(
    async (search: string): Promise<Option[]> => {
      const params: any = { search, limit: 100 };
      if (workerFilter) params.workerId = workerFilter;
      if (pitakFilter) params.pitakId = pitakFilter;
      const res = await assignmentAPI.getAll(params);
      if (!res.status) return [];
      return res.data.items.map((a) => ({
        id: a.id,
        label: `${a.worker?.name || "Unassigned"} – ${a.pitak?.location || "No plot"}`,
        subLabel: `${new Date(a.assignmentDate).toLocaleDateString()} • ${a.luwangCount} luwang`,
        icon: <Calendar className="w-4 h-4" />,
      }));
    },
    [workerFilter],
  );
  return (
    <SearchableSelect
      {...props}
      fetchOptions={fetchAssignments}
      icon={<Calendar className="w-4 h-4" />}
      placeholder={props.placeholder || "Select an assignment..."}
    />
  );
};

export default AssignmentSelect;
