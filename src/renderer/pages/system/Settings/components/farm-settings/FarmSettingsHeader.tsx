// src/renderer/pages/system/settings/components/FarmSettingsHeader.tsx
import React, { useRef } from "react";
import { Save, RotateCcw, Download, Upload, Loader2 } from "lucide-react";

interface Props {
  onSave: () => void;
  onReset: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saving: boolean;
  hasChanges: boolean;
}

const FarmSettingsHeader: React.FC<Props> = ({
  onSave,
  onReset,
  onExport,
  onImport,
  saving,
  hasChanges,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-[var(--card-bg)] border border-[var(--border-color)]/20 rounded-lg">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Farm Management Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Configure farm operations, financial rules, and system behavior
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleImportClick}
          className="windows-button windows-button-secondary flex items-center gap-2 px-4 py-2 text-sm"
          title="Import settings from JSON file"
        >
          <Upload className="w-4 h-4" />
          Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImport}
          accept=".json,application/json"
          className="hidden"
        />

        <button
          onClick={onExport}
          className="windows-button windows-button-secondary flex items-center gap-2 px-4 py-2 text-sm"
          title="Export settings to JSON file"
        >
          <Download className="w-4 h-4" />
          Export
        </button>

        <button
          onClick={onReset}
          disabled={!hasChanges || saving}
          className={`windows-button windows-button-secondary flex items-center gap-2 px-4 py-2 text-sm ${
            !hasChanges || saving ? "opacity-50 cursor-not-allowed" : ""
          }`}
          title="Reset to original values"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </button>

        <button
          onClick={onSave}
          disabled={!hasChanges || saving}
          className={`windows-button windows-button-primary flex items-center gap-2 px-6 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default FarmSettingsHeader;