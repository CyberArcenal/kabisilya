// src/components/Modals/SessionSelectorModal.tsx
import React, { useEffect, useState } from "react";
import Modal from "../UI/Modal";
import Button from "../UI/Button";
import SessionSelect from "../Selects/SessionSelect";
import { dialogs } from "../../utils/dialogs";
import { AlertCircle } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";

interface SessionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SessionSelectorModal: React.FC<SessionSelectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { updateSetting, refreshSettings } = useSettings();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [activating, setActivating] = useState(false);
  const [loadingDefault, setLoadingDefault] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadDefault = async () => {
        setLoadingDefault(true);
        try {
          // Kunin ang kasalukuyang default session ID mula sa API
          const settingsRes = await window.backendAPI.systemConfig({
            method: "getSettingByKey",
            params: { key: "default_session_id", settingType: "farm_session" }
          });
          let defaultId: number | null = null;
          if (settingsRes.status && settingsRes.data) {
            defaultId = Number(settingsRes.data.value);
          }
          setSelectedId(defaultId);
        } catch (error) {
          console.error("Failed to load default session:", error);
        } finally {
          setLoadingDefault(false);
        }
      };
      loadDefault();
    } else {
      setSelectedId(null);
    }
  }, [isOpen]);

  const handleActivate = async () => {
    if (!selectedId) {
      dialogs.warning("Please select a session first.");
      return;
    }
    setActivating(true);
    try {
      await updateSetting("farm_session", "default_session_id", selectedId, "Current active session");
      await refreshSettings();
      dialogs.success("Session activated successfully! Reloading...");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error: any) {
      console.error("Activation error:", error);
      dialogs.error(error.message || "Failed to activate session");
    } finally {
      setActivating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Active Session"
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            onClick={handleActivate}
            disabled={!selectedId || activating || loadingDefault}
            loading={activating}
          >
            {activating ? "Activating..." : "Activate Session"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-secondary)]">
          Choose a farming session to set as default. This will be used throughout the app for assignments, payments, and debts.
        </p>
        {loadingDefault ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--primary-color)]"></div>
          </div>
        ) : (
          <SessionSelect
            value={selectedId}
            onChange={(id) => setSelectedId(id)}
            placeholder="Search or select a session..."
            onlyActive={false}
          />
        )}
        {!loadingDefault && !selectedId && (
          <div className="flex items-center gap-2 text-amber-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>No session selected. Please choose one.</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default SessionSelectorModal;