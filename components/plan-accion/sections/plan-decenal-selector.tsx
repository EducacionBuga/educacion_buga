import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlanDecenalSelectorProps } from "@/types/plan-accion-form";

/**
 * Componente especializado para la selección de Plan Decenal
 */
export const PlanDecenalSelector = React.memo<PlanDecenalSelectorProps>(({ 
  incluir,
  onIncluirChange,
  selectedPlan,
  onPlanChange,
  selectedMacroobjetivo,
  onMacroobjetivoChange,
  selectedObjetivo,
  onObjetivoChange,
  planesDecenales,
  macroobjetivos,
  objetivos,
  disabled = false
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="incluir-plan-decenal"
          checked={incluir}
          onCheckedChange={onIncluirChange}
          disabled={disabled}
          aria-describedby="plan-decenal-description"
        />
        <label 
          htmlFor="incluir-plan-decenal" 
          className="text-sm font-medium cursor-pointer"
        >
          ¿Quieres agregar Plan Decenal de Educación?
        </label>
      </div>
      <p id="plan-decenal-description" className="sr-only">
        Selecciona esta opción para incluir información del Plan Decenal de Educación
      </p>

      {incluir && (
        <div className="grid gap-4" role="group" aria-labelledby="plan-decenal-fields">
          <h4 id="plan-decenal-fields" className="sr-only">
            Campos del Plan Decenal de Educación
          </h4>
          
          <div>
            <label htmlFor="plan-decenal" className="block text-sm font-medium mb-1">
              Plan Decenal <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedPlan}
              onValueChange={onPlanChange}
              disabled={disabled}
            >
              <SelectTrigger 
                className="w-full" 
                id="plan-decenal"
                aria-describedby="plan-decenal-help"
              >
                <SelectValue placeholder="Seleccione un Plan Decenal" />
              </SelectTrigger>
              <SelectContent>
                {planesDecenales.map((plan) => (
                  <SelectItem key={plan.id || plan.nombre} value={plan.nombre}>
                    {plan.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="plan-decenal-help" className="sr-only">
              Selecciona el plan decenal de educación correspondiente
            </p>
          </div>

          <div>
            <label htmlFor="macroobjetivo" className="block text-sm font-medium mb-1">
              Macroobjetivo <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedMacroobjetivo}
              onValueChange={onMacroobjetivoChange}
              disabled={disabled || !selectedPlan}
            >
              <SelectTrigger 
                className="w-full" 
                id="macroobjetivo"
                aria-describedby="macroobjetivo-help"
              >
                <SelectValue placeholder="Seleccione un Macroobjetivo" />
              </SelectTrigger>
              <SelectContent>
                {macroobjetivos.map((macro) => (
                  <SelectItem key={macro.id || macro.nombre} value={macro.nombre}>
                    {macro.nombre.split("\n")[0]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="macroobjetivo-help" className="sr-only">
              Selecciona el macroobjetivo del plan decenal
            </p>
          </div>

          <div>
            <label htmlFor="objetivo-decenal" className="block text-sm font-medium mb-1">
              Objetivo Decenal <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedObjetivo}
              onValueChange={onObjetivoChange}
              disabled={disabled || !selectedMacroobjetivo}
            >
              <SelectTrigger 
                className="w-full" 
                id="objetivo-decenal"
                aria-describedby="objetivo-decenal-help"
              >
                <SelectValue placeholder="Seleccione un Objetivo" />
              </SelectTrigger>
              <SelectContent>
                {objetivos.map((obj, index) => (
                  <SelectItem key={`${obj}-${index}`} value={obj}>
                    {obj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="objetivo-decenal-help" className="sr-only">
              Selecciona el objetivo específico del macroobjetivo
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

PlanDecenalSelector.displayName = "PlanDecenalSelector";