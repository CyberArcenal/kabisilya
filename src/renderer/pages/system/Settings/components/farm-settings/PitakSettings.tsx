import React from "react";
import type { FarmPitakSettings } from "../../../../../api/utils/system_config";

interface PitakSettingsProps {
  settings: FarmPitakSettings;
  onChange: (field: keyof FarmPitakSettings, value: any) => void;
}

export const PitakSettings: React.FC<PitakSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateField = (field: keyof FarmPitakSettings, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.require_location || false}
            onChange={(e) => updateField("require_location", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Require Location</span>
        </label>
      </div>
    </div>
  );
};