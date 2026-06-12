// src/components/Selects/SessionSelect.tsx
import React from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { CalendarDays } from "lucide-react";
import sessionAPI from "../../api/core/session";

interface SessionSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  onlyActive?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

const SessionSelect: React.FC<SessionSelectProps> = ({ onlyActive = false, ...props }) => {
  const fetchSessions = async (search: string): Promise<Option[]> => {
    const params: any = { search, limit: 100, sortBy: "startDate", sortOrder: "DESC" };
    if (onlyActive) params.status = "active";
    const res = await sessionAPI.getAll(params);
    if (!res.status) return [];
    return res.data.items.map((s) => ({
      id: s.id,
      label: `${s.name} (${s.year})`,
      subLabel: s.seasonType || `${new Date(s.startDate).toLocaleDateString()} - ${s.endDate ? new Date(s.endDate).toLocaleDateString() : "present"}`,
      icon: <CalendarDays className="w-4 h-4" />,
    }));
  };
  return <SearchableSelect {...props} fetchOptions={fetchSessions} icon={<CalendarDays className="w-4 h-4" />} placeholder={props.placeholder || "Select a session..."} />;
};

export default SessionSelect;