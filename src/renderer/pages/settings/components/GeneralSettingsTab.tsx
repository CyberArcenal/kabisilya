// src/renderer/pages/settings/components/GeneralSettingsTab.tsx
import React, { useState } from "react";
import Button from "../../../components/UI/Button";
import type { GeneralSettings } from "../types";

interface Props {
  settings: GeneralSettings;
  onUpdate: (settings: Partial<GeneralSettings>) => void;
}

const GeneralSettingsTab: React.FC<Props> = ({ settings, onUpdate }) => {
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      onUpdate(form);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Farm Name</label>
        <input
          type="text"
          value={form.farmName}
          onChange={(e) => setForm({ ...form, farmName: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Default Rate per Luwang (₱)</label>
        <input
          type="number"
          step="0.01"
          value={form.defaultRatePerLuwang}
          onChange={(e) => setForm({ ...form, defaultRatePerLuwang: parseFloat(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]"
          style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
        />
      </div>

      <div className="border-t border-[var(--border-color)] pt-4">
        <h3 className="text-md font-semibold text-[var(--text-primary)] mb-3">Penalty Settings</h3>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enableAutoPenalty}
              onChange={(e) => setForm({ ...form, enableAutoPenalty: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-[var(--text-primary)]">Enable automatic penalty calculation</span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Penalty Rate (%)</label>
              <input
                type="number"
                step="0.1"
                value={form.penaltyRate}
                onChange={(e) => setForm({ ...form, penaltyRate: parseFloat(e.target.value) })}
                disabled={!form.enableAutoPenalty}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Grace Period (days)</label>
              <input
                type="number"
                value={form.penaltyGraceDays}
                onChange={(e) => setForm({ ...form, penaltyGraceDays: parseInt(e.target.value) })}
                disabled={!form.enableAutoPenalty}
                className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] disabled:opacity-50"
                style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--input-border)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
      </div>
    </form>
  );
};

export default GeneralSettingsTab;