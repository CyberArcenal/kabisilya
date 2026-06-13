// src/renderer/pages/system/settings/index.tsx
import React, { useState, useEffect } from "react";
import {
  Save,
  RefreshCw,
  Download,
  Upload,
  AlertCircle,
  Settings,
  Calendar,
  MapPin,
  CreditCard,
  UserCheck,
  FileText,
  Shield,
} from "lucide-react";
import { useFarmManagementSettings } from "./hooks/useFarmManagementSettings";
import { SessionSettings } from "./components/farm-settings/SessionSettings";
import systemConfigAPI from "../../../api/utils/system_config";
import { PitakSettings } from "./components/farm-settings/PitakSettings";
import { AssignmentSettings } from "./components/farm-settings/AssignmentSettings";
import { PaymentSettings } from "./components/farm-settings/PaymentSettings";
import { DebtSettings } from "./components/farm-settings/DebtSettings";
import { AuditSettings } from "./components/farm-settings/AuditSettings";
import { BukidSettings } from "./components/farm-settings/BukidSettings";
import { useDefaultSessionId } from "../../../utils/config/farmConfig";
import sessionAPI from "../../../api/core/session";
import CreateSessionModal from "../sessions/components/CreateSessionModal";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";

const FarmManagementSettingsPage: React.FC = () => {
  const sessionFormDialog = useModal();
  const [activeTab, setActiveTab] = useState("session");
  const defaultSessionId = useDefaultSessionId();

  const {
    settings,
    loading,
    error,
    saving,
    saveSuccess,
    saveError,
    fetchSettings,
    updateSettings,
    updateFormSettings,
    resetForm,
    hasChanges,
  } = useFarmManagementSettings();

  useEffect(() => {
    if (saveSuccess) {
      dialogs.success("Farm settings saved successfully!");
    }
    if (saveError) {
      dialogs.error(`Failed to save settings: ${saveError}`);
    }
  }, [saveSuccess, saveError]);

  const handleSave = async () => {
    if (!settings) return;
    const oldDefaultId = defaultSessionId;
    const newDefaultId = settings.farm_session?.default_session_id;
    try {
      await updateSettings(settings);
      if (newDefaultId && newDefaultId !== oldDefaultId) {
        dialogs.info("Activating new default session...");
        try {
          await sessionAPI.updateStatus(newDefaultId, "active");
          dialogs.success("Default session activated");
        } catch (err) {
          console.error("Failed to activate session:", err);
          dialogs.error("Default session saved but activation failed");
        }
      }
    } catch (err) {
      console.error("Save error:", err);
      dialogs.error("Failed to save settings");
    }
  };

  const handleReset = () => {
    resetForm();
    dialogs.info("Settings reset to original values");
  };

  const handleRefresh = () => {
    fetchSettings();
    dialogs.info("Refreshing settings...");
  };

  const handleExport = async () => {
    try {
      const jsonData = await systemConfigAPI.exportSettingsToFile();
      const blob = new Blob([jsonData], { type: "application/json" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "farm-settings.json";
      a.click();
      dialogs.success("Settings exported successfully");
    } catch (error) {
      dialogs.error("Failed to export settings");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const confirmed = await dialogs.confirm({
      title: "Import Settings",
      message: "Importing settings will overwrite current settings. Continue?",
      confirmText: "Import",
      cancelText: "Cancel",
      icon: "warning",
    });
    if (confirmed) {
      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const jsonData = e.target?.result as string;
          await systemConfigAPI.importSettingsFromFile(jsonData);
          dialogs.success("Settings imported successfully");
          fetchSettings();
        };
        reader.readAsText(file);
      } catch (error) {
        dialogs.error("Failed to import settings");
      }
    }
  };

  const handleResetToDefaults = async () => {
    const confirmed = await dialogs.confirm({
      title: "Reset Settings",
      message: "Are you sure you want to reset all settings to defaults?",
      confirmText: "Reset",
      cancelText: "Cancel",
      icon: "danger",
    });
    if (confirmed) {
      try {
        await systemConfigAPI.resetToDefaults();
        dialogs.success("Settings reset to defaults");
        fetchSettings();
      } catch (error) {
        dialogs.error("Failed to reset settings");
      }
    }
  };

  if (loading && !settings) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-color)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Loading farm management settings...</p>
        </div>
      </div>
    );
  }

  if (error && !settings) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--danger-color)]" />
          <h2 className="text-2xl font-bold mb-2 text-[var(--text-primary)]">Failed to Load Settings</h2>
          <p className="mb-4 text-[var(--text-secondary)]">{error}</p>
          <button
            onClick={fetchSettings}
            className="px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg font-medium hover:bg-[var(--primary-hover)] transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!settings) return null;

  const tabs = [
    { id: "session", label: "Session Settings", icon: Calendar, color: "text-[var(--primary-color)]" },
    { id: "bukid", label: "Bukid Settings", icon: MapPin, color: "text-[var(--primary-color)]" },
    { id: "pitak", label: "Pitak Settings", icon: MapPin, color: "text-[var(--primary-color)]" },
    { id: "assignment", label: "Assignment Settings", icon: UserCheck, color: "text-[var(--primary-color)]" },
    { id: "payment", label: "Payment Settings", icon: CreditCard, color: "text-[var(--primary-color)]" },
    { id: "debt", label: "Debt Settings", icon: FileText, color: "text-[var(--primary-color)]" },
    { id: "audit", label: "Audit Settings", icon: Shield, color: "text-[var(--primary-color)]" },
  ];

  const handleCategoryChange = (category: string, field: string, value: any) => {
    updateFormSettings(category as any, { [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-[var(--text-primary)]">
            <Settings className="w-8 h-8 text-[var(--primary-color)]" />
            Farm Management Settings
          </h1>
          <p className="text-[var(--text-secondary)] mt-2">
            Configure farm operations, financial rules, and system behavior
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="p-2 rounded-lg border border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors text-[var(--text-primary)]"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-hover-bg)] flex items-center gap-2 transition-colors text-[var(--text-primary)]"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <label className="px-4 py-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-hover-bg)] flex items-center gap-2 cursor-pointer transition-colors text-[var(--text-primary)]">
            <Upload className="w-4 h-4" /> Import
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button
            onClick={handleReset}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-2 transition-colors ${!hasChanges || saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 bg-[var(--primary-color)] text-white rounded-lg hover:bg-[var(--primary-hover)] flex items-center gap-2 transition-colors ${!hasChanges || saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="p-4 bg-[var(--card-secondary-bg)] border border-[var(--border-color)] rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-[var(--primary-color)]" />
            <span className="text-sm text-[var(--text-secondary)]">
              <strong>Note:</strong> Changes affect all farm operations
            </span>
          </div>
          <div className="text-sm">
            <span className={`font-medium ${hasChanges ? "text-[var(--success-color)]" : "text-[var(--text-tertiary)]"}`}>
              {hasChanges ? "✓ You have unsaved changes" : "No changes detected"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-[var(--border-color)]">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? `${tab.color} border-current`
                      : "text-[var(--text-tertiary)] border-transparent hover:text-[var(--text-secondary)]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "session" && (
            <SessionSettings
              settings={settings.farm_session}
              onChange={(field, value) => handleCategoryChange("farm_session", field, value)}
              onCreateSession={() => sessionFormDialog.open()}
            />
          )}
          {activeTab === "bukid" && (
            <BukidSettings
              settings={settings.farm_bukid}
              onChange={(field, value) => handleCategoryChange("farm_bukid", field, value)}
            />
          )}
          {activeTab === "pitak" && (
            <PitakSettings
              settings={settings.farm_pitak}
              onChange={(field, value) => handleCategoryChange("farm_pitak", field, value)}
            />
          )}
          {activeTab === "assignment" && (
            <AssignmentSettings
              settings={settings.farm_assignment}
              onChange={(field, value) => handleCategoryChange("farm_assignment", field, value)}
            />
          )}
          {activeTab === "payment" && (
            <PaymentSettings
              settings={settings.farm_payment}
              onChange={(field, value) => handleCategoryChange("farm_payment", field, value)}
            />
          )}
          {activeTab === "debt" && (
            <DebtSettings
              settings={settings.farm_debt}
              onChange={(field, value) => handleCategoryChange("farm_debt", field, value)}
            />
          )}
          {activeTab === "audit" && (
            <AuditSettings
              settings={settings.farm_audit}
              onChange={(field, value) => handleCategoryChange("farm_audit", field, value)}
            />
          )}
        </div>
      </div>

      {/* Session Form Dialog */}
      <CreateSessionModal
        isOpen={sessionFormDialog.isOpen}
        initialData={sessionFormDialog.initialData}
        onClose={sessionFormDialog.close}
        onSuccess={fetchSettings}
      />
    </div>
  );
};

export default FarmManagementSettingsPage;