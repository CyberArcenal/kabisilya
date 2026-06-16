// src/renderer/pages/system/settings/components/farm-settings/FarmSettingsTabs.tsx
import React from "react";
import {
  CalendarDays,
  Trees,
  MapPin,
  Users,
  CreditCard,
  Wallet,
  FileText,
  Bell,
} from "lucide-react";

type TabKey = "session" | "bukid" | "pitak" | "assignment" | "payment" | "debt" | "audit" | "notifications";

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ReactNode;
}

const tabs: TabItem[] = [
  // { key: "session", label: "Session", icon: <CalendarDays className="w-4 h-4" /> },
  // { key: "bukid", label: "Farm", icon: <Trees className="w-4 h-4" /> },
  // { key: "pitak", label: "Plot", icon: <MapPin className="w-4 h-4" /> },
  // { key: "assignment", label: "Assignment", icon: <Users className="w-4 h-4" /> },
  { key: "payment", label: "Payment", icon: <CreditCard className="w-4 h-4" /> },
  { key: "debt", label: "Debt", icon: <Wallet className="w-4 h-4" /> },
  // { key: "audit", label: "Audit", icon: <FileText className="w-4 h-4" /> },
  { key: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
];

interface Props {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

const FarmSettingsTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-1 bg-[var(--card-secondary-bg)] p-1 rounded-xl border border-[var(--border-color)]">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
            ${
              activeTab === tab.key
                ? "bg-[var(--primary-color)] text-white shadow-md"
                : "text-[var(--text-secondary)] hover:bg-[var(--card-hover-bg)] hover:text-[var(--text-primary)]"
            }
          `}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default FarmSettingsTabs;