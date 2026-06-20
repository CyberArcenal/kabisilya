import React from "react";
import { Ruler, Hash, Maximize } from "lucide-react";
import { TraditionalMeasurement } from "../../utils/measurement";
import { useMeasurementValidation } from "../../hooks/useMeasurementValidation";

interface SquareFormProps {
  inputs: Record<string, number>;
  errors: Record<string, string>;
  onChange: (field: string, value: number) => void;
  onCalculate: (results: any) => void;
}

const SquareForm: React.FC<SquareFormProps> = ({ inputs, errors, onChange, onCalculate }) => {
  const { validateBuholInput } = useMeasurementValidation();

  const handleSideChange = (value: number) => {
    const error = validateBuholInput(value, "Side");
    onChange("side", value);
    if (!error && value > 0) {
      const results = TraditionalMeasurement.calculateArea("square", { side: value });
      onCalculate(results);
    } else if (value === 0) {
      onCalculate({ areaSqm: 0, totalLuwang: 0 });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Side Length (in Buhol) <span style={{ color: "var(--danger-color)" }}>*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="0.1"
            max="2000"
            step="0.01"
            value={inputs.side || ""}
            onChange={(e) => handleSideChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 pl-10 rounded text-sm border outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: errors.side ? "var(--danger-color)" : "var(--input-border)",
              color: "var(--input-text)",
            }}
            placeholder="Enter side length in buhol (e.g., 15.5)"
          />
          <Hash className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
        </div>
        {errors.side && <p className="mt-1 text-xs" style={{ color: "var(--danger-color)" }}>{errors.side}</p>}

        {inputs.side && inputs.side > 0 && (
          <div className="mt-2 p-2 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <div className="font-medium" style={{ color: "var(--text-primary)" }}>Traditional Measurement:</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>In Buhol:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{inputs.side.toFixed(2)} buhol</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>In Tali:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {TraditionalMeasurement.buholToTali(inputs.side).toFixed(3)} tali
                  </div>
                </div>
                <div className="col-span-2">
                  <div style={{ color: "var(--text-tertiary)" }}>In Meters:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {TraditionalMeasurement.buholToMeters(inputs.side).toFixed(2)} meters
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-2">
          <Maximize className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Square Plot</span>
        </div>
        <div className="flex items-center justify-center">
          <div className="relative">
            <div
              className="border-2 flex items-center justify-center"
              style={{
                width: "120px",
                height: "120px",
                borderColor: "var(--primary-color)",
                backgroundColor: "var(--status-success-bg)",
              }}
            >
              <div className="text-xs text-center" style={{ color: "var(--primary-color)" }}>
                <div className="font-bold">Square</div>
                {inputs.side > 0 && (
                  <>
                    <div>{inputs.side.toFixed(2)} buhol</div>
                    <div>= {TraditionalMeasurement.buholToMeters(inputs.side).toFixed(2)}m</div>
                  </>
                )}
              </div>
            </div>
            {inputs.side > 0 && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--primary-color)" }}>
                Side
              </div>
            )}
          </div>
        </div>
      </div>

      {inputs.side > 0 && (
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-partial-bg)", borderColor: "var(--warning-color)" }}>
          <div className="text-xs">
            <div className="font-medium mb-1" style={{ color: "var(--status-partial-text)" }}>Calculation Formula:</div>
            <div style={{ color: "var(--text-secondary)" }}>
              <div>Side (buhol) × 50 = Side (meters)</div>
              <div>Area = Side (m) × Side (m)</div>
              <div className="font-mono mt-1 p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                {inputs.side > 0 ? (
                  <>
                    ({inputs.side.toFixed(2)} × 50) × ({inputs.side.toFixed(2)} × 50) =
                    {TraditionalMeasurement.buholToMeters(inputs.side).toFixed(2)} ×{" "}
                    {TraditionalMeasurement.buholToMeters(inputs.side).toFixed(2)} =
                    {(TraditionalMeasurement.buholToMeters(inputs.side) *
                      TraditionalMeasurement.buholToMeters(inputs.side)).toFixed(2)}{" "}
                    sqm
                  </>
                ) : (
                  "Enter side length to see calculation"
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SquareForm;