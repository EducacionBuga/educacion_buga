"use client"

import React, { useMemo, useCallback } from "react"
import { type PlanAccionEstado, type PlanAccionItem } from "@/types/plan-accion"
import { FormSection } from "@/types/plan-accion-form"

// Hooks
import { useCollapsibleSections } from "@/hooks/use-collapsible-sections"
import { usePlanDecenal } from "@/hooks/use-plan-decenal"
import { usePDM } from "@/hooks/use-pdm"
import { useFormValidation } from "@/hooks/use-form-validation"
import { useNormalizedData } from "@/hooks/use-normalized-data"
import { useProgramasMetas } from "@/hooks/use-programas-metas"

// Components
import { BasicInfoSection } from "./sections/basic-info-section"
import { DemographicSelector } from "./sections/demographic-selector"
import { SpecificInfoSection } from "./sections/specific-info-section"
import { CollapsibleSection } from "./sections/collapsible-section"
import { PlanDecenalSelector } from "./sections/plan-decenal-selector"
import { PDMSelector } from "./sections/pdm-selector"
import { ProgramaMetaSelector } from "@/components/ui/smart-selector"

// Constants
import { planesDesarrolloMunicipal, getSubprogramasByPrograma, getProyectosBySubprograma } from "@/constants/plan-desarrollo-municipal"

interface PlanAccionFormSectionsProps {
  item: PlanAccionItem
  errors: Record<string, string>
  fechaInicioDate: Date | null
  fechaFinDate: Date | null
  updateField: (field: keyof PlanAccionItem, value: any) => void
  setFechaInicioDate: (date: Date | null) => void
  setFechaFinDate: (date: Date | null) => void
  // Props para Plan Decenal
  incluirPlanDecenal: boolean
  setIncluirPlanDecenal: (value: boolean) => void
  selectedPlan: string
  setSelectedPlan: (value: string) => void
  selectedMacroobjetivo: string
  setSelectedMacroobjetivo: (value: string) => void
  selectedObjetivo: string
  setSelectedObjetivo: (value: string) => void
  macroobjetivos: any[]
  objetivos: string[]
  planesDecenales: any[]
  // Props para PDM
  incluirPDM: boolean
  setIncluirPDM: (value: boolean) => void
  selectedProgramaPDM: string
  setSelectedProgramaPDM: (value: string) => void
  selectedSubprogramaPDM: string
  setSelectedSubprogramaPDM: (value: string) => void
  selectedProyectoPDM: string
  setSelectedProyectoPDM: (value: string) => void
}

/**
 * Componente contenedor para las secciones del formulario de plan de acción
 * Aplica separación de presentación vs contenedores
 */
export const PlanAccionFormSections = React.memo<PlanAccionFormSectionsProps>({
  item,
  errors,
  fechaInicioDate,
  fechaFinDate,
  updateField,
  setFechaInicioDate,
  setFechaFinDate,
  incluirPlanDecenal,
  setIncluirPlanDecenal,
  selectedPlan,
  setSelectedPlan,
  selectedMacroobjetivo,
  setSelectedMacroobjetivo,
  selectedObjetivo,
  setSelectedObjetivo,
  macroobjetivos,
  objetivos,
  planesDecenales,
  incluirPDM,
  setIncluirPDM,
  selectedProgramaPDM,
  setSelectedProgramaPDM,
  selectedSubprogramaPDM,
  setSelectedSubprogramaPDM,
  selectedProyectoPDM,
  setSelectedProyectoPDM
}) => {
  // Hook para manejar secciones colapsables
  const { sectionsState, toggleSection, setSection, resetSections } = useCollapsibleSections();

  // Hook para datos de programas y metas
  const { programas, getMetasByPrograma, loading: loadingProgramas } = useProgramasMetas();

  // Memoizar metas disponibles
  const availableMetas = useMemo(() => {
    if (!item.programa) return [];
    return getMetasByPrograma(item.programa).map(meta => ({ nombre: meta }));
  }, [item.programa, getMetasByPrograma]);

  // Normalizar datos de programas
  const programasNormalized = useMemo(() => {
    return programas.map(programa => ({ nombre: programa }));
  }, [programas]);

  // Hook para validación del formulario
  const { isValid, errors: validationErrors } = useFormValidation(item);

  // Hook para Plan Decenal
  const planDecenalHook = usePlanDecenal({
    incluir: incluirPlanDecenal,
    onIncluirChange: setIncluirPlanDecenal,
    selectedPlan,
    onPlanChange: setSelectedPlan,
    selectedMacroobjetivo,
    onMacroobjetivoChange: setSelectedMacroobjetivo,
    selectedObjetivo,
    onObjetivoChange: setSelectedObjetivo,
    planesDecenales,
    macroobjetivos,
    objetivos
  });

  // Hook para PDM
  const pdmHook = usePDM({
    incluir: incluirPDM,
    onIncluirChange: setIncluirPDM,
    selectedPrograma: selectedProgramaPDM,
    onProgramaChange: setSelectedProgramaPDM,
    selectedSubprograma: selectedSubprogramaPDM,
    onSubprogramaChange: setSelectedSubprogramaPDM,
    selectedProyecto: selectedProyectoPDM,
    onProyectoChange: setSelectedProyectoPDM,
    programasPDM: planesDesarrolloMunicipal,
    getSubprogramas: getSubprogramasByPrograma,
    getProyectos: getProyectosBySubprograma
  });

  // Estados disponibles
  const estados: PlanAccionEstado[] = [
    "Programado",
    "En ejecución",
    "Ejecutado",
    "Suspendido",
    "Cancelado"
  ];

  // Handlers optimizados
  const handleFieldUpdate = useCallback((field: keyof PlanAccionItem, value: any) => {
    updateField(field, value);
  }, [updateField]);

  const handleDownloadPDM = useCallback(() => {
    pdmHook.downloadPDM();
  }, [pdmHook]);

  return (
    <div className="space-y-6">
      {/* Sección de Información Básica */}
      <BasicInfoSection
        item={item}
        updateField={handleFieldUpdate}
        programas={programasNormalized}
        metas={availableMetas}
        estados={estados}
        errors={errors}
        isOpen={sectionsState[FormSection.BASIC]}
        onToggle={() => toggleSection(FormSection.BASIC)}
        disabled={loadingProgramas}
      />

      {/* Sección de Información Demográfica */}
      <CollapsibleSection
        title="Información Demográfica"
        subtitle="Datos poblacionales (opcional)"
        colorScheme="purple"
        isOpen={sectionsState[FormSection.DEMOGRAPHIC]}
        onToggle={() => toggleSection(FormSection.DEMOGRAPHIC)}
      >
        <DemographicSelector
          item={item}
          updateField={handleFieldUpdate}
        />
      </CollapsibleSection>

      {/* Sección de Información Específica */}
      <SpecificInfoSection
        item={item}
        updateField={handleFieldUpdate}
        errors={errors}
        isOpen={sectionsState[FormSection.SPECIFIC]}
        onToggle={() => toggleSection(FormSection.SPECIFIC)}
      />

      {/* Sección de Plan Decenal */}
      <CollapsibleSection
        title="Plan Decenal de Educación"
        subtitle="Información del Plan Decenal (opcional)"
        colorScheme="orange"
        isOpen={sectionsState[FormSection.PLAN_DECENAL]}
        onToggle={() => toggleSection(FormSection.PLAN_DECENAL)}
      >
        <PlanDecenalSelector
          incluir={planDecenalHook.incluir}
          onIncluirChange={planDecenalHook.onIncluirChange}
          selectedPlan={planDecenalHook.selectedPlan}
          onPlanChange={planDecenalHook.onPlanChange}
          selectedMacroobjetivo={planDecenalHook.selectedMacroobjetivo}
          onMacroobjetivoChange={planDecenalHook.onMacroobjetivoChange}
          selectedObjetivo={planDecenalHook.selectedObjetivo}
          onObjetivoChange={planDecenalHook.onObjetivoChange}
          planesDecenales={planDecenalHook.planesDecenales}
          macroobjetivos={planDecenalHook.macroobjetivos}
          objetivos={planDecenalHook.objetivos}
        />
      </CollapsibleSection>

      {/* Sección de PDM */}
      <CollapsibleSection
        title="Plan de Desarrollo Municipal (PDM)"
        subtitle="Información del PDM 2024-2027 (opcional)"
        colorScheme="teal"
        isOpen={sectionsState[FormSection.PDM]}
        onToggle={() => toggleSection(FormSection.PDM)}
      >
        <PDMSelector
          incluir={pdmHook.incluir}
          onIncluirChange={pdmHook.onIncluirChange}
          selectedPrograma={pdmHook.selectedPrograma}
          onProgramaChange={pdmHook.onProgramaChange}
          selectedSubprograma={pdmHook.selectedSubprograma}
          onSubprogramaChange={pdmHook.onSubprogramaChange}
          selectedProyecto={pdmHook.selectedProyecto}
          onProyectoChange={pdmHook.onProyectoChange}
          programasPDM={pdmHook.programasPDM}
          subprogramas={pdmHook.subprogramas}
          proyectos={pdmHook.proyectos}
          onDownload={handleDownloadPDM}
        />
      </CollapsibleSection>
    </div>
  );
});

PlanAccionFormSections.displayName = "PlanAccionFormSections";

export default PlanAccionFormSections;