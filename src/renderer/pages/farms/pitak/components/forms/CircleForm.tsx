import React from "react";
import { Circle as CircleIcon, Ruler, Hash, Pi } from "lucide-react";
import { TraditionalMeasurement } from "../../utils/measurement";
import { useMeasurementValidation } from "../../hooks/useMeasurementValidation";

interface CircleFormProps {
  inputs: Record<string, number>;
  errors: Record<string, string>;
  onChange: (field: string, value: number) => void;
  onCalculate: (results: any) => void;
}

const CircleForm: React.FC<CircleFormProps> = ({
  inputs,
  errors,
  onChange,
  onCalculate,
}) => {
  const { validateBuholInput } = useMeasurementValidation();

  const handleRadiusChange = (value: number) => {
    const error = validateBuholInput(value, "Radius");

    onChange("radius", value);

    if (!error && value > 0) {
      const results = TraditionalMeasurement.calculateArea("circle", {
        radius: value,
      });
      onCalculate(results);
    } else if (value === 0) {
      onCalculate({ areaSqm: 0, totalLuwang: 0 });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
          Radius (Buhol) <span style={{ color: "var(--danger-color)" }}>*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="0.1"
            max="2000"
            step="0.01"
            value={inputs.radius || ""}
            onChange={(e) => handleRadiusChange(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 pl-10 rounded text-sm border outline-none focus:ring-1"
            style={{
              backgroundColor: "var(--input-bg)",
              borderColor: errors.radius ? "var(--danger-color)" : "var(--input-border)",
              color: "var(--input-text)",
            }}
            placeholder="Enter radius in buhol (e.g., 12.5)"
          />
          <Hash className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
        </div>
        {errors.radius && (
          <p className="mt-1 text-xs" style={{ color: "var(--danger-color)" }}>{errors.radius}</p>
        )}

        {inputs.radius > 0 && (
          <div className="mt-2 p-2 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
            <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
              <div className="font-medium" style={{ color: "var(--text-primary)" }}>Traditional Measurement:</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>Radius in Buhol:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>{inputs.radius.toFixed(2)} buhol</div>
                </div>
                <div>
                  <div style={{ color: "var(--text-tertiary)" }}>In Tali:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {TraditionalMeasurement.buholToTali(inputs.radius).toFixed(3)} tali
                  </div>
                </div>
                <div className="col-span-2">
                  <div style={{ color: "var(--text-tertiary)" }}>In Meters:</div>
                  <div className="font-semibold" style={{ color: "var(--text-primary)" }}>
                    {TraditionalMeasurement.buholToMeters(inputs.radius).toFixed(2)} meters
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-3">
          <CircleIcon className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Circular Plot</span>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <svg
              width="150"
              height="150"
              className="border rounded-full"
              style={{ borderColor: "var(--border-color)" }}
            >
              <circle
                cx="75"
                cy="75"
                r={Math.min(70, inputs.radius * 5)}
                fill="var(--status-success-bg)"
                stroke="var(--primary-color)"
                strokeWidth="2"
              />
              <line
                x1="75"
                y1="75"
                x2={75 + Math.min(70, inputs.radius * 5)}
                y2="75"
                stroke="var(--danger-color)"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
              {inputs.radius > 0 && (
                <text
                  x={75 + Math.min(70, inputs.radius * 5) / 2}
                  y="70"
                  className="text-xs"
                  style={{ fill: "var(--danger-color)" }}
                >
                  Radius: {inputs.radius.toFixed(2)} buhol
                </text>
              )}
            </svg>
          </div>
        </div>
      </div>

      {inputs.radius > 0 && (
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-partial-bg)", borderColor: "var(--warning-color)" }}>
          <div className="text-xs">
            <div className="font-medium mb-1" style={{ color: "var(--status-partial-text)" }}>Calculation Formula:</div>
            <div style={{ color: "var(--text-secondary)" }}>
              <div>
                Radius: {inputs.radius.toFixed(2)} buhol × 50 ={" "}
                {TraditionalMeasurement.buholToMeters(inputs.radius).toFixed(2)}m
              </div>
              <div className="flex items-center gap-1">
                <Pi className="w-3 h-3" />π (Pi) ≈ 3.14159
              </div>
              <div className="font-mono mt-1 p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                Area = π × r² = 3.14159 × (
                {TraditionalMeasurement.buholToMeters(inputs.radius).toFixed(2)})² =
                {(
                  Math.PI *
                  Math.pow(
                    TraditionalMeasurement.buholToMeters(inputs.radius),
                    2,
                  )
                ).toFixed(2)}{" "}
                sqm
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CircleForm;