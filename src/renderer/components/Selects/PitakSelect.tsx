// src/components/Selects/PitakSelect.tsx
import React, { useCallback } from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { MapPin } from "lucide-react";
import pitakAPI from "../../api/core/pitak";

interface PitakSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  bukidId?: number | null;
  disabled?: boolean;
  placeholder?: string;
}

const PitakSelect: React.FC<PitakSelectProps> = ({ bukidId, ...props }) => {
  const fetchPitaks = useCallback(async (search: string): Promise<Option[]> => {
    const params: any = { search, limit: 100, sortBy: "location", sortOrder: "ASC" };
    if (bukidId) params.bukidId = bukidId;
    const res = await pitakAPI.getAll(params);
    if (!res.status) return [];
    return res.data.items.map((p) => ({
      id: p.id,
      label: p.location,
      subLabel: p.area ? `${p.area} sqm` : undefined,
      icon: <MapPin className="w-4 h-4" />,
    }));
  }, [bukidId]);
  return <SearchableSelect {...props} fetchOptions={fetchPitaks} icon={<MapPin className="w-4 h-4" />} placeholder={props.placeholder || "Select a plot..."} />;
};

export default PitakSelect;