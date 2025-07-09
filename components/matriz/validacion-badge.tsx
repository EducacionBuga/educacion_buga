"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Clock, AlertCircle, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu"
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { EstadoValidacion, PlanValidacion } from "@/hooks/use-plan-validaciones"

interface ValidacionBadgeProps {
  planId: string
  validacion?: PlanValidacion
  isAdmin: boolean
  onValidar: (planId: string, estado: EstadoValidacion, comentarios?: string) => Promise<void>
  loading?: boolean
}

const estadoConfig = {
  pendiente: {
    icon: Clock,
    label: "Pendiente",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    variant: "outline" as const,
  },
  en_revision: {
    icon: AlertCircle,
    label: "En Revisión",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    variant: "outline" as const,
  },
  aprobado: {
    icon: CheckCircle,
    label: "Aprobado",
    color: "bg-green-100 text-green-800 border-green-300",
    variant: "outline" as const,
  },
  rechazado: {
    icon: XCircle,
    label: "Rechazado",
    color: "bg-red-100 text-red-800 border-red-300",
    variant: "outline" as const,
  },
}

export function ValidacionBadge({ 
  planId, 
  validacion, 
  isAdmin, 
  onValidar, 
  loading = false 
}: ValidacionBadgeProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [comentarios, setComentarios] = useState("")
  const [selectedEstado, setSelectedEstado] = useState<EstadoValidacion | null>(null)

  const estado = validacion?.estado_validacion || "pendiente"
  const config = estadoConfig[estado]
  const Icon = config.icon

  const handleValidar = async () => {
    if (!selectedEstado) return
    
    try {
      await onValidar(planId, selectedEstado, comentarios)
      setDialogOpen(false)
      setComentarios("")
      setSelectedEstado(null)
    } catch (error) {
      console.error("Error al validar:", error)
    }
  }

  const openDialog = (nuevoEstado: EstadoValidacion) => {
    setSelectedEstado(nuevoEstado)
    setComentarios(validacion?.comentarios || "")
    setDialogOpen(true)
  }

  return (
    <div className="flex items-center gap-2">
      <Badge 
        variant={config.variant}
        className={cn(
          "flex items-center gap-1 px-2 py-1",
          config.color
        )}
      >
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>

      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              disabled={loading}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => openDialog("aprobado")}>
              <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
              Aprobar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("rechazado")}>
              <XCircle className="mr-2 h-4 w-4 text-red-600" />
              Rechazar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => openDialog("en_revision")}>
              <AlertCircle className="mr-2 h-4 w-4 text-blue-600" />
              Poner en Revisión
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => openDialog("pendiente")}>
              <Clock className="mr-2 h-4 w-4 text-yellow-600" />
              Marcar como Pendiente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEstado === "aprobado" && "Aprobar Plan"}
              {selectedEstado === "rechazado" && "Rechazar Plan"}
              {selectedEstado === "en_revision" && "Poner en Revisión"}
              {selectedEstado === "pendiente" && "Marcar como Pendiente"}
            </DialogTitle>
            <DialogDescription>
              {selectedEstado === "aprobado" && 
                "¿Estás seguro de que quieres aprobar este plan? Puedes añadir comentarios adicionales."}
              {selectedEstado === "rechazado" && 
                "¿Estás seguro de que quieres rechazar este plan? Por favor, añade comentarios explicando el motivo."}
              {selectedEstado === "en_revision" && 
                "El plan será marcado como en revisión. Puedes añadir comentarios sobre qué necesita ser revisado."}
              {selectedEstado === "pendiente" && 
                "El plan será marcado como pendiente de validación."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="comentarios">Comentarios</Label>
              <Textarea
                id="comentarios"
                placeholder="Añade comentarios sobre la validación..."
                value={comentarios}
                onChange={(e) => setComentarios(e.target.value)}
                rows={3}
              />
            </div>

            {validacion && (
              <div className="space-y-2">
                <Label>Información actual</Label>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>Estado:</strong> {estadoConfig[validacion.estado_validacion].label}</p>
                  {validacion.fecha_validacion && (
                    <p><strong>Fecha:</strong> {new Date(validacion.fecha_validacion).toLocaleString()}</p>
                  )}
                  {validacion.comentarios && (
                    <p><strong>Comentarios anteriores:</strong> {validacion.comentarios}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleValidar}
                disabled={loading}
                className={cn(
                  selectedEstado === "aprobado" && "bg-green-600 hover:bg-green-700",
                  selectedEstado === "rechazado" && "bg-red-600 hover:bg-red-700",
                  selectedEstado === "en_revision" && "bg-blue-600 hover:bg-blue-700",
                  selectedEstado === "pendiente" && "bg-yellow-600 hover:bg-yellow-700"
                )}
              >
                {loading ? "Validando..." : "Confirmar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
