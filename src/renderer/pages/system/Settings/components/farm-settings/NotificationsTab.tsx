// src/renderer/pages/system/settings/components/farm-settings/NotificationsTab.tsx
import React, { useState } from "react";
import type { FarmNotificationsSettings } from "../../../../../api/utils/system_config";
import Switch from "../../../../../components/UI/Switch";
import { dialogs } from "../../../../../utils/dialogs";
import Button from "../../../../../components/UI/Button";

interface Props {
  settings: FarmNotificationsSettings;
  onChange: (field: keyof FarmNotificationsSettings, value: any) => void;
}

const NotificationsSettings: React.FC<Props> = ({ settings, onChange }) => {
  const [testing, setTesting] = useState<"smtp" | "sms" | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const testSMTP = async () => {
    setTesting("smtp");
    setTestResult(null);
    try {
      if (!window.backendAPI?.systemConfig) throw new Error("Electron API not available");
      const response = await window.backendAPI.systemConfig({
        method: "testSmtpConnection",
        params: { settings },
      });
      setTestResult({
        success: response.status,
        message: response.message || (response.status ? "SMTP connection successful" : "SMTP connection failed"),
      });
      if (response.status) dialogs.success("SMTP connection successful");
      else dialogs.error(response.message || "SMTP connection failed");
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to test SMTP connection" });
      dialogs.error(err.message || "Failed to test SMTP connection");
    } finally {
      setTesting(null);
    }
  };

  const testSMS = async () => {
    setTesting("sms");
    setTestResult(null);
    try {
      if (!window.backendAPI?.systemConfig) throw new Error("Electron API not available");
      const response = await window.backendAPI.systemConfig({
        method: "testSmsConnection",
        params: { settings },
      });
      setTestResult({
        success: response.status,
        message: response.message || (response.status ? "SMS connection successful" : "SMS connection failed"),
      });
      if (response.status) dialogs.success("SMS connection successful");
      else dialogs.error(response.message || "SMS connection failed");
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Failed to test SMS connection" });
      dialogs.error(err.message || "Failed to test SMS connection");
    } finally {
      setTesting(null);
    }
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-[var(--text-primary)]">Notification Settings</h3>

      {/* General toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center">
          <Switch
            checked={settings.email_enabled || false}
            onChange={(checked) => onChange("email_enabled", checked)}
          />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">Enable Email Notifications</span>
        </div>
        <div className="flex items-center">
          <Switch
            checked={settings.sms_enabled || false}
            onChange={(checked) => onChange("sms_enabled", checked)}
          />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">Enable SMS Notifications</span>
        </div>
        <div className="flex items-center">
          <Switch
            checked={settings.notify_on_payment || false}
            onChange={(checked) => onChange("notify_on_payment", checked)}
          />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">Notify debtor on payment received</span>
        </div>
        <div className="flex items-center">
          <Switch
            checked={settings.notify_on_penalty || false}
            onChange={(checked) => onChange("notify_on_penalty", checked)}
          />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">Notify debtor when penalty is applied</span>
        </div>
        <div className="flex items-center">
          <Switch
            checked={(settings.reminder_days_before_due?.length ?? 0) > 0}
            onChange={(checked) => {
              if (checked) {
                onChange("reminder_days_before_due", [7, 3, 1]);
              } else {
                onChange("reminder_days_before_due", []);
              }
            }}
          />
          <span className="ml-3 text-sm text-[var(--text-secondary)]">Send overdue reminders</span>
        </div>
      </div>

      {/* Reminder days input */}
      <div className="max-w-sm">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Reminder Days Before Due
        </label>
        <input
          type="text"
          value={Array.isArray(settings.reminder_days_before_due) ? settings.reminder_days_before_due.join(", ") : ""}
          onChange={(e) => {
            const days = e.target.value
              .split(",")
              .map((d) => parseInt(d.trim(), 10))
              .filter((d) => !isNaN(d));
            onChange("reminder_days_before_due", days);
          }}
          className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
          placeholder="e.g., 7, 3, 1"
        />
        <p className="text-xs text-[var(--text-tertiary)] mt-1">Comma separated list of days before due date to send reminders</p>
      </div>

      <div className="max-w-sm">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">
          Overdue Notification Frequency
        </label>
        <select
          value={settings.overdue_notification_frequency || "daily"}
          onChange={(e) => onChange("overdue_notification_frequency", e.target.value as "daily" | "weekly")}
          className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>

      {/* Email SMTP Settings */}
      <div className="border-t border-[var(--border-color)] pt-6">
        <h4 className="text-md font-medium text-[var(--text-primary)] mb-4">Email (SMTP) Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SMTP Host</label>
            <input
              type="text"
              value={settings.email_smtp_host || ""}
              onChange={(e) => onChange("email_smtp_host", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="smtp.gmail.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SMTP Port</label>
            <input
              type="number"
              value={settings.email_smtp_port || 587}
              onChange={(e) => onChange("email_smtp_port", parseInt(e.target.value, 10) || 0)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="587"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">From Address</label>
            <input
              type="email"
              value={settings.email_from_address || ""}
              onChange={(e) => onChange("email_from_address", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="noreply@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SMTP Username</label>
            <input
              type="text"
              value={settings.email_smtp_username || ""}
              onChange={(e) => onChange("email_smtp_username", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="user@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SMTP Password</label>
            <input
              type="password"
              value={settings.email_smtp_password || ""}
              onChange={(e) => onChange("email_smtp_password", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-end justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={testSMTP}
              disabled={testing === "smtp"}
            >
              {testing === "smtp" ? "Testing..." : "Test SMTP"}
            </Button>
          </div>
        </div>
      </div>

      {/* SMS (Twilio) Settings */}
      <div className="border-t border-[var(--border-color)] pt-6">
        <h4 className="text-md font-medium text-[var(--text-primary)] mb-4">SMS (Twilio) Settings</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">SMS Provider</label>
            <input
              type="text"
              value={settings.sms_provider || "twilio"}
              onChange={(e) => onChange("sms_provider", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="twilio"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Account SID</label>
            <input
              type="text"
              value={settings.twilio_account_sid || ""}
              onChange={(e) => onChange("twilio_account_sid", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Auth Token</label>
            <input
              type="password"
              value={settings.twilio_auth_token || ""}
              onChange={(e) => onChange("twilio_auth_token", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Phone Number</label>
            <input
              type="text"
              value={settings.twilio_phone_number || ""}
              onChange={(e) => onChange("twilio_phone_number", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Messaging Service SID</label>
            <input
              type="text"
              value={settings.twilio_messaging_service_sid || ""}
              onChange={(e) => onChange("twilio_messaging_service_sid", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-[var(--input-bg)] border-[var(--input-border)] text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--primary-color)] focus:outline-none"
            />
          </div>
          <div className="flex items-end justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={testSMS}
              disabled={testing === "sms"}
            >
              {testing === "sms" ? "Testing..." : "Test SMS"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettings;