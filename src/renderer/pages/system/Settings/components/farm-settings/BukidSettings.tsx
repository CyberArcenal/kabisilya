import React from "react";
import type { FarmBukidSettings } from "../../../../../api/utils/system_config";

interface BukidSettingsProps {
  settings: FarmBukidSettings;
  onChange: (field: keyof FarmBukidSettings, value: any) => void;
}

export const BukidSettings: React.FC<BukidSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateField = (field: keyof FarmBukidSettings, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Name Format
          </label>
          <input
            type="text"
            value={settings.name_format || ""}
            onChange={(e) => updateField("name_format", e.target.value)}
            placeholder="e.g., Bukid {number}"
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Default Status
          </label>
          <select
            value={settings.default_status || "active"}
            onChange={(e) => updateField("default_status", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Max Bukid per Session
          </label>
          <input
            type="number"
            value={settings.max_bukid_per_session || 0}
            onChange={(e) =>
              updateField(
                "max_bukid_per_session",
                parseInt(e.target.value) || 0,
              )
            }
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_location_descriptor || false}
            onChange={(e) => updateField("enable_location_descriptor", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Enable Location Descriptor</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.location_required || false}
            onChange={(e) => updateField("location_required", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Location Required</span>
        </label>
      </div>
    </div>
  );
};