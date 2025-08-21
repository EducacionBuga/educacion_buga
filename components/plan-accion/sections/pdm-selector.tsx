import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PDMSelectorProps } from "@/types/plan-accion-form";

/**
 * Componente especializado para la selección de PDM
 */
export const PDMSelector = React.memo<PDMSelectorProps>(({ 
  incluir,
  onIncluirChange,
  selectedPrograma,
  onProgramaChange,
  selectedSubprograma,
  onSubprogramaChange,
  selectedProyecto,
  onProyectoChange,
  programasPDM,
  subprogramas,
  proyectos,
  disabled = false,
  onDownload
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="incluir-pdm"
            checked={incluir}
            onCheckedChange={onIncluirChange}
            disabled={disabled}
            aria-describedby="pdm-description"
          />
          <label 
            htmlFor="incluir-pdm" 
            className="text-sm font-medium cursor-pointer"
          >
            ¿Quieres agregar Plan de Desarrollo Municipal (PDM) 2024-2027?
          </label>
        </div>
        {onDownload && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0"
            title="Consultar y descargar Plan de Desarrollo Municipal"
            onClick={onDownload}
            aria-label="Descargar Plan de Desarrollo Municipal"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p id="pdm-description" className="sr-only">
        Selecciona esta opción para incluir información del Plan de Desarrollo Municipal
      </p>

      {incluir && (
        <div className="grid gap-4" role="group" aria-labelledby="pdm-fields">
          <h4 id="pdm-fields" className="sr-only">
            Campos del Plan de Desarrollo Municipal
          </h4>
          
          <div>
            <label htmlFor="programa-pdm" className="block text-sm font-medium mb-1">
              Programa PDM <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedPrograma}
              onValueChange={onProgramaChange}
              disabled={disabled}
            >
              <SelectTrigger 
                className="w-full" 
                id="programa-pdm"
                aria-describedby="programa-pdm-help"
              >
                <SelectValue placeholder="Seleccione un Programa PDM" />
              </SelectTrigger>
              <SelectContent>
                {programasPDM.map((programa) => (
                  <SelectItem key={programa.id || programa.nombre} value={programa.nombre}>
                    {programa.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="programa-pdm-help" className="sr-only">
              Selecciona el programa del Plan de Desarrollo Municipal
            </p>
          </div>

          <div>
            <label htmlFor="subprograma-pdm" className="block text-sm font-medium mb-1">
              Subprograma PDM <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedSubprograma}
              onValueChange={onSubprogramaChange}
              disabled={disabled || !selectedPrograma}
            >
              <SelectTrigger 
                className="w-full" 
                id="subprograma-pdm"
                aria-describedby="subprograma-pdm-help"
              >
                <SelectValue placeholder="Seleccione un Subprograma PDM" />
              </SelectTrigger>
              <SelectContent>
                {subprogramas.map((subprograma) => (
                  <SelectItem key={subprograma.id || subprograma.nombre} value={subprograma.nombre}>
                    {subprograma.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="subprograma-pdm-help" className="sr-only">
              Selecciona el subprograma del programa PDM
            </p>
          </div>

          <div>
            <label htmlFor="proyecto-pdm" className="block text-sm font-medium mb-1">
              Proyecto/Actividad PDM <span className="text-red-500" aria-label="requerido">*</span>
            </label>
            <Select
              value={selectedProyecto}
              onValueChange={onProyectoChange}
              disabled={disabled || !selectedSubprograma}
            >
              <SelectTrigger 
                className="w-full" 
                id="proyecto-pdm"
                aria-describedby="proyecto-pdm-help"
              >
                <SelectValue placeholder="Seleccione un Proyecto/Actividad PDM" />
              </SelectTrigger>
              <SelectContent>
                {proyectos.map((proyecto, index) => (
                  <SelectItem key={`${proyecto}-${index}`} value={proyecto}>
                    {proyecto}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="proyecto-pdm-help" className="sr-only">
              Selecciona el proyecto o actividad específica del subprograma
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

PDMSelector.displayName = "PDMSelector";