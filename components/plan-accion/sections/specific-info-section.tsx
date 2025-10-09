import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { CollapsibleSection } from "./collapsible-section";
import { FieldError } from "./field-error";
import { type PlanAccionItem } from "@/types/plan-accion";
import { BaseSectionProps } from "@/types/plan-accion-form";

interface SpecificInfoSectionProps extends BaseSectionProps {
  item: PlanAccionItem;
  updateField: (field: keyof PlanAccionItem, value: any) => void;
  errors: Record<string, string>;
}

/**
 * Sección de información específica del plan de acción
 */
export const SpecificInfoSection = React.memo<SpecificInfoSectionProps>(({ 
  item,
  updateField,
  errors,
  isOpen,
  onToggle,
  disabled = false
}) => {
  const formatCurrency = (value: string) => {
    // Remover caracteres no numéricos excepto punto y coma
    const numericValue = value.replace(/[^\d.,]/g, '');
    
    // Convertir a número para formatear
    const number = parseFloat(numericValue.replace(/,/g, ''));
    
    if (isNaN(number)) return '';
    
    // Formatear con puntos como separadores de miles (formato colombiano)
    const formatted = number.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `$${formatted}`;
  };

  const handlePresupuestoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const formatted = formatCurrency(value);
    updateField("presupuesto", formatted);
  };

  const handlePorcentajeChange = (value: number[]) => {
    const percentage = Math.max(0, Math.min(100, value[0]));
    updateField("porcentajeAvance", percentage);
  };

  const handlePorcentajeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    const percentage = Math.max(0, Math.min(100, value));
    updateField("porcentajeAvance", percentage);
  };

  return (
    <CollapsibleSection
      title="Información Específica"
      subtitle="Detalles técnicos y de seguimiento"
      colorScheme="green"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-4">
        <div>
          <label htmlFor="presupuesto" className="block text-sm font-medium mb-1">
            Presupuesto <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Input
            id="presupuesto"
            type="text"
            value={item.presupuesto || ""}
            onChange={handlePresupuestoChange}
            placeholder="$0"
            className="w-full"
            disabled={disabled}
            aria-invalid={!!errors.presupuesto}
            aria-describedby={errors.presupuesto ? "presupuesto-error" : "presupuesto-help"}
          />
          <p id="presupuesto-help" className="text-xs text-gray-500 mt-1">
            Ingrese el valor en pesos colombianos
          </p>
          <FieldError id="presupuesto-error" message={errors.presupuesto} />
        </div>

        <div>
          <label htmlFor="porcentajeAvance" className="block text-sm font-medium mb-1">
            Porcentaje de Avance <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <div className="space-y-3">
            <div className="px-3">
              <Slider
                value={[item.porcentajeAvance || 0]}
                onValueChange={handlePorcentajeChange}
                max={100}
                min={0}
                step={1}
                className="w-full"
                disabled={disabled}
                aria-label="Porcentaje de avance"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                id="porcentajeAvance"
                type="number"
                value={item.porcentajeAvance || 0}
                onChange={handlePorcentajeInputChange}
                min={0}
                max={100}
                className="w-20"
                disabled={disabled}
                aria-invalid={!!errors.porcentajeAvance}
                aria-describedby={errors.porcentajeAvance ? "porcentajeAvance-error" : undefined}
              />
              <span className="text-sm text-gray-500">%</span>
            </div>
          </div>
          <FieldError id="porcentajeAvance-error" message={errors.porcentajeAvance} />
        </div>

        <div>
          <label htmlFor="accionesRealizadas" className="block text-sm font-medium mb-1">
            Acciones Realizadas <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Textarea
            id="accionesRealizadas"
            value={item.accionesRealizadas || ""}
            onChange={(e) => updateField("accionesRealizadas", e.target.value)}
            placeholder="Describa las acciones realizadas..."
            className="w-full min-h-[100px]"
            disabled={disabled}
            aria-invalid={!!errors.accionesRealizadas}
            aria-describedby={errors.accionesRealizadas ? "accionesRealizadas-error" : "accionesRealizadas-help"}
          />
          <p id="accionesRealizadas-help" className="text-xs text-gray-500 mt-1">
            Detalle las actividades y acciones específicas ejecutadas
          </p>
          <FieldError id="accionesRealizadas-error" message={errors.accionesRealizadas} />
        </div>

        <div>
          <label htmlFor="indicadoresAlcanzados" className="block text-sm font-medium mb-1">
            Indicadores Alcanzados <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Textarea
            id="indicadoresAlcanzados"
            value={item.indicadoresAlcanzados || ""}
            onChange={(e) => updateField("indicadoresAlcanzados", e.target.value)}
            placeholder="Describa los indicadores alcanzados..."
            className="w-full min-h-[100px]"
            disabled={disabled}
            aria-invalid={!!errors.indicadoresAlcanzados}
            aria-describedby={errors.indicadoresAlcanzados ? "indicadoresAlcanzados-error" : "indicadoresAlcanzados-help"}
          />
          <p id="indicadoresAlcanzados-help" className="text-xs text-gray-500 mt-1">
            Especifique los resultados medibles y logros obtenidos
          </p>
          <FieldError id="indicadoresAlcanzados-error" message={errors.indicadoresAlcanzados} />
        </div>
      </div>
    </CollapsibleSection>
  );
});

SpecificInfoSection.displayName = "SpecificInfoSection";