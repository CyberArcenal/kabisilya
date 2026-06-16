// src/renderer/pages/system/settings/index.tsx
import React, { useState, useEffect } from "react";
import { Save, RotateCcw, Download, Upload, Settings } from "lucide-react";
import Button from "../../../components/UI/Button";
import { useFarmManagementSettings } from "./hooks/useFarmManagementSettings";
import { SessionSettings } from "./components/farm-settings/SessionSettings";
import { BukidSettings } from "./components/farm-settings/BukidSettings";
import { PitakSettings } from "./components/farm-settings/PitakSettings";
import { AssignmentSettings } from "./components/farm-settings/AssignmentSettings";
import { PaymentSettings } from "./components/farm-settings/PaymentSettings";
import { DebtSettings } from "./components/farm-settings/DebtSettings";
import { AuditSettings } from "./components/farm-settings/AuditSettings";
import NotificationsSettings from "./components/farm-settings/NotificationsTab";
import CreateSessionModal from "../sessions/components/CreateSessionModal";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import systemConfigAPI from "../../../api/utils/system_config";
import FarmSettingsHeader from "./components/farm-settings/FarmSettingsHeader";
import FarmSettingsTabs from "./components/farm-settings/FarmSettingsTabs";

type TabKey = "session" | "bukid" | "pitak" | "assignment" | "payment" | "debt" | "audit" | "notifications";

const FarmManagementSettingsPage: React.FC = () => {
  const sessionFormDialog = useModal();
  const [activeTab, setActiveTab] = useState<TabKey>("session");

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4" />
          <p className="text-[var(--text-secondary)]">Loading farm settings...</p>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  return (
    <div className="p-6 space-y-6 animate-fadeIn">
      {/* Header with actions */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
            <Settings className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Farm Settings
            </h1>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Configure farm management modules and system preferences
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={Download}
            onClick={handleExport}
          >
            Export
          </Button>
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
            <Button variant="secondary" size="sm" icon={Upload} as="span">
              Import
            </Button>
          </label>
          <Button
            variant="danger"
            size="sm"
            icon={RotateCcw}
            onClick={resetToDefaults}
            disabled={saving}
          >
            Reset
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Save}
            onClick={saveSettings}
            loading={saving}
            disabled={!hasChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <FarmSettingsTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Content */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-sm p-6 transition-all">
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