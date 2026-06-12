// src/renderer/pages/farms/bukid/components/PlotIconStack.tsx
import React, { useState } from "react";
import { MapPin, Wheat } from "lucide-react";
import type { Pitak } from "../../../../api/core/pitak";
import { createPortal } from "react-dom";

interface PlotIconStackProps {
  pitaks: Pitak[];
  maxDisplay?: number;
  onPitakClick?: (pitak: Pitak) => void;
}

const PlotIconStack: React.FC<PlotIconStackProps> = ({
  pitaks,
  maxDisplay = 3,
  onPitakClick,
}) => {
  const [hoveredPitak, setHoveredPitak] = useState<Pitak | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const displayed = pitaks.slice(0, maxDisplay);
  const remaining = pitaks.length - maxDisplay;

  const handleMouseEnter = (pitak: Pitak, e: React.MouseEvent) => {
    setHoveredPitak(pitak);
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      top: rect.top - 30,
      left: rect.left + rect.width / 2,
    });
  };

  const handleMouseLeave = () => {
    setHoveredPitak(null);
  };

  return (
    <>
      <div className="flex items-center -space-x-2">
        {displayed.map((pitak) => (
          <div
            key={pitak.id}
            className="relative group cursor-pointer transition-transform hover:scale-110"
            onClick={() => onPitakClick?.(pitak)}
            onMouseEnter={(e) => handleMouseEnter(pitak, e)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="w-8 h-8 rounded-full bg-[var(--card-secondary-bg)] border-2 border-white dark:border-gray-800 flex items-center justify-center shadow-sm"
              style={{ color: "var(--primary-color)" }}
            >
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        ))}
        {remaining > 0 && (
          <div
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 border-2 border-white dark:border-gray-800 cursor-help"
            title={`${remaining} more plots`}
          >
            +{remaining}
          </div>
        )}
      </div>

      {hoveredPitak &&
        createPortal(
          <div
            className="fixed z-[9999] px-2 py-1 bg-gray-900 text-white text-xs rounded shadow-lg whitespace-nowrap"
            style={{ top: tooltipPos.top, left: tooltipPos.left, transform: "translateX(-50%)" }}
          >
            {hoveredPitak.location || `Plot #${hoveredPitak.id}`}
          </div>,
          document.body
        )}
    </>
  );
};

export default PlotIconStack;