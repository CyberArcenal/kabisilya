// src/renderer/pages/settings/index.tsx
import React, { useState } from "react";
import { useSettings } from "./hooks/useSettings";
import GeneralSettingsTab from "./components/GeneralSettingsTab";
import UserManagementTab from "./components/UserManagementTab";
import BackupTab from "./components/BackupTab";
import ThemeTab from "./components/ThemeTab";

type TabId = "general" | "users" | "backup" | "theme";

const tabs: { id: TabId; label: string }[] = [
  { id: "general", label: "General" },
  { id: "users", label: "User Management" },
  { id: "backup", label: "Backup" },
  { id: "theme", label: "Theme" },
];

const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>("general");
  const {
    generalSettings,
    users,
    backups,
    userModal,
    editingUser,
    updateGeneralSettings,
    handleCreateUser,
    handleUpdateUser,
    handleDeleteUser,
    handleToggleUserActive,
    handleCreateBackup,
    handleDownloadBackup,
    handleDeleteBackup,
    handleCleanupBackups,
    openEditUserModal,
    openAddUserModal,
  } = useSettings();

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Farm Management Settings</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure system, users, backups, and appearance</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-[var(--border-color)] mt-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium transition-all relative ${
              activeTab === tab.id
                ? "text-[var(--primary-color)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary-color)] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "general" && (
          <GeneralSettingsTab settings={generalSettings} onUpdate={updateGeneralSettings} />
        )}
        {activeTab === "users" && (
          <UserManagementTab
            users={users}
            onAdd={openAddUserModal}
            onEdit={openEditUserModal}
            onDelete={handleDeleteUser}
            onToggleActive={handleToggleUserActive}
            editingUser={editingUser}
            userModalOpen={userModal.isOpen}
            onUserModalClose={userModal.close}
            onCreateUser={handleCreateUser}
            onUpdateUser={handleUpdateUser}
          />
        )}
        {activeTab === "backup" && (
          <BackupTab
            backups={backups}
            onCreateBackup={handleCreateBackup}
            onDownloadBackup={handleDownloadBackup}
            onDeleteBackup={handleDeleteBackup}
            onCleanupBackups={handleCleanupBackups}
          />
        )}
        {activeTab === "theme" && <ThemeTab />}
      </div>
    </div>
  );
};

export default SettingsPage;