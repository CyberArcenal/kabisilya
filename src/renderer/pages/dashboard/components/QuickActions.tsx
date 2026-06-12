// src/renderer/pages/dashboard/components/QuickActions.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CreditCard } from "lucide-react";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3">
      <button
        onClick={() => navigate("/farms/assignments/new")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--primary-color)] text-white hover:bg-[var(--primary-hover)] transition-colors"
      >
        <PlusCircle className="w-4 h-4" />
        New Assignment
      </button>
      <button
        onClick={() => navigate("/finance/payments/new")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--card-hover-bg)] transition-colors"
      >
        <CreditCard className="w-4 h-4" />
        Record Payment
      </button>
    </div>
  );
};

export default QuickActions;