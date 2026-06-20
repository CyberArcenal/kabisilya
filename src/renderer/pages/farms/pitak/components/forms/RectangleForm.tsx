import React from "react";
import { Ruler, Hash, RectangleHorizontal } from "lucide-react";
import { TraditionalMeasurement } from "../../utils/measurement";
import { useMeasurementValidation } from "../../hooks/useMeasurementValidation";

interface RectangleFormProps {
  inputs: Record<string, number>;
  errors: Record<string, string>;
  onChange: (field: string, value: number) => void;
  onCalculate: (results: any) => void;
}

const RectangleForm: React.FC<RectangleFormProps> = ({
  inputs,
  errors,
  onChange,
  onCalculate,
}) => {
  const { validateBuholInput } = useMeasurementValidation();

  const handleInputChange = (field: "length" | "width", value: number) => {
    const error = validateBuholInput(
      value,
      field === "length" ? "Length" : "Width",
    );

    onChange(field, value);

    const currentLength = field === "length" ? value : inputs.length || 0;
    const currentWidth = field === "width" ? value : inputs.width || 0;

    if (!error && currentLength > 0 && currentWidth > 0) {
      const results = TraditionalMeasurement.calculateArea("rectangle", {
        length: currentLength,
        width: currentWidth,
      });
      onCalculate(results);
    } else if (currentLength === 0 || currentWidth === 0) {
      onCalculate({ areaSqm: 0, totalLuwang: 0 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {/* Length Input */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Length (Buhol) <span style={{ color: "var(--danger-color)" }}>*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              max="2000"
              step="0.01"
              value={inputs.length || ""}
              onChange={(e) =>
                handleInputChange("length", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 pl-10 rounded text-sm border outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.length ? "var(--danger-color)" : "var(--input-border)",
                color: "var(--input-text)",
              }}
              placeholder="Length in buhol (e.g., 25.75)"
            />
            <Hash className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          </div>
          {errors.length && (
            <p className="mt-1 text-xs" style={{ color: "var(--danger-color)" }}>{errors.length}</p>
          )}
        </div>

        {/* Width Input */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
            Width (Buhol) <span style={{ color: "var(--danger-color)" }}>*</span>
          </label>
          <div className="relative">
            <input
              type="number"
              min="0.1"
              max="2000"
              step="0.01"
              value={inputs.width || ""}
              onChange={(e) =>
                handleInputChange("width", parseFloat(e.target.value) || 0)
              }
              className="w-full px-3 py-2 pl-10 rounded text-sm border outline-none focus:ring-1"
              style={{
                backgroundColor: "var(--input-bg)",
                borderColor: errors.width ? "var(--danger-color)" : "var(--input-border)",
                color: "var(--input-text)",
              }}
              placeholder="Width in buhol (e.g., 15.25)"
            />
            <Hash className="absolute left-3 top-2.5 w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          </div>
          {errors.width && (
            <p className="mt-1 text-xs" style={{ color: "var(--danger-color)" }}>{errors.width}</p>
          )}
        </div>
      </div>

      {/* Conversion Display */}
      {(inputs.length > 0 || inputs.width > 0) && (
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
          <div className="text-xs" style={{ color: "var(--text-secondary)" }}>
            <div className="font-medium mb-2" style={{ color: "var(--text-primary)" }}>Traditional Measurements:</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1" style={{ color: "var(--text-tertiary)" }}>Length:</div>
                <div className="space-y-1" style={{ color: "var(--text-primary)" }}>
                  <div>{inputs.length?.toFixed(2) || "0.00"} buhol</div>
                  <div>
                    {TraditionalMeasurement.buholToTali(inputs.length || 0).toFixed(3)} tali
                  </div>
                  <div>
                    {TraditionalMeasurement.buholToMeters(inputs.length || 0).toFixed(2)} meters
                  </div>
                </div>
              </div>
              <div>
                <div className="mb-1" style={{ color: "var(--text-tertiary)" }}>Width:</div>
                <div className="space-y-1" style={{ color: "var(--text-primary)" }}>
                  <div>{inputs.width?.toFixed(2) || "0.00"} buhol</div>
                  <div>
                    {TraditionalMeasurement.buholToTali(inputs.width || 0).toFixed(3)} tali
                  </div>
                  <div>
                    {TraditionalMeasurement.buholToMeters(inputs.width || 0).toFixed(2)} meters
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visual Representation */}
      <div className="p-3 rounded border" style={{ backgroundColor: "var(--card-secondary-bg)", borderColor: "var(--border-color)" }}>
        <div className="flex items-center gap-2 mb-3">
          <RectangleHorizontal className="w-4 h-4" style={{ color: "var(--text-tertiary)" }} />
          <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }}>Rectangle Plot</span>
        </div>
        <div className="flex justify-center">
          <div className="relative">
            <div
              className="border-2 flex items-center justify-center"
              style={{
                width: inputs.length > inputs.width ? "150px" : "100px",
                height: inputs.width > inputs.length ? "150px" : "100px",
                borderColor: "var(--primary-color)",
                backgroundColor: "var(--status-success-bg)",
              }}
            >
              <div className="text-xs text-center" style={{ color: "var(--primary-color)" }}>
                <div className="font-bold">Rectangle</div>
                {inputs.length > 0 && inputs.width > 0 && (
                  <div>
                    {inputs.length.toFixed(2)} × {inputs.width.toFixed(2)} buhol
                  </div>
                )}
              </div>
            </div>
            {inputs.length > 0 && (
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--primary-color)" }}>
                Length: {inputs.length.toFixed(2)} buhol
              </div>
            )}
            {inputs.width > 0 && (
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 text-white text-xs px-2 py-0.5 rounded" style={{ backgroundColor: "var(--primary-color)" }}>
                Width: {inputs.width.toFixed(2)} buhol
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calculation Formula */}
      {inputs.length > 0 && inputs.width > 0 && (
        <div className="p-3 rounded border" style={{ backgroundColor: "var(--status-partial-bg)", borderColor: "var(--warning-color)" }}>
          <div className="text-xs">
            <div className="font-medium mb-1" style={{ color: "var(--status-partial-text)" }}>Calculation:</div>
            <div style={{ color: "var(--text-secondary)" }}>
              <div>
                Length: {inputs.length.toFixed(2)} buhol × 50 ={" "}
                {TraditionalMeasurement.buholToMeters(inputs.length).toFixed(2)}m
              </div>
              <div>
                Width: {inputs.width.toFixed(2)} buhol × 50 ={" "}
                {TraditionalMeasurement.buholToMeters(inputs.width).toFixed(2)}m
              </div>
              <div className="font-mono mt-1 p-1 rounded border" style={{ backgroundColor: "var(--card-bg)", borderColor: "var(--border-color)" }}>
                Area = {TraditionalMeasurement.buholToMeters(inputs.length).toFixed(2)} ×{" "}
                {TraditionalMeasurement.buholToMeters(inputs.width).toFixed(2)} =
                {(
                  TraditionalMeasurement.buholToMeters(inputs.length) *
                  TraditionalMeasurement.buholToMeters(inputs.width)
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

export default RectangleForm;