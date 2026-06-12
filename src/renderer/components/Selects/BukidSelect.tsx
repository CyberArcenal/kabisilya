// src/components/Selects/BukidSelect.tsx
import React from "react";
import { SearchableSelect, type Option } from "./shared/SearchableSelect";
import { Trees } from "lucide-react";
import bukidAPI from "../../api/core/bukid";

interface BukidSelectProps {
  value: number | null;
  onChange: (id: number | null) => void;
  disabled?: boolean;
  placeholder?: string;
}

const BukidSelect: React.FC<BukidSelectProps> = (props) => {
  const fetchBukids = async (search: string): Promise<Option[]> => {
    const res = await bukidAPI.getAll({ search, limit: 100, sortBy: "name", sortOrder: "ASC" });
    if (!res.status) return [];
    return res.data.items.map((b) => ({
      id: b.id,
      label: b.name,
      subLabel: b.location || undefined,
      icon: <Trees className="w-4 h-4" />,
    }));
  };
  return <SearchableSelect {...props} fetchOptions={fetchBukids} icon={<Trees className="w-4 h-4" />} placeholder={props.placeholder || "Select a farm..."} />;
};

export default BukidSelect;