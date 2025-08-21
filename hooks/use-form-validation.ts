import { useMemo } from "react";
import { type PlanAccionItem } from "@/types/plan-accion";

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
  getValidationMessage: () => string;
}

/**
 * Hook para manejar la validación del formulario de plan de acción
 */
export const useFormValidation = (item: PlanAccionItem): ValidationResult => {
  const validation = useMemo(() => {
    const errors: ValidationErrors = {};

    // Validaciones de información básica
    if (!item.programa?.trim()) {
      errors.programa = "El programa es requerido";
    }

    if (!item.objetivo?.trim()) {
      errors.objetivo = "El objetivo es requerido";
    }

    if (!item.responsable?.trim()) {
      errors.responsable = "El responsable es requerido";
    }

    if (!item.estado?.trim()) {
      errors.estado = "El estado es requerido";
    }

    if (!item.fechaInicio) {
      errors.fechaInicio = "La fecha de inicio es requerida";
    }

    if (!item.fechaFin) {
      errors.fechaFin = "La fecha de fin es requerida";
    }

    // Validar que la fecha de fin sea posterior a la fecha de inicio
    if (item.fechaInicio && item.fechaFin) {
      const fechaInicio = new Date(item.fechaInicio);
      const fechaFin = new Date(item.fechaFin);
      
      if (fechaFin <= fechaInicio) {
        errors.fechaFin = "La fecha de fin debe ser posterior a la fecha de inicio";
      }
    }

    // Validaciones de información específica
    if (!item.presupuesto?.trim()) {
      errors.presupuesto = "El presupuesto es requerido";
    }

    if (item.porcentajeAvance === undefined || item.porcentajeAvance === null) {
      errors.porcentajeAvance = "El porcentaje de avance es requerido";
    } else if (item.porcentajeAvance < 0 || item.porcentajeAvance > 100) {
      errors.porcentajeAvance = "El porcentaje debe estar entre 0 y 100";
    }

    if (!item.accionesRealizadas?.trim()) {
      errors.accionesRealizadas = "Las acciones realizadas son requeridas";
    }

    if (!item.indicadoresAlcanzados?.trim()) {
      errors.indicadoresAlcanzados = "Los indicadores alcanzados son requeridos";
    }

    const isValid = Object.keys(errors).length === 0;

    return { isValid, errors };
  }, [item]);

  const getValidationMessage = (): string => {
    if (validation.isValid) {
      return "Formulario válido";
    }

    const missingFields = Object.entries(validation.errors)
      .map(([field, message]) => {
        const fieldLabels: Record<string, string> = {
          programa: "Programa",
          objetivo: "Objetivo",
          responsable: "Responsable",
          estado: "Estado",
          fechaInicio: "Fecha de Inicio",
          fechaFin: "Fecha de Fin",
          presupuesto: "Presupuesto",
          porcentajeAvance: "Porcentaje de Avance",
          accionesRealizadas: "Acciones Realizadas",
          indicadoresAlcanzados: "Indicadores Alcanzados"
        };
        
        return `• ${fieldLabels[field] || field}: ${message}`;
      })
      .join("\n");

    return `Por favor, complete los siguientes campos:\n\n${missingFields}`;
  };

  return {
    isValid: validation.isValid,
    errors: validation.errors,
    getValidationMessage
  };
};

/**
 * Hook para validar secciones específicas
 */
export const useSectionValidation = (item: PlanAccionItem) => {
  const validateBasicSection = (): boolean => {
    return !!(item.programa && item.objetivo && item.responsable && 
             item.estado && item.fechaInicio && item.fechaFin);
  };

  const validateDemographicSection = (): boolean => {
    // La sección demográfica es opcional
    return true;
  };

  const validateSpecificSection = (): boolean => {
    return !!(item.presupuesto && 
             item.porcentajeAvance !== undefined && 
             item.accionesRealizadas && 
             item.indicadoresAlcanzados);
  };

  return {
    validateBasicSection,
    validateDemographicSection,
    validateSpecificSection
  };
};