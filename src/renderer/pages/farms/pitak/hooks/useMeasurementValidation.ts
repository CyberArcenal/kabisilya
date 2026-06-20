// src/renderer/pages/pitak/hooks/useMeasurementValidation.ts
import { useState, useCallback } from 'react';
import type { BuholInputs } from '../utils/measurement';

export const useMeasurementValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateBuholInput = useCallback((
    value: number,
    fieldName: string,
    required = true
  ): string => {
    // Check if value is provided
    if (required && (value === undefined || value === null || isNaN(value))) {
      return `${fieldName} is required`;
    }
    
    // Check for negative values
    if (value < 0) {
      return `${fieldName} cannot be negative`;
    }
    
    // Check for zero value when required
    if (required && value <= 0) {
      return `${fieldName} must be greater than 0 buhol`;
    }
    
    // Allow decimals, so remove the integer check
    
    // Increased max value to accommodate decimals
    if (value > 2000) {
      return `${fieldName} cannot exceed 2000 buhol`;
    }
    
    // Validate precision (allow up to 2 decimal places)
    const decimalPlaces = (value.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return `${fieldName} cannot have more than 2 decimal places`;
    }
    
    return '';
  }, []);

  const validateShapeInputs = useCallback((
    layoutType: string,
    inputs: BuholInputs,
    triangleMode?: 'base_height' | 'three_sides'
  ): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    switch (layoutType) {
      case 'square': {
        const sideError = validateBuholInput(inputs.side || 0, 'Side');
        if (sideError) newErrors.side = sideError;
        break;
      }
      case 'rectangle': {
        const lengthError = validateBuholInput(inputs.length || 0, 'Length');
        if (lengthError) newErrors.length = lengthError;
        const widthError = validateBuholInput(inputs.width || 0, 'Width');
        if (widthError) newErrors.width = widthError;
        break;
      }
      case 'triangle': {
        if (triangleMode === 'base_height') {
          const baseError = validateBuholInput(inputs.base || 0, 'Base');
          if (baseError) newErrors.base = baseError;
          const heightError = validateBuholInput(inputs.height || 0, 'Height');
          if (heightError) newErrors.height = heightError;
        } else {
          const sideAError = validateBuholInput(inputs.sideA || 0, 'Side A');
          if (sideAError) newErrors.sideA = sideAError;
          const sideBError = validateBuholInput(inputs.sideB || 0, 'Side B');
          if (sideBError) newErrors.sideB = sideBError;
          const sideCError = validateBuholInput(inputs.sideC || 0, 'Side C');
          if (sideCError) newErrors.sideC = sideCError;
        }
        break;
      }
      case 'circle': {
        const radiusError = validateBuholInput(inputs.radius || 0, 'Radius');
        if (radiusError) newErrors.radius = radiusError;
        break;
      }
      default:
        break;
    }

    return newErrors;
  }, [validateBuholInput]);

  const clearError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    setErrors,
    validateBuholInput,
    validateShapeInputs,
    clearError,
    clearAllErrors,
  };
};