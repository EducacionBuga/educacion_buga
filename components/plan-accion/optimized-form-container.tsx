"use client"

import React, { useMemo, useCallback, useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { type PlanAccionItem } from "@/types/plan-accion"

// Hooks optimizados
import { useCollapsibleSections } from "@/hooks/use-collapsible-sections"
import { useFormValidation } from "@/hooks/use-form-validation"
import { useProgramasMetas } from "@/hooks/use-programas-metas"

// Componentes memoizados
import { BasicInfoSection } from "./sections/basic-info-section"
import { DemographicSelector } from "./sections/demographic-selector"
import { SpecificInfoSection } from "./sections/specific-info-section"

interface OptimizedFormContainerProps {
  initialItem: PlanAccionItem
  onSave: (item: PlanAccionItem) => Promise<void>
  onCancel: () => void
  disabled?: boolean
}

/**
 * Contenedor optimizado para el formulario de plan de acción
 * Implementa todas las mejores prácticas de rendimiento
 */
export const OptimizedFormContainer = React.memo<OptimizedFormContainerProps>(({ 
  initialItem, 
  onSave, 
  onCancel, 
  disabled = false 
}) => {
  // Estado local optimizado
  const [item, setItem] = useState<PlanAccionItem>(initialItem);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Hooks memoizados
  const { sectionsState, toggleSection } = useCollapsibleSections();
  const { isValid, errors, getValidationMessage } = useFormValidation(item);
  const { programas, getMetasByPrograma, loading: loadingProgramas } = useProgramasMetas();

  // Datos normalizados y memoizados
  const programasData = useMemo(() => {
    return programas.map((programa, index) => ({
      id: `programa-${index}`,
      nombre: programa
    }));
  }, [programas]);

  const metasData = useMemo(() => {
    if (!item.programa) return [];
    return getMetasByPrograma(item.programa).map((meta, index) => ({
      id: `meta-${index}`,
      nombre: meta
    }));
  }, [item.programa, getMetasByPrograma]);

  const estados = useMemo(() => [
    "Programado",
    "En ejecución", 
    "Ejecutado",
    "Suspendido",
    "Cancelado"
  ], []);

  // Handlers optimizados con useCallback
  const updateField = useCallback((field: keyof PlanAccionItem, value: any) => {
    setItem(prevItem => {
      // Optimización: solo actualizar si el valor realmente cambió
      if (prevItem[field] === value) return prevItem;
      
      const newItem = { ...prevItem, [field]: value };
      
      // Limpiar campos dependientes cuando sea necesario
      if (field === 'programa') {
        newItem.objetivo = '';
      }
      
      return newItem;
    });
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      await onSave(item);
    } catch (error) {
      console.error('Error al guardar:', error);
      // Aquí podrías mostrar un toast de error
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, onSave, item]);

  const handleCancel = useCallback(() => {
    if (isSubmitting) return;
    onCancel();
  }, [isSubmitting, onCancel]);

  // Handlers de fecha optimizados
  const setFechaInicioDate = useCallback((date: Date | null) => {
    updateField('fechaInicio', date?.toISOString().split('T')[0] || '');
  }, [updateField]);

  const setFechaFinDate = useCallback((date: Date | null) => {
    updateField('fechaFin', date?.toISOString().split('T')[0] || '');
  }, [updateField]);

  // Fechas memoizadas
  const fechaInicioDate = useMemo(() => {
    return item.fechaInicio ? new Date(item.fechaInicio) : null;
  }, [item.fechaInicio]);

  const fechaFinDate = useMemo(() => {
    return item.fechaFin ? new Date(item.fechaFin) : null;
  }, [item.fechaFin]);

  // Validación de formulario memoizada
  const canSubmit = useMemo(() => {
    return isValid && !isSubmitting && !disabled;
  }, [isValid, isSubmitting, disabled]);

  return (
    <div className="space-y-6">
      {/* Información Básica - Componente memoizado */}
      <BasicInfoSection
        item={item}
        updateField={updateField}
        programas={programasData}
        metas={metasData}
        estados={estados}
        errors={errors}
        isOpen={sectionsState.basic}
        onToggle={() => toggleSection('basic')}
        disabled={disabled || loadingProgramas}
      />

      {/* Información Demográfica - Componente memoizado */}
      <MemoizedDemographicSection
        item={item}
        updateField={updateField}
        isOpen={sectionsState.demographic}
        onToggle={() => toggleSection('demographic')}
        disabled={disabled}
      />

      {/* Información Específica - Componente memoizado */}
      <SpecificInfoSection
        item={item}
        updateField={updateField}
        errors={errors}
        isOpen={sectionsState.specific}
        onToggle={() => toggleSection('specific')}
        disabled={disabled}
      />

      {/* Botones de acción */}
      <div className="flex justify-end space-x-4 pt-6 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Mensaje de validación */}
      {!isValid && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 whitespace-pre-line">
            {getValidationMessage()}
          </p>
        </div>
      )}
    </div>
  );
});

// Componente demográfico memoizado para evitar re-renders innecesarios
const MemoizedDemographicSection = React.memo<{
  item: PlanAccionItem;
  updateField: (field: keyof PlanAccionItem, value: any) => void;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
}>(({ item, updateField, isOpen, onToggle, disabled }) => {
  return (
    <div className="border border-gray-200 rounded-lg">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-4 py-3 text-left bg-purple-50 hover:bg-purple-100 rounded-t-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-purple-900">
              Información Demográfica
            </h3>
            <p className="text-sm text-purple-600">
              Datos poblacionales (opcional)
            </p>
          </div>
          <div className="text-purple-600">
            {isOpen ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          <DemographicSelector
            item={item}
            updateField={updateField}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
});

MemoizedDemographicSection.displayName = "MemoizedDemographicSection";
OptimizedFormContainer.displayName = "OptimizedFormContainer";

export default OptimizedFormContainer;