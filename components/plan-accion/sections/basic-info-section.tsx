import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { CollapsibleSection } from "./collapsible-section";
import { FieldError } from "./field-error";
import { type PlanAccionItem, type PlanAccionEstado } from "@/types/plan-accion";
import { BaseSectionProps } from "@/types/plan-accion-form";

interface BasicInfoSectionProps extends BaseSectionProps {
  item: PlanAccionItem;
  updateField: (field: keyof PlanAccionItem, value: any) => void;
  programas: Array<{ id?: string; nombre: string }>;
  metas: Array<{ id?: string; nombre: string }>;
  estados: PlanAccionEstado[];
  errors: Record<string, string>;
}

/**
 * Sección de información básica del plan de acción
 */
export const BasicInfoSection = React.memo<BasicInfoSectionProps>(({ 
  item,
  updateField,
  programas,
  metas,
  estados,
  errors,
  isOpen,
  onToggle,
  disabled = false
}) => {
  return (
    <CollapsibleSection
      title="Información Básica"
      subtitle="Datos principales del plan de acción"
      colorScheme="blue"
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="programa" className="block text-sm font-medium mb-1">
            Programa <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Select 
            value={item.programa || ""} 
            onValueChange={(value) => updateField("programa", value)}
            disabled={disabled}
          >
            <SelectTrigger 
              className="w-full" 
              id="programa"
              aria-invalid={!!errors.programa}
              aria-describedby={errors.programa ? "programa-error" : undefined}
            >
              <SelectValue placeholder="Seleccionar programa" />
            </SelectTrigger>
            <SelectContent>
              {programas.map((programa) => (
                <SelectItem key={programa.id || programa.nombre} value={programa.nombre}>
                  {programa.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="programa-error" message={errors.programa} />
        </div>

        <div>
          <label htmlFor="objetivo" className="block text-sm font-medium mb-1">
            Objetivo <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Select 
            value={item.objetivo || ""} 
            onValueChange={(value) => updateField("objetivo", value)}
            disabled={disabled || !item.programa}
          >
            <SelectTrigger 
              className="w-full" 
              id="objetivo"
              aria-invalid={!!errors.objetivo}
              aria-describedby={errors.objetivo ? "objetivo-error" : undefined}
            >
              <SelectValue placeholder="Seleccionar objetivo" />
            </SelectTrigger>
            <SelectContent>
              {metas.map((meta) => (
                <SelectItem key={meta.id || meta.nombre} value={meta.nombre}>
                  {meta.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="objetivo-error" message={errors.objetivo} />
        </div>

        <div>
          <label htmlFor="responsable" className="block text-sm font-medium mb-1">
            Responsable <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Input
            id="responsable"
            type="text"
            value={item.responsable || ""}
            onChange={(e) => updateField("responsable", e.target.value)}
            placeholder="Nombre del responsable"
            className="w-full"
            disabled={disabled}
            aria-invalid={!!errors.responsable}
            aria-describedby={errors.responsable ? "responsable-error" : undefined}
          />
          <FieldError id="responsable-error" message={errors.responsable} />
        </div>

        <div>
          <label htmlFor="estado" className="block text-sm font-medium mb-1">
            Estado <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <Select 
            value={item.estado || ""} 
            onValueChange={(value) => updateField("estado", value as PlanAccionEstado)}
            disabled={disabled}
          >
            <SelectTrigger 
              className="w-full" 
              id="estado"
              aria-invalid={!!errors.estado}
              aria-describedby={errors.estado ? "estado-error" : undefined}
            >
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {estados.map((estado) => (
                <SelectItem key={estado} value={estado}>
                  {estado}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="estado-error" message={errors.estado} />
        </div>

        <div>
          <label htmlFor="fechaInicio" className="block text-sm font-medium mb-1">
            Fecha de Inicio <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <DatePicker
            date={item.fechaInicio ? new Date(item.fechaInicio) : undefined}
            onDateChange={(date) => updateField("fechaInicio", date?.toISOString().split('T')[0])}
            placeholder="Seleccionar fecha de inicio"
            disabled={disabled}
            className={errors.fechaInicio ? "border-red-500" : ""}
            aria-invalid={!!errors.fechaInicio}
            aria-describedby={errors.fechaInicio ? "fechaInicio-error" : undefined}
          />
          <FieldError id="fechaInicio-error" message={errors.fechaInicio} />
        </div>

        <div>
          <label htmlFor="fechaFin" className="block text-sm font-medium mb-1">
            Fecha de Fin <span className="text-red-500" aria-label="requerido">*</span>
          </label>
          <DatePicker
            date={item.fechaFin ? new Date(item.fechaFin) : undefined}
            onDateChange={(date) => updateField("fechaFin", date?.toISOString().split('T')[0])}
            placeholder="Seleccionar fecha de fin"
            disabled={disabled}
            className={errors.fechaFin ? "border-red-500" : ""}
            aria-invalid={!!errors.fechaFin}
            aria-describedby={errors.fechaFin ? "fechaFin-error" : undefined}
          />
          <FieldError id="fechaFin-error" message={errors.fechaFin} />
        </div>
      </div>
    </CollapsibleSection>
  );
});

BasicInfoSection.displayName = "BasicInfoSection";