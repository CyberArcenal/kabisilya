// src/renderer/pages/dashboard/components/QuickActions.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { PlusCircle, CreditCard } from "lucide-react";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3">
      <button
        onClick={() => navigate("/farms/assignments")}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--primary-color)] to-[var(--primary-hover)] text-white font-medium shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5"
      >
        <PlusCircle className="w-4 h-4" />
        New Assignment
      </button>
      <button
        onClick={() => navigate("/finance/payments")}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--text-primary)] font-medium hover:bg-[var(--card-hover-bg)] transition-all hover:-translate-y-0.5"
      >
        <CreditCard className="w-4 h-4" />
        Record Payment
      </button>
    </div>
  );
};

export default QuickActions;