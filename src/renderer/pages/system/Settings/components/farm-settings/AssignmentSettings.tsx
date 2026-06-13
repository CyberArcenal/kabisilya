import React from "react";
import type { FarmAssignmentSettings } from "../../../../../api/utils/system_config";

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
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
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Date Behavior
          </label>
          <select
            value={settings.date_behavior || "system_date"}
            onChange={(e) => updateField("date_behavior", e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          >
            <option value="system_date">System Date</option>
            <option value="manual_entry">Manual Entry</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
          Status Options
        </label>
        <div className="flex flex-wrap gap-4">
          {["active", "completed", "cancelled"].map((status) => (
            <label key={status} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={(settings.status_options || []).includes(
                  status as "active" | "completed" | "cancelled",
                )}
                onChange={() => toggleStatusOption(status)}
                className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
              />
              <span className="text-sm text-[var(--text-secondary)] capitalize">{status}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enable_notes_remarks || false}
            onChange={(e) => updateField("enable_notes_remarks", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Enable Notes/Remarks</span>
        </label>
      </div>
    </div>
  );
};