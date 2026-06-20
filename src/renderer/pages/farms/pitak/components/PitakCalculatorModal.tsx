// src/renderer/pages/farms/pitak/components/PitakCalculatorModal.tsx
import React, { useState, useEffect, useCallback } from "react";
import Modal from "../../../../components/UI/Modal";
import Button from "../../../../components/UI/Button";
import {
  TraditionalMeasurement,
  type LayoutType,
  type TriangleMode,
} from "../utils/measurement";
import { useMeasurementValidation } from "../hooks/useMeasurementValidation";
import ResultsDisplay from "./ResultDisplay";
import AdvancedGeometryForm from "./AdvancedGeometryForm";

interface PitakCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (luwang: number) => void;
  initialLuwang?: number; // optional pre-filled value (not used for inputs)
}

const PitakCalculatorModal: React.FC<PitakCalculatorModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  initialLuwang,
}) => {
  // State
  const [layoutType, setLayoutType] = useState<LayoutType>("");
  const [buholInputs, setBuholInputs] = useState<Record<string, number>>({});
  const [triangleMode, setTriangleMode] = useState<TriangleMode>("base_height");
  const [calculationResults, setCalculationResults] = useState({
    areaSqm: 0,
    totalLuwang: 0,
    totalHectare: 0,
  });
  const [measurementMethod, setMeasurementMethod] = useState("");

  // Validation hook
  const { errors, setErrors, validateShapeInputs, clearAllErrors } =
    useMeasurementValidation();

  // Recalculate when inputs change
  const handleCalculation = useCallback(
    (results: any) => {
      setCalculationResults({
        areaSqm: results.areaSqm || 0,
        totalLuwang: results.totalLuwang || 0,
        totalHectare: results.totalHectare || 0,
      });
      // Set measurement method based on layout and mode
      if (layoutType) {
        const method = TraditionalMeasurement.getMeasurementMethod(
          layoutType,
          triangleMode,
        );
        setMeasurementMethod(method);
      }
    },
    [layoutType, triangleMode],
  );

  // Validate on shape change or input change
  useEffect(() => {
    if (layoutType) {
      const validationErrors = validateShapeInputs(
        layoutType,
        buholInputs,
        triangleMode,
      );
      setErrors(validationErrors);
    } else {
      clearAllErrors();
    }
  }, [
    layoutType,
    buholInputs,
    triangleMode,
    validateShapeInputs,
    setErrors,
    clearAllErrors,
  ]);

  // Reset when modal opens (optional)
  useEffect(() => {
    if (isOpen) {
      // Optionally pre-fill from initialLuwang? Not needed; we start fresh.
      // But we could set layoutType to empty and clear inputs.
      setLayoutType("");
      setBuholInputs({});
      setTriangleMode("base_height");
      setCalculationResults({ areaSqm: 0, totalLuwang: 0, totalHectare: 0 });
      setMeasurementMethod("");
      clearAllErrors();
    }
  }, [isOpen, clearAllErrors]);

  const handleApply = () => {
    if (calculationResults.totalLuwang > 0) {
      onConfirm(calculationResults.totalLuwang);
      onClose();
    }
  };

  const isApplyDisabled =
    !layoutType ||
    calculationResults.totalLuwang <= 0 ||
    Object.keys(errors).length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Plot Area Calculator"
      size="xl" // ✅ wider modal for desktop
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleApply}
            disabled={isApplyDisabled}
          >
            Apply Luwang
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <AdvancedGeometryForm
          layoutType={layoutType}
          buholInputs={buholInputs}
          triangleMode={triangleMode}
          errors={errors}
          onLayoutTypeChange={(type) => {
            setLayoutType(type);
            setBuholInputs({});
            clearAllErrors();
          }}
          onBuholInputChange={(field, value) => {
            setBuholInputs((prev) => ({ ...prev, [field]: value }));
          }}
          onTriangleModeChange={(mode) => setTriangleMode(mode)}
          onCalculation={handleCalculation}
        />

        <ResultsDisplay
          results={calculationResults}
          layoutType={layoutType}
          measurementMethod={measurementMethod}
          buholInputs={buholInputs}
        />
      </div>
    </Modal>
  );
};

export default PitakCalculatorModal;
