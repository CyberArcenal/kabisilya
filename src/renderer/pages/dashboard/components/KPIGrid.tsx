import React, { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Users, ClipboardList, CheckCircle, CreditCard, AlertTriangle, Calendar } from "lucide-react";
import KPICard from "./KPICard";
import type { DashboardData } from "../types";

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 0 }).format(amount);

const KPIGrid: React.FC<{ data: DashboardData }> = React.memo(({ data }) => {
  const navigate = useNavigate();

  const cards = [
    { title: "Total Workers", value: data.totalWorkers, icon: <Users className="w-5 h-5" />, color: "#3b82f6", path: "/workers" },
    { title: "Active Assignments", value: data.activeAssignments, icon: <ClipboardList className="w-5 h-5" />, color: "#f59e0b", path: "/farms/assignments?status=active" },
    { title: "Completed Assignments", value: data.completedAssignments, icon: <CheckCircle className="w-5 h-5" />, color: "#10b981", path: "/farms/assignments?status=completed" },
    { title: "Payments This Month", value: formatCurrency(data.totalPaymentsMonth), icon: <CreditCard className="w-5 h-5" />, color: "#8b5cf6", path: "/finance/payments" },
    { title: "Outstanding Debts", value: formatCurrency(data.outstandingDebts), icon: <AlertTriangle className="w-5 h-5" />, color: "#ef4444", path: "/finance/debts" },
    { title: "Current Session", value: data.currentSession ? `${data.currentSession.name} (${data.currentSession.year})` : "None", icon: <Calendar className="w-5 h-5" />, color: "#14b8a6", path: "/system/sessions" },
  ];

  const handleNavigate = useCallback((path: string) => () => navigate(path), [navigate]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-5">
      {cards.map((card, idx) => (
        <KPICard key={idx} {...card} onClick={handleNavigate(card.path)} />
      ))}
    </div>
  );
});

export default KPIGrid;