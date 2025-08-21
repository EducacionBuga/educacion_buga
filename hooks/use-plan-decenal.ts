import { useState, useCallback, useMemo } from "react";
import { PlanDecenal, Macroobjetivo } from "@/types/plan-accion-form";
import { type PlanAccionItem } from "@/types/plan-accion";

interface UsePlanDecenalProps {
  planesDecenales: any[];
  updateField: (field: keyof PlanAccionItem, value: any) => void;
}

export const usePlanDecenal = ({ planesDecenales, updateField }: UsePlanDecenalProps) => {
  const [incluir, setIncluir] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedMacroobjetivo, setSelectedMacroobjetivo] = useState("");
  const [selectedObjetivo, setSelectedObjetivo] = useState("");

  // Normalizar datos de planes decenales
  const normalizedPlanes = useMemo(() => {
    return planesDecenales.map((plan, index) => ({
      id: plan.id || `plan-${index}`,
      nombre: plan.nombre,
      macroobjetivos: plan.macroobjetivos || []
    }));
  }, [planesDecenales]);

  // Obtener macroobjetivos del plan seleccionado
  const macroobjetivos = useMemo(() => {
    const plan = normalizedPlanes.find(p => p.nombre === selectedPlan);
    return plan?.macroobjetivos || [];
  }, [normalizedPlanes, selectedPlan]);

  // Obtener objetivos del macroobjetivo seleccionado
  const objetivos = useMemo(() => {
    const macro = macroobjetivos.find(m => m.nombre === selectedMacroobjetivo);
    return macro?.objetivos || [];
  }, [macroobjetivos, selectedMacroobjetivo]);

  // Manejar cambio de inclusión
  const handleIncluirChange = useCallback((value: boolean) => {
    setIncluir(value);
    if (!value) {
      // Limpiar todos los campos cuando se desactiva
      setSelectedPlan("");
      setSelectedMacroobjetivo("");
      setSelectedObjetivo("");
      updateField("metaDecenal", "");
      updateField("macroobjetivoDecenal", "");
      updateField("objetivoDecenal", "");
    }
  }, [updateField]);

  // Manejar cambio de plan
  const handlePlanChange = useCallback((plan: string) => {
    setSelectedPlan(plan);
    setSelectedMacroobjetivo(""); // Resetear macroobjetivo
    setSelectedObjetivo(""); // Resetear objetivo
    updateField("metaDecenal", plan);
    updateField("macroobjetivoDecenal", "");
    updateField("objetivoDecenal", "");
  }, [updateField]);

  // Manejar cambio de macroobjetivo
  const handleMacroobjetivoChange = useCallback((macro: string) => {
    setSelectedMacroobjetivo(macro);
    setSelectedObjetivo(""); // Resetear objetivo
    updateField("macroobjetivoDecenal", macro);
    updateField("objetivoDecenal", "");
  }, [updateField]);

  // Manejar cambio de objetivo
  const handleObjetivoChange = useCallback((objetivo: string) => {
    setSelectedObjetivo(objetivo);
    updateField("objetivoDecenal", objetivo);
  }, [updateField]);

  // Validar si la sección está completa
  const isValid = useMemo(() => {
    if (!incluir) return true; // Si no está incluido, es válido
    return selectedPlan && selectedMacroobjetivo && selectedObjetivo;
  }, [incluir, selectedPlan, selectedMacroobjetivo, selectedObjetivo]);

  return {
    incluir,
    selectedPlan,
    selectedMacroobjetivo,
    selectedObjetivo,
    normalizedPlanes,
    macroobjetivos,
    objetivos,
    isValid,
    handleIncluirChange,
    handlePlanChange,
    handleMacroobjetivoChange,
    handleObjetivoChange
  };
};