// src/renderer/pages/dashboard/components/UpcomingDebts.tsx
import React from "react";
import { AlertCircle, Calendar, ChevronRight } from "lucide-react";

interface UpcomingDebt {
  id: number;
  worker: string;
  amount: number;
  dueDays: number;
}

interface Props {
  debts: UpcomingDebt[];
  onViewAll?: () => void;
}

const UpcomingDebts: React.FC<Props> = ({ debts, onViewAll }) => {
  const getDueColor = (days: number) => {
    if (days <= 0) return "text-red-600 bg-red-50 dark:bg-red-900/20";
    if (days <= 3) return "text-orange-500 bg-orange-50 dark:bg-orange-900/20";
    return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
  };

  if (debts.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6 text-center text-[var(--text-tertiary)] h-full flex flex-col items-center justify-center">
        <AlertCircle className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No upcoming debts</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">Upcoming Debt Due</h3>
        </div>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-0.5">
            Manage <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-[var(--border-color)]">
          {debts.map((debt) => (
            <div key={debt.id} className="px-4 py-2.5 hover:bg-[var(--card-hover-bg)] transition-colors">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{debt.worker}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${getDueColor(debt.dueDays)}`}>
                      <Calendar className="w-3 h-3" />
                      {debt.dueDays <= 0 ? "Overdue" : `Due in ${debt.dueDays} day${debt.dueDays !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>
                <span className="text-sm font-bold text-red-500 whitespace-nowrap">
                  ₱{debt.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UpcomingDebts;