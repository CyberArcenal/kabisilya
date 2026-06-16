import React from "react";
import type { FarmAssignmentSettings } from "../../../../../api/utils/system_config";
import Switch from "../../../../../components/UI/Switch";

interface AssignmentSettingsProps {
  settings: FarmAssignmentSettings;
  onChange: (field: keyof FarmAssignmentSettings, value: any) => void;
}

export const AssignmentSettings: React.FC<AssignmentSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateField = (field: keyof FarmAssignmentSettings, value: any) => {
    onChange(field, value);
  };

  const toggleStatusOption = (status: string) => {
    const currentOptions = settings.status_options || [];
    const updated = currentOptions.includes(
      status as "active" | "completed" | "cancelled",
    )
      ? currentOptions.filter((s) => s !== status)
      : [...currentOptions, status];
    updateField("status_options", updated);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Assignment Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Default Luwang per Worker
            </label>
            <input
              type="number"
              value={settings.default_luwang_per_worker || 0}
              onChange={(e) =>
                updateField(
                  "default_luwang_per_worker",
                  parseInt(e.target.value) || 0,
                )
              }
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
            />
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Number of luwang automatically assigned to each worker
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
              Date Behavior
            </label>
            <select
              value={settings.date_behavior || "system_date"}
              onChange={(e) => updateField("date_behavior", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
            >
              <option value="system_date">Use System Date</option>
              <option value="manual_entry">Allow Manual Entry</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Allowed Statuses
        </label>
        <div className="flex flex-wrap gap-6">
          {["active", "completed", "cancelled"].map((status) => (
            <label key={status} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(settings.status_options || []).includes(
                  status as "active" | "completed" | "cancelled",
                )}
                onChange={() => toggleStatusOption(status)}
                className="rounded border-[var(--input-border)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
              />
              <span className="text-sm text-[var(--text-secondary)] capitalize">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <Switch
          checked={settings.enable_notes_remarks || false}
          onChange={(checked) => updateField("enable_notes_remarks", checked)}
        />
        <span className="ml-3 text-sm text-[var(--text-secondary)]">Enable Notes / Remarks</span>
      </div>
    </div>
  );
};