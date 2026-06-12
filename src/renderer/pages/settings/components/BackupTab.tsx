// src/renderer/pages/settings/components/BackupTab.tsx
import React from "react";
import { Download, Trash2, Database, Clock } from "lucide-react";
import Button from "../../../components/UI/Button";
import type { BackupFile } from "../types";

interface Props {
  backups: BackupFile[];
  onCreateBackup: () => void;
  onDownloadBackup: (backup: BackupFile) => void;
  onDeleteBackup: (name: string) => void;
  onCleanupBackups: () => void;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const BackupTab: React.FC<Props> = ({
  backups,
  onCreateBackup,
  onDownloadBackup,
  onDeleteBackup,
  onCleanupBackups,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <Button variant="primary" size="sm" icon={Database} onClick={onCreateBackup}>
          Create New Backup
        </Button>
        <Button variant="secondary" size="sm" icon={Clock} onClick={onCleanupBackups}>
          Cleanup Old Backups
        </Button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)]">
        <table className="w-full text-sm">
          <thead className="bg-[var(--card-secondary-bg)] border-b border-[var(--border-color)]">
            <tr>
              <th className="text-left py-3 px-4">File Name</th>
              <th className="text-left py-3 px-4">Size</th>
              <th className="text-left py-3 px-4">Created At</th>
              <th className="text-left py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {backups.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-[var(--text-tertiary)]">No backups available</td>
              </tr>
            ) : (
              backups.map((backup) => (
                <tr key={backup.name} className="border-b border-[var(--border-color)] hover:bg-[var(--card-hover-bg)] transition-colors">
                  <td className="py-2.5 px-4 font-mono text-sm">{backup.name}</td>
                  <td className="py-2.5 px-4">{formatFileSize(backup.size)}</td>
                  <td className="py-2.5 px-4">{new Date(backup.createdAt).toLocaleString()}</td>
                  <td className="py-2.5 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => onDownloadBackup(backup)} className="p-1 rounded hover:bg-[var(--card-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--primary-color)]" title="Download">
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={() => onDeleteBackup(backup.name)} className="p-1 rounded hover:bg-red-500/20 text-[var(--text-secondary)] hover:text-red-500" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BackupTab;