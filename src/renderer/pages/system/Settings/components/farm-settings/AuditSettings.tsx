import React from "react";
import type { FarmAuditSettings } from "../../../../../api/utils/system_config";

interface AuditSettingsProps {
  settings: FarmAuditSettings;
  onChange: (field: keyof FarmAuditSettings, value: any) => void;
}

export const AuditSettings: React.FC<AuditSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateField = (field: keyof FarmAuditSettings, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
            Audit Retention Days
          </label>
          <input
            type="number"
            value={settings.auditRetentionDays || 365}
            onChange={(e) =>
              updateField("auditRetentionDays", parseInt(e.target.value) || 365)
            }
            className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--border-color)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.logActionsEnabled !== false}
            onChange={(e) => updateField("logActionsEnabled", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Log Actions Enabled</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.enableRealTimeLogging || false}
            onChange={(e) => updateField("enableRealTimeLogging", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Enable Real-time Logging</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={settings.notifyOnCriticalEvents || false}
            onChange={(e) => updateField("notifyOnCriticalEvents", e.target.checked)}
            className="rounded border-[var(--border-color)] text-[var(--primary-color)] focus:ring-[var(--primary-color)]"
          />
          <span className="text-sm text-[var(--text-secondary)]">Notify on Critical Events</span>
        </label>
      </div>
    </div>
  );
};