// src/renderer/pages/farms/pitak/components/WorkerAvatarStack.tsx
import React, { useState } from "react";
import { createPortal } from "react-dom";
import type { Worker } from "../../../../api/core/worker";

interface WorkerAvatarStackProps {
  workers: Worker[];
  pitakId: number;
  pitakLocation?: string;
  maxDisplay?: number;
  onWorkerClick?: (worker: Worker) => void;
  onViewAllWorkers?: (pitakId: number) => void; // navigate to assignments filtered by pitak
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const WorkerAvatarStack: React.FC<WorkerAvatarStackProps> = ({
  workers,
  pitakId,
  pitakLocation,
  maxDisplay = 3,
  onWorkerClick,
  onViewAllWorkers,
}) => {
  const [hoveredWorker, setHoveredWorker] = useState<Worker | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const displayed = workers.slice(0, maxDisplay);
  const remaining = workers.length - maxDisplay;

  const handleMouseEnter = (worker: Worker, e: React.MouseEvent) => {
    setHoveredWorker(worker);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top - 30,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredWorker(null);
  };

  const handleViewAll = () => {
    if (onViewAllWorkers) onViewAllWorkers(pitakId);
  };

  return (
    <>
      <div className="flex items-center -space-x-2">
        {displayed.map((worker) => (
          <div
            key={worker.id}
            className="relative group cursor-pointer transition-transform hover:scale-110"
            onClick={() => onWorkerClick?.(worker)}
            onMouseEnter={(e) => handleMouseEnter(worker, e)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary-color)] to-[var(--primary-hover)] flex items-center justify-center text-white text-xs font-medium ring-2 ring-white dark:ring-gray-800 shadow-sm"
              title={worker.name}
            >
              {getInitials(worker.name)}
            </div>
          </div>
        ))}
        {remaining > 0 && (
          <button
            onClick={handleViewAll}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-gray-800 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors cursor-pointer"
            title={`View all ${workers.length} workers assigned to this plot`}
          >
            +{remaining}
          </button>
        )}
      </div>

      {hoveredWorker &&
        createPortal(
          <div
            className="fixed z-[9999] px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap"
            style={{ top: tooltipPos.top, left: tooltipPos.left, transform: "translateX(-50%)" }}
          >
            {hoveredWorker.name}
          </div>,
          document.body
        )}
    </>
  );
};

export default WorkerAvatarStack;