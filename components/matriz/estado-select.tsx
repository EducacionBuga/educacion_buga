"use client"

import { useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CheckCircle2, Clock, AlertCircle, CircleDot } from "lucide-react"

interface EstadoSelectProps {
  planId: string
  currentEstado: string
  onEstadoChange: (planId: string, nuevoEstado: string) => Promise<void>
  disabled?: boolean
}

const ESTADOS_OPCIONES = [
  {
    value: "Pendiente",
    label: "Pendiente",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
    icon: Clock,
  },
  {
    value: "En Proceso",
    label: "En Proceso",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
    icon: CircleDot,
  },
  {
    value: "Completado",
    label: "Completado",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
    icon: CheckCircle2,
  },
  {
    value: "Retrasado",
    label: "Retrasado",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
    icon: AlertCircle,
  },
]

export function EstadoSelect({ planId, currentEstado, onEstadoChange, disabled = false }: EstadoSelectProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleEstadoChange = async (nuevoEstado: string) => {
    if (nuevoEstado === currentEstado || isUpdating) return

    setIsUpdating(true)
    try {
      await onEstadoChange(planId, nuevoEstado)
    } catch (error) {
      console.error("Error actualizando estado:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const currentEstadoInfo = ESTADOS_OPCIONES.find(estado => estado.value === currentEstado) || ESTADOS_OPCIONES[0]
  const Icon = currentEstadoInfo.icon

  return (
    <Select
      value={currentEstado}
      onValueChange={handleEstadoChange}
      disabled={disabled || isUpdating}
    >
      <SelectTrigger 
        className={`w-[130px] h-8 ${currentEstadoInfo.bgColor} ${currentEstadoInfo.borderColor} ${currentEstadoInfo.color} border-2`}
      >
        <SelectValue>
          <div className="flex items-center gap-2">
            <Icon className="h-3 w-3" />
            <span className="text-xs font-medium">{currentEstadoInfo.label}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      
      <SelectContent>
        {ESTADOS_OPCIONES.map((estado) => {
          const EstadoIcon = estado.icon
          return (
            <SelectItem 
              key={estado.value} 
              value={estado.value}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <EstadoIcon className={`h-3 w-3 ${estado.color}`} />
                <span className="text-xs font-medium">{estado.label}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
