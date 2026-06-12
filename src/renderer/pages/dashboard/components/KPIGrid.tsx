// src/renderer/pages/dashboard/components/KPIGrid.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, CheckCircle, CreditCard, AlertTriangle, Calendar } from "lucide-react";
import KPICard from "./KPICard";
import type { DashboardData } from "../types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2 }).format(amount);

interface KPIGridProps {
  data: DashboardData;
}

const KPIGrid: React.FC<KPIGridProps> = ({ data }) => {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Total Workers",
      value: data.totalWorkers,
      icon: <Users className="w-5 h-5" />,
      color: "#3b82f6",
      onClick: () => navigate("/workers"),
    },
    {
      title: "Active Assignments",
      value: data.activeAssignments,
      icon: <ClipboardList className="w-5 h-5" />,
      color: "#f59e0b",
      onClick: () => navigate("/farms/assignments?status=active"),
    },
    {
      title: "Completed Assignments",
      value: data.completedAssignments,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "#10b981",
      onClick: () => navigate("/farms/assignments?status=completed"),
    },
    {
      title: "Payments This Month",
      value: formatCurrency(data.totalPaymentsMonth),
      icon: <CreditCard className="w-5 h-5" />,
      color: "#8b5cf6",
      onClick: () => navigate("/finance/payments"),
    },
    {
      title: "Outstanding Debts",
      value: formatCurrency(data.outstandingDebts),
      icon: <AlertTriangle className="w-5 h-5" />,
      color: "#ef4444",
      onClick: () => navigate("/finance/debts"),
    },
    {
      title: "Current Session",
      value: data.currentSession ? `${data.currentSession.name} (${data.currentSession.year})` : "None",
      icon: <Calendar className="w-5 h-5" />,
      color: "#14b8a6",
      onClick: () => navigate("/system/sessions"),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => (
        <KPICard key={idx} {...card} />
      ))}
    </div>
  );
};

export default KPIGrid;