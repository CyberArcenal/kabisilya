// src/renderer/pages/dashboard/components/TopWorkers.tsx
import React from "react";
import { Trophy, User, ChevronRight } from "lucide-react";

interface TopWorker {
  name: string;
  totalLuwang: number;
}

interface Props {
  workers: TopWorker[];
  onViewAll?: () => void;
}

const TopWorkers: React.FC<Props> = ({ workers, onViewAll }) => {
  if (workers.length === 0) {
    return (
      <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] p-6 text-center text-[var(--text-tertiary)] h-full flex flex-col items-center justify-center">
        <Trophy className="w-8 h-8 mb-2 opacity-30" />
        <p className="text-sm">No completed assignments yet</p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] shadow-sm overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[var(--border-color)] bg-[var(--card-secondary-bg)] flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <h3 className="font-semibold text-sm text-[var(--text-primary)]">Top Workers (Luwang)</h3>
        </div>
        {onViewAll && (
          <button onClick={onViewAll} className="text-xs text-[var(--primary-color)] hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-[var(--border-color)]">
          {workers.map((worker, idx) => (
            <div key={idx} className="px-4 py-2.5 flex justify-between items-center hover:bg-[var(--card-hover-bg)] transition-colors">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-mono text-[var(--text-tertiary)] w-6">#{idx+1}</span>
                <User className="w-3.5 h-3.5 text-[var(--primary-color)] flex-shrink-0" />
                <span className="text-sm text-[var(--text-primary)] truncate">{worker.name}</span>
              </div>
              <span className="text-sm font-semibold text-[var(--primary-color)] whitespace-nowrap ml-2">
                {worker.totalLuwang} Luwang
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopWorkers;