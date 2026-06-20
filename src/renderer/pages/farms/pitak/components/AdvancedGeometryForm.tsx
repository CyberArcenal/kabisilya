import React from "react";
import { AreaChart, SquareIcon, RectangleHorizontal, Triangle, CircleIcon, AlertCircle } from "lucide-react";
import SquareForm from "./forms/SquareForm";
import RectangleForm from "./forms/RectangleForm";
import TriangleForm from "./forms/TriangleForm";
import CircleForm from "./forms/CircleForm";
import type { TriangleMode } from "../utils/measurement";

interface AdvancedGeometryFormProps {
  layoutType: "square" | "rectangle" | "triangle" | "circle" | "";
  buholInputs: Record<string, number>;
  triangleMode?: "base_height" | "three_sides";
  errors: Record<string, string>;
  onLayoutTypeChange: (type: "square" | "rectangle" | "triangle" | "circle" | "") => void;
  onBuholInputChange: (field: string, value: number) => void;
  onTriangleModeChange: (mode: "base_height" | "three_sides") => void;
  onCalculation: (results: any) => void;
}

const layoutOptions = [
  { value: "square" as const, label: "Square", icon: SquareIcon, description: "Equal sides" },
  { value: "rectangle" as const, label: "Rectangle", icon: RectangleHorizontal, description: "Length × Width" },
  { value: "triangle" as const, label: "Triangle", icon: Triangle, description: "Base × Height / 2 or 3 Sides" },
  { value: "circle" as const, label: "Circle", icon: CircleIcon, description: "π × Radius²" },
];

const AdvancedGeometryForm: React.FC<AdvancedGeometryFormProps> = ({
  layoutType,
  buholInputs,
  triangleMode,
  errors,
  onLayoutTypeChange,
  onBuholInputChange,
  onTriangleModeChange,
  onCalculation,
}) => {
  const renderGeometryForm = () => {
    switch (layoutType) {
      case "square":
        return <SquareForm inputs={buholInputs} errors={errors} onChange={onBuholInputChange} onCalculate={onCalculation} />;
      case "rectangle":
        return <RectangleForm inputs={buholInputs} errors={errors} onChange={onBuholInputChange} onCalculate={onCalculation} />;
      case "triangle":
        return <TriangleForm inputs={buholInputs} errors={errors} onChange={onBuholInputChange} onCalculate={onCalculation} triangleMode={triangleMode as TriangleMode} onTriangleModeChange={onTriangleModeChange} />;
      case "circle":
        return <CircleForm inputs={buholInputs} errors={errors} onChange={onBuholInputChange} onCalculate={onCalculation} />;
      default:
        return (
          <div className="text-center py-8" style={{ color: "var(--text-tertiary)" }}>
            <AreaChart className="w-12 h-12 mx-auto mb-3 opacity-50" style={{ color: "var(--text-tertiary)" }} />
            <p className="text-sm">Select a plot shape to configure</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Traditional Measurement System Info */}
      <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-partial-bg)", borderColor: "var(--warning-color)" }}>
        <div className="text-xs">
          <div className="font-medium mb-1" style={{ color: "var(--status-partial-text)" }}>Traditional Measurement System</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-secondary)" }}>1 buhol =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>50 meters</div>
            </div>
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-secondary)" }}>1 tali =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>10 buhol</div>
            </div>
            <div className="p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
              <div style={{ color: "var(--text-secondary)" }}>1 luwang =</div>
              <div className="font-semibold" style={{ color: "var(--text-primary)" }}>250,000 m²</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Type Selection */}
      <div>
        <label className="block text-xs font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
          Plot Shape <span style={{ color: "var(--danger-color)" }}>*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {layoutOptions.map((option) => {
            const Icon = option.icon;
            const isActive = layoutType === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onLayoutTypeChange(option.value)}
                className="p-3 rounded border flex flex-col items-center justify-center gap-1 transition-all"
                style={{
                  borderColor: isActive ? "var(--primary-color)" : "var(--border-color)",
                  backgroundColor: isActive ? "var(--status-success-bg)" : "var(--card-bg)",
                  boxShadow: isActive ? "0 0 0 2px var(--primary-color)" : "none",
                }}
              >
                <Icon className="w-4 h-4" style={{ color: isActive ? "var(--primary-color)" : "var(--text-tertiary)" }} />
                <span className="text-xs font-medium" style={{ color: isActive ? "var(--primary-color)" : "var(--text-secondary)" }}>
                  {option.label}
                </span>
                <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>{option.description}</span>
              </button>
            );
          })}
        </div>
        {errors.layoutType && (
          <p className="mt-1 text-xs flex items-center gap-1" style={{ color: "var(--danger-color)" }}>
            <AlertCircle className="w-3 h-3" />
            {errors.layoutType}
          </p>
        )}
      </div>

      {renderGeometryForm()}
    </div>
  );
};

export default AdvancedGeometryForm;