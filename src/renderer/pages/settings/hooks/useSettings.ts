// src/renderer/pages/settings/hooks/useSettings.ts
import { useState, useEffect, useCallback } from "react";
import { useModal } from "../../../hooks/useModal";
import { dialogs } from "../../../utils/dialogs";
import type { User, BackupFile, GeneralSettings } from "../types";

// Mock data - replace with actual API calls later
const mockUsers: User[] = [
  { id: 1, username: "admin", email: "admin@kabisilya.com", fullName: "System Admin", role: "admin", isActive: true, createdAt: "2024-01-01T00:00:00Z" },
  { id: 2, username: "manager1", email: "manager@kabisilya.com", fullName: "Farm Manager", role: "manager", isActive: true, createdAt: "2024-01-15T00:00:00Z" },
  { id: 3, username: "viewer1", email: "viewer@kabisilya.com", fullName: "Data Viewer", role: "viewer", isActive: false, createdAt: "2024-02-01T00:00:00Z" },
];

const mockBackups: BackupFile[] = [
  { name: "backup-2024-06-10.db", size: 10485760, createdAt: "2024-06-10T10:30:00Z" },
  { name: "backup-2024-06-09.db", size: 10485760, createdAt: "2024-06-09T23:00:00Z" },
  { name: "backup-2024-06-08.db", size: 10485760, createdAt: "2024-06-08T15:45:00Z" },
];

export const useSettings = () => {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    farmName: "Kabisilya Farm",
    defaultRatePerLuwang: 500,
    enableAutoPenalty: true,
    penaltyRate: 5,
    penaltyGraceDays: 7,
  });
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [backups, setBackups] = useState<BackupFile[]>(mockBackups);
  const [loading, setLoading] = useState(false);

  const userModal = useModal();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Theme is handled by ThemeContext, not stored in this hook

  const updateGeneralSettings = async (settings: Partial<GeneralSettings>) => {
    setGeneralSettings(prev => ({ ...prev, ...settings }));
    // TODO: Call API to save settings
  };

  const handleCreateUser = (userData: Omit<User, "id" | "createdAt">) => {
    const newUser: User = {
      ...userData,
      id: Math.max(...users.map(u => u.id), 0) + 1,
      createdAt: new Date().toISOString(),
    };
    setUsers(prev => [...prev, newUser]);
    userModal.close();
    setEditingUser(null);
  };

  const handleUpdateUser = (id: number, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
    userModal.close();
    setEditingUser(null);
  };

  const handleDeleteUser = async (id: number) => {
    const confirmed = await dialogs.confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
    });
    if (confirmed) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  const handleToggleUserActive = (id: number) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  const handleCreateBackup = async () => {
    // TODO: Call backend to create backup
    const newBackup: BackupFile = {
      name: `backup-${new Date().toISOString().slice(0, 10)}.db`,
      size: 10485760,
      createdAt: new Date().toISOString(),
    };
    setBackups(prev => [newBackup, ...prev]);
    dialogs.alert({ title: "Backup Created", message: "Backup created successfully" });
  };

  const handleDownloadBackup = async (backup: BackupFile) => {
    // TODO: Download file from backend
    dialogs.alert({ title: "Download", message: `Downloading ${backup.name}` });
  };

  const handleDeleteBackup = async (backupName: string) => {
    const confirmed = await dialogs.confirm({
      title: "Delete Backup",
      message: `Are you sure you want to delete ${backupName}?`,
    });
    if (confirmed) {
      setBackups(prev => prev.filter(b => b.name !== backupName));
    }
  };

  const handleCleanupBackups = async () => {
    const days = await dialogs.prompt({ title: "Cleanup Backups", message: "Keep backups from last how many days?", defaultValue: "30" });
    if (days) {
      const daysNum = parseInt(days, 10);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - daysNum);
      setBackups(prev => prev.filter(b => new Date(b.createdAt) > cutoff));
      dialogs.alert({ title: "Cleanup Complete", message: `Kept backups from last ${daysNum} days` });
    }
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    userModal.open();
  };

  const openAddUserModal = () => {
    setEditingUser(null);
    userModal.open();
  };

  return {
    generalSettings,
    users,
    backups,
    loading,
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
  };
};