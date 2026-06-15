// src/renderer/pages/system/settings/components/FarmSettingsTabs.tsx
import React from "react";
import { Calendar, MapPin, UserCheck, CreditCard, FileText, Shield, Bell } from "lucide-react";

type FarmTabId = "session" | "bukid" | "pitak" | "assignment" | "payment" | "debt" | "audit" | "notifications";

const tabs: { id: FarmTabId; label: string; icon: React.ElementType }[] = [
  // { id: "session", label: "Session", icon: Calendar },
  // { id: "bukid", label: "Bukid", icon: MapPin },
  // { id: "pitak", label: "Pitak", icon: MapPin },
  { id: "assignment", label: "Assignment", icon: UserCheck },
  { id: "payment", label: "Payment", icon: CreditCard },
  // { id: "debt", label: "Debt", icon: FileText },
  // { id: "audit", label: "Audit", icon: Shield },
  { id: "notifications", label: "Notifications", icon: Bell },
];

interface Props {
  activeTab: FarmTabId;
  onTabChange: (tab: FarmTabId) => void;
}

const FarmSettingsTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-4 border-b border-[var(--border-color)] pb-2">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-colors duration-200 text-sm font-medium ${
              activeTab === tab.id
                ? "bg-[var(--primary-color)] text-white"
                : "text-[var(--text-secondary)] hover:bg-[var(--card-hover-bg)] hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default FarmSettingsTabs;