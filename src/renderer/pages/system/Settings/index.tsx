// src/renderer/pages/system/settings/index.tsx
import React, { useState, useEffect } from "react";
import { useFarmManagementSettings } from "./hooks/useFarmManagementSettings";
import { SessionSettings } from "./components/farm-settings/SessionSettings";
import { BukidSettings } from "./components/farm-settings/BukidSettings";
import { PitakSettings } from "./components/farm-settings/PitakSettings";
import { AssignmentSettings } from "./components/farm-settings/AssignmentSettings";
import { PaymentSettings } from "./components/farm-settings/PaymentSettings";
import { DebtSettings } from "./components/farm-settings/DebtSettings";
import { AuditSettings } from "./components/farm-settings/AuditSettings";
import CreateSessionModal from "../sessions/components/CreateSessionModal";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import systemConfigAPI from "../../../api/utils/system_config";
import FarmSettingsHeader from "./components/farm-settings/FarmSettingsHeader";
import FarmSettingsTabs from "./components/farm-settings/FarmSettingsTabs";
import NotificationsSettings from "./components/farm-settings/NotificationsTab";

const FarmManagementSettingsPage: React.FC = () => {
  const sessionFormDialog = useModal();
  const [activeTab, setActiveTab] = useState<"session" | "bukid" | "pitak" | "assignment" | "payment" | "debt" | "audit" | "notifications">("session");

  const {
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
    refetch,
    hasChanges,
  } = useFarmManagementSettings();

  useEffect(() => {
    if (successMessage) {
      dialogs.success(successMessage);
      setSuccessMessage(null);
    }
    if (error) {
      dialogs.error(error);
      setError(null);
    }
  }, [successMessage, error, setSuccessMessage, setError]);

  const handleExport = async () => {
    try {
      const jsonStr = await systemConfigAPI.exportSettingsToFile();
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `farm-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      dialogs.success("Settings exported successfully");
    } catch (err: any) {
      dialogs.error(err.message || "Failed to export settings");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const confirmed = await dialogs.confirm({
      title: "Import Settings",
      message: "Importing settings will overwrite current settings. Continue?",
      confirmText: "Import",
      icon: "warning",
    });
    if (!confirmed) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        await systemConfigAPI.importSettingsFromFile(content);
        dialogs.success("Settings imported successfully");
        await refetch();
      } catch (err: any) {
        dialogs.error(err.message || "Failed to import settings");
      }
    };
    reader.readAsText(file);
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading farm settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="space-y-6">
      <FarmSettingsHeader
        onSave={saveSettings}
        onReset={resetToDefaults}
        onExport={handleExport}
        onImport={handleImport}
        saving={saving}
        hasChanges={hasChanges}
      />

      <FarmSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]/20 p-6">
        {activeTab === "session" && (
          <SessionSettings
            settings={settings.farm_session}
            onChange={(field, value) => updateFarmSession(field, value)}
            onCreateSession={sessionFormDialog.open}
          />
        )}
        {activeTab === "bukid" && (
          <BukidSettings
            settings={settings.farm_bukid}
            onChange={(field, value) => updateFarmBukid(field, value)}
          />
        )}
        {activeTab === "pitak" && (
          <PitakSettings
            settings={settings.farm_pitak}
            onChange={(field, value) => updateFarmPitak(field, value)}
          />
        )}
        {activeTab === "assignment" && (
          <AssignmentSettings
            settings={settings.farm_assignment}
            onChange={(field, value) => updateFarmAssignment(field, value)}
          />
        )}
        {activeTab === "payment" && (
          <PaymentSettings
            settings={settings.farm_payment}
            onChange={(field, value) => updateFarmPayment(field, value)}
          />
        )}
        {activeTab === "debt" && (
          <DebtSettings
            settings={settings.farm_debt}
            onChange={(field, value) => updateFarmDebt(field, value)}
          />
        )}
        {activeTab === "audit" && (
          <AuditSettings
            settings={settings.farm_audit}
            onChange={(field, value) => updateFarmAudit(field, value)}
          />
        )}
        {activeTab === "notifications" && (
          <NotificationsSettings
            settings={settings.notification}
            onChange={(field, value) => updateFarmNotifications(field, value)}
          />
        )}
      </div>

      <CreateSessionModal
        isOpen={sessionFormDialog.isOpen}
        initialData={sessionFormDialog.initialData}
        onClose={sessionFormDialog.close}
        onSuccess={refetch}
      />
    </div>
  );
};

export default FarmManagementSettingsPage;