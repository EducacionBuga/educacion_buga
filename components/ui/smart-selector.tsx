"use client"

import { useState, useRef, useEffect } from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

interface SmartSelectorProps {
  options: string[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  className?: string
  disabled?: boolean
  required?: boolean
  error?: boolean
}

// Componente simple sin búsqueda para programa usando Select de Radix UI
export function SimpleSelectorNoSearch({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  emptyMessage = "No se encontraron resultados",
  className,
  disabled = false,
  required = false,
  error = false
}: Omit<SmartSelectorProps, 'searchPlaceholder'>) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger 
        className={cn(
          "w-full",
          error && "border-red-500",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

// Componente para meta usando Select de Radix UI (sin búsqueda)
export function SmartSelector({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados",
  className,
  disabled = false,
  required = false,
  error = false
}: SmartSelectorProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger 
        className={cn(
          "w-full",
          error && "border-red-500",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.length === 0 ? (
          <div className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}

// Componente especifico para seleccion de programas y metas
interface ProgramaMetaSelectorProps {
  programas: string[]
  metas: string[]
  selectedPrograma: string
  selectedMeta: string
  onProgramaChange: (programa: string) => void
  onMetaChange: (meta: string) => void
  programaError?: boolean
  metaError?: boolean
  disabled?: boolean
}

export function ProgramaMetaSelector({
  programas,
  metas,
  selectedPrograma,
  selectedMeta,
  onProgramaChange,
  onMetaChange,
  programaError = false,
  metaError = false,
  disabled = false
}: ProgramaMetaSelectorProps) {

  const handleProgramaChange = (programa: string) => {
    onProgramaChange(programa)
    // Limpiar la meta seleccionada cuando cambia el programa
    if (selectedMeta) {
      onMetaChange("")
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="programa-selector" className="block text-sm font-medium mb-1">
          Programa <span className="text-red-500">*</span>
        </label>
        <SimpleSelectorNoSearch
          options={programas}
          value={selectedPrograma}
          onValueChange={handleProgramaChange}
          placeholder="Seleccione un programa"
          emptyMessage="No se encontraron programas"
          error={programaError}
          disabled={disabled}
        />
      </div>

      <div>
        <label htmlFor="meta-selector" className="block text-sm font-medium mb-1">
          Meta <span className="text-red-500">*</span>
        </label>
        <SmartSelector
          options={metas}
          value={selectedMeta}
          onValueChange={onMetaChange}
          placeholder={selectedPrograma ? "Seleccione una meta" : "Primero seleccione un programa"}
          searchPlaceholder="Buscar meta..."
          emptyMessage={selectedPrograma ? "No se encontraron metas para este programa" : "Seleccione un programa primero"}
          error={metaError}
          disabled={disabled || !selectedPrograma}
        />
      </div>
    </div>
  )
}