import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  GrupoEtareo, 
  GrupoPoblacion, 
  Zona, 
  GrupoEtnico,
  GRUPO_ETAREO_LABELS,
  GRUPO_POBLACION_LABELS,
  ZONA_LABELS,
  GRUPO_ETNICO_LABELS
} from "@/types/plan-accion-form";
import { type PlanAccionItem } from "@/types/plan-accion";

interface DemographicSelectorProps {
  item: PlanAccionItem;
  updateField: (field: keyof PlanAccionItem, value: any) => void;
  disabled?: boolean;
}

/**
 * Componente especializado para la selección de información demográfica
 */
export const DemographicSelector = React.memo<DemographicSelectorProps>(({ 
  item, 
  updateField, 
  disabled = false 
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div>
        <label htmlFor="grupoEtareo" className="block text-sm font-medium mb-1">
          Grupo Etáreo
        </label>
        <Select 
          value={item.grupoEtareo || ""} 
          onValueChange={(value) => updateField("grupoEtareo", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" id="grupoEtareo">
            <SelectValue placeholder="Seleccionar grupo etáreo" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GRUPO_ETAREO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="grupoPoblacion" className="block text-sm font-medium mb-1">
          Grupo de Población Identificado
        </label>
        <Select 
          value={item.grupoPoblacion || ""} 
          onValueChange={(value) => updateField("grupoPoblacion", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" id="grupoPoblacion">
            <SelectValue placeholder="Seleccionar grupo de población" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GRUPO_POBLACION_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="zona" className="block text-sm font-medium mb-1">
          Zona
        </label>
        <Select 
          value={item.zona || ""} 
          onValueChange={(value) => updateField("zona", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" id="zona">
            <SelectValue placeholder="Seleccionar zona" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(ZONA_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="grupoEtnico" className="block text-sm font-medium mb-1">
          Grupo Étnico
        </label>
        <Select 
          value={item.grupoEtnico || ""} 
          onValueChange={(value) => updateField("grupoEtnico", value)}
          disabled={disabled}
        >
          <SelectTrigger className="w-full" id="grupoEtnico">
            <SelectValue placeholder="Seleccionar grupo étnico" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(GRUPO_ETNICO_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="cantidad" className="block text-sm font-medium mb-1">
          Cantidad
        </label>
        <Input
          id="cantidad"
          type="number"
          value={item.cantidad || ""}
          onChange={(e) => {
            // Asegurar que sea un valor numérico o vacío
            const value = e.target.value === "" ? "" : e.target.value;
            updateField("cantidad", value);
          }}
          placeholder="Dato numérico"
          className="w-full"
          disabled={disabled}
        />
      </div>
    </div>
  );
});

DemographicSelector.displayName = "DemographicSelector";