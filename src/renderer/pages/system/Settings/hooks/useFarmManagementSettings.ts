// src/renderer/pages/system/settings/hooks/useFarmManagementSettings.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import systemConfigAPI, {
  type FarmSessionSettings,
  type FarmBukidSettings,
  type FarmPitakSettings,
  type FarmAssignmentSettings,
  type FarmPaymentSettings,
  type FarmDebtSettings,
  type FarmAuditSettings,
  type FarmNotificationsSettings,
} from "../../../../api/utils/system_config";
import { useSettings } from "../../../../contexts/SettingsContext";
import { dialogs } from "../../../../utils/dialogs";

// Default values for each farm category
const DEFAULT_FARM_SESSION: FarmSessionSettings = {};
const DEFAULT_FARM_BUKID: FarmBukidSettings = {};
const DEFAULT_FARM_PITAK: FarmPitakSettings = {};
const DEFAULT_FARM_ASSIGNMENT: FarmAssignmentSettings = {};
const DEFAULT_FARM_PAYMENT: FarmPaymentSettings = {};
const DEFAULT_FARM_DEBT: FarmDebtSettings = {};
const DEFAULT_FARM_AUDIT: FarmAuditSettings = {};
const DEFAULT_NOTIFICATION: FarmNotificationsSettings = {
  email_enabled: false,
  email_smtp_host: "",
  email_smtp_port: 587,
  email_from_address: "",
  email_smtp_username: "",
  email_smtp_password: "",
  sms_enabled: false,
  sms_provider: "twilio",
  reminder_days_before_due: [7, 3, 1],
  overdue_notification_frequency: "daily",
  notify_on_payment: true,
  notify_on_penalty: true,
  twilio_account_sid: "",
  twilio_auth_token: "",
  twilio_phone_number: "",
  twilio_messaging_service_sid: "",
};

const DEFAULTS = {
  farm_session: DEFAULT_FARM_SESSION,
  farm_bukid: DEFAULT_FARM_BUKID,
  farm_pitak: DEFAULT_FARM_PITAK,
  farm_assignment: DEFAULT_FARM_ASSIGNMENT,
  farm_payment: DEFAULT_FARM_PAYMENT,
  farm_debt: DEFAULT_FARM_DEBT,
  farm_audit: DEFAULT_FARM_AUDIT,
  notification: DEFAULT_NOTIFICATION,
};

// Allowed keys per category (must be strings)
const ALLOWED_KEYS: Record<keyof typeof DEFAULTS, string[]> = {
  farm_session: [
    "default_session_id",
    "season_type",
    "year",
    "start_date",
    "end_date",
    "status",
    "notes",
    "require_default_session",
  ],
  farm_bukid: [
    "name_format",
    "enable_location_descriptor",
    "default_status",
    "location_required",
    "max_bukid_per_session",
  ],
  farm_pitak: ["require_location"],
  farm_assignment: [
    "default_luwang_per_worker",
    "date_behavior",
    "status_options",
    "enable_notes_remarks",
  ],
  farm_payment: ["rate_per_luwang"],
  farm_debt: [
    "debt_allocation_strategy",
    "default_interest_rate",
    "payment_term_days",
    "grace_period_days",
    "debt_limit",
    "require_debt_reason",
    "auto_apply_interest",
  ],
  farm_audit: [
    "logActionsEnabled",
    "auditRetentionDays",
    "enableRealTimeLogging",
    "notifyOnCriticalEvents",
  ],
  notification: [
    "email_enabled",
    "email_smtp_host",
    "email_smtp_port",
    "email_from_address",
    "email_smtp_username",
    "email_smtp_password",
    "sms_enabled",
    "sms_provider",
    "reminder_days_before_due",
    "overdue_notification_frequency",
    "notify_on_payment",
    "notify_on_penalty",
    "twilio_account_sid",
    "twilio_auth_token",
    "twilio_phone_number",
    "twilio_messaging_service_sid",
  ],
};

function sanitizeSettings<T extends Record<string, any>>(
  obj: T,
  allowedKeys: string[],
): Partial<T> {
  const result: Partial<T> = {};
  for (const key of allowedKeys) {
    if (key in obj) {
      result[key as keyof T] = obj[key];
    }
  }
  return result;
}

export const useFarmManagementSettings = () => {
  const { refreshSettings } = useSettings();
  const [settings, setSettings] = useState(DEFAULTS);
  const [originalSettings, setOriginalSettings] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await systemConfigAPI.getGroupedConfig();
      if (response.status && response.data?.grouped_settings) {
        const grouped = response.data.grouped_settings;
        setSettings({
          farm_session: { ...DEFAULTS.farm_session, ...grouped.farm_session },
          farm_bukid: { ...DEFAULTS.farm_bukid, ...grouped.farm_bukid },
          farm_pitak: { ...DEFAULTS.farm_pitak, ...grouped.farm_pitak },
          farm_assignment: { ...DEFAULTS.farm_assignment, ...grouped.farm_assignment },
          farm_payment: { ...DEFAULTS.farm_payment, ...grouped.farm_payment },
          farm_debt: { ...DEFAULTS.farm_debt, ...grouped.farm_debt },
          farm_audit: { ...DEFAULTS.farm_audit, ...grouped.farm_audit },
          notification: { ...DEFAULTS.notification, ...grouped.notification },
        });
        setOriginalSettings({
          farm_session: { ...DEFAULTS.farm_session, ...grouped.farm_session },
          farm_bukid: { ...DEFAULTS.farm_bukid, ...grouped.farm_bukid },
          farm_pitak: { ...DEFAULTS.farm_pitak, ...grouped.farm_pitak },
          farm_assignment: { ...DEFAULTS.farm_assignment, ...grouped.farm_assignment },
          farm_payment: { ...DEFAULTS.farm_payment, ...grouped.farm_payment },
          farm_debt: { ...DEFAULTS.farm_debt, ...grouped.farm_debt },
          farm_audit: { ...DEFAULTS.farm_audit, ...grouped.farm_audit },
          notification: { ...DEFAULTS.notification, ...grouped.notification },
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load farm settings");
      dialogs.error(err.message || "Failed to load farm settings");
    } finally {
      setLoading(false);
    }
  };

  // Generic field updater
  const updateCategoryField = useCallback(
    <C extends keyof typeof DEFAULTS>(category: C, field: keyof (typeof DEFAULTS)[C], value: any) => {
      setSettings((prev) => ({
        ...prev,
        [category]: {
          ...prev[category],
          [field]: value,
        },
      }));
    },
    [],
  );

  // Category-specific updaters
  const updateFarmSession = (field: keyof FarmSessionSettings, value: any) =>
    updateCategoryField("farm_session", field, value);
  const updateFarmBukid = (field: keyof FarmBukidSettings, value: any) =>
    updateCategoryField("farm_bukid", field, value);
  const updateFarmPitak = (field: keyof FarmPitakSettings, value: any) =>
    updateCategoryField("farm_pitak", field, value);
  const updateFarmAssignment = (field: keyof FarmAssignmentSettings, value: any) =>
    updateCategoryField("farm_assignment", field, value);
  const updateFarmPayment = (field: keyof FarmPaymentSettings, value: any) =>
    updateCategoryField("farm_payment", field, value);
  const updateFarmDebt = (field: keyof FarmDebtSettings, value: any) =>
    updateCategoryField("farm_debt", field, value);
  const updateFarmAudit = (field: keyof FarmAuditSettings, value: any) =>
    updateCategoryField("farm_audit", field, value);
  const updateFarmNotifications = (field: keyof FarmNotificationsSettings, value: any) =>
    updateCategoryField("notification", field, value);

  // Save all settings
  const saveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const combinedConfig: Record<string, any> = {};
    const categories = Object.keys(DEFAULTS) as Array<keyof typeof DEFAULTS>;

    for (const category of categories) {
      const categoryData = settings[category];
      if (!categoryData || typeof categoryData !== "object") continue;

      const dataToSend = sanitizeSettings(categoryData, ALLOWED_KEYS[category]);
      // Filter out any numeric keys (safety)
      const filtered: Record<string, any> = {};
      for (const [key, value] of Object.entries(dataToSend)) {
        // Only allow string keys that are not pure numbers
        if (typeof key === "string" && !/^\d+$/.test(key)) {
          filtered[key] = value;
        } else {
          console.warn(`Skipping invalid key "${key}" in category "${category}"`);
        }
      }

      if (Object.keys(filtered).length > 0) {
        combinedConfig[category] = filtered;
      }
    }

    // Debug: log what we are sending
    console.log("Saving farm settings payload:", combinedConfig);

    try {
      const response = await systemConfigAPI.updateGroupedConfig(combinedConfig);
      if (response.status) {
        setSuccessMessage("Farm settings saved successfully");
        // await dialogs.success("Farm settings saved successfully");
        await fetchSettings();
        await refreshSettings();
      } else {
        throw new Error(response.message || "Failed to save farm settings");
      }
    } catch (err: any) {
      setError(err.message || "Failed to save farm settings");
      dialogs.error(err.message || "Failed to save farm settings");
    } finally {
      setSaving(false);
    }
  };

  const resetToDefaults = async () => {
    const confirmed = await dialogs.confirm({
      title: "Reset Farm Settings",
      message: "Are you sure you want to reset all farm settings to default values? This cannot be undone.",
      confirmText: "Reset",
      icon: "danger",
    });
    if (!confirmed) return;
    setLoading(true);
    try {
      await systemConfigAPI.resetToDefaults();
      setSuccessMessage("Farm settings reset to defaults");
      // dialogs.success("Farm settings reset to defaults");
      await fetchSettings();
      await refreshSettings();
    } catch (err: any) {
      setError(err.message || "Failed to reset farm settings");
      dialogs.error(err.message || "Failed to reset farm settings");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(originalSettings);
  }, [settings, originalSettings]);

  return {
    settings,
    loading,
    saving,
    error,
    successMessage,
    setError,
    setSuccessMessage,
    updateFarmSession,
    updateFarmBukid,
    updateFarmPitak,
    updateFarmAssignment,
    updateFarmPayment,
    updateFarmDebt,
    updateFarmAudit,
    updateFarmNotifications,
    saveSettings,
    resetToDefaults,
    refetch: fetchSettings,
    hasChanges,
  };
};