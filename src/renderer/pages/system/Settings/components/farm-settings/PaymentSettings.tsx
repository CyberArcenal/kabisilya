import React from "react";
import type { FarmPaymentSettings } from "../../../../../api/utils/system_config";

interface PaymentSettingsProps {
  settings: FarmPaymentSettings;
  onChange: (field: keyof FarmPaymentSettings, value: any) => void;
}

export const PaymentSettings: React.FC<PaymentSettingsProps> = ({
  settings,
  onChange,
}) => {
  const updateField = (field: keyof FarmPaymentSettings, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Payment Configuration</h3>
      <div className="max-w-md">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Rate per Luwang (₱)
        </label>
        <input
          type="number"
          step="0.01"
          value={settings.rate_per_luwang || 0}
          onChange={(e) => updateField("rate_per_luwang", parseFloat(e.target.value) || 0)}
          className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">
          Base rate used for computing worker payments per luwang
        </p>
      </div>
    </div>
  );
};