import React from "react";
import { Calculator, Ruler, Hash } from "lucide-react";
import {
  TraditionalMeasurement,
  type CalculationResult,
} from "../utils/measurement";

interface ResultsDisplayProps {
  results: CalculationResult;
  layoutType: string;
  measurementMethod: string;
  buholInputs: Record<string, number>;
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  layoutType,
  measurementMethod,
  buholInputs,
}) => {
  if (!layoutType || results.areaSqm <= 0) return null;

  const getConversionExplanation = () => {
    const explanations = TraditionalMeasurement.getConversionExplanation(
      layoutType as any,
      buholInputs,
    );
    return explanations.slice(3);
  };

  return (
    <div className="space-y-4">
      {/* Conversion Method */}
      <div className="p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-4 h-4" style={{ color: "var(--text-secondary)" }} />
          <div className="text-xs font-medium" style={{ color: "var(--text-primary)" }}>
            Traditional Measurement System
          </div>
        </div>

        <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-tertiary)" }}>1 buhol =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>50 meters</div>
            </div>
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-tertiary)" }}>1 tali =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>10 buhol</div>
            </div>
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-tertiary)" }}>1 luwang =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>250,000 m²</div>
            </div>
          </div>

          <div style={{ color: "var(--text-tertiary)" }}>
            Method:{" "}
            <span className="font-medium" style={{ color: "var(--text-primary)" }}>
              {measurementMethod}
            </span>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-3 gap-3">
        {/* Square Meters */}
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-success-bg)", borderColor: "var(--success-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Ruler className="w-4 h-4" style={{ color: "var(--success-color)" }} />
            <div className="text-xs font-medium" style={{ color: "var(--status-success-text)" }}>Area (SQM)</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: "var(--status-success-text)" }}>
              {results.areaSqm.toFixed(2)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>Square Meters</div>
          </div>
        </div>

        {/* Luwang */}
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-partial-bg)", borderColor: "var(--warning-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4" style={{ color: "var(--warning-color)" }} />
            <div className="text-xs font-medium" style={{ color: "var(--status-partial-text)" }}>Total Luwang</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: "var(--status-partial-text)" }}>
              {results.totalLuwang.toFixed(2)}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Luwang
              <br />
              (250,000 m² per Luwang)
            </div>
          </div>
        </div>

        {/* Hectare */}
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--secondary-light)", borderColor: "var(--secondary-color)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Hash className="w-4 h-4" style={{ color: "var(--secondary-color)" }} />
            <div className="text-xs font-medium" style={{ color: "var(--secondary-color)" }}>Total Hectare</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color: "var(--secondary-color)" }}>
              {results.totalHectare?.toFixed(2) || "0.00"}
            </div>
            <div className="text-xs mt-0.5" style={{ color: "var(--text-tertiary)" }}>
              Hectare
              <br />
              (20 luwang = 1 hectare)
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Conversion */}
      {buholInputs && Object.keys(buholInputs).length > 0 && (
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
          <div className="text-xs">
            <div className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>
              Traditional to Modern Conversion:
            </div>
            <div className="space-y-1" style={{ color: "var(--text-secondary)" }}>
              {getConversionExplanation().map((line, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--text-tertiary)" }}></div>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="p-3 rounded border" style={{ background: "var(--card-secondary-bg)", borderColor: "var(--primary-color)" }}>
        <div className="text-xs font-medium mb-1" style={{ color: "var(--text-primary)" }}>Summary:</div>
        <div className="text-xs space-y-1" style={{ color: "var(--text-secondary)" }}>
          <div>
            This plot has an area of {results.areaSqm.toFixed(2)} square meters,
          </div>
          <div>
            which is equivalent to {results.totalLuwang.toFixed(2)} luwang,
          </div>
          <div>or {results.totalHectare?.toFixed(2)} hectare.</div>
          <div className="mt-2" style={{ color: "var(--success-color)" }}>
            ✓ Measurement recorded using traditional buhol/tali system
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;