"use client"

import { useState, useCallback } from "react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { FileText, Save, Download, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  TipoContrato, 
  EtapaContrato, 
  RespuestaItem, 
  respuestaLabels,
  respuestaColors
} from "@/constants/checklist"
import { useChecklistDataDemo } from "@/hooks/use-checklist-data-demo"

export function ListaChequeoDemo() {
  // Obtener el área actual de la URL
  const pathname = usePathname()
  const areaMatch = pathname?.match(/\/dashboard\/([^/]+)\/lista-chequeo/)
  const areaCode = areaMatch ? areaMatch[1] : "area-desconocida"

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>(EtapaContrato.PRECONTRACTUAL)
  const [isExporting, setIsExporting] = useState(false)

  const {
    categorias,
    etapas,
    items,
    selectedTipoContrato,
    isLoading,
    isSaving,
    areaId,
    setSelectedTipoContrato,
    updateRespuesta,
    saveRespuestas,
    getRespuestaForItem,
    getItemsByEtapa,
    getProgresoByEtapa
  } = useChecklistDataDemo(areaCode)

  // Manejar cambio de respuesta
  const handleRespuestaChange = useCallback((itemId: string, respuesta: RespuestaItem) => {
    updateRespuesta(itemId, respuesta)
  }, [updateRespuesta])

  // Manejar cambio de observaciones
  const handleObservacionesChange = useCallback((itemId: string, observaciones: string) => {
    const currentRespuesta = getRespuestaForItem(itemId)
    updateRespuesta(itemId, currentRespuesta?.respuesta || null, observaciones)
  }, [updateRespuesta, getRespuestaForItem])

  // Manejar guardado
  const handleSave = useCallback(async () => {
    const success = await saveRespuestas()
    if (success) {
      toast({
        title: "Guardado exitoso",
        description: "Las respuestas se han guardado correctamente (modo demo)"
      })
    }
  }, [saveRespuestas, toast])

  // Manejar exportación a Excel (demo)
  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      // Simular exportación
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Exportación simulada",
        description: "En el modo demo, la exportación está simulada. Ejecute el script SQL para habilitar la funcionalidad completa.",
        variant: "default"
      })
    } catch (error) {
      console.error('Error al exportar:', error)
      toast({
        title: "Error en la exportación",
        description: "No se pudo exportar el archivo Excel",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }, [toast])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando lista de chequeo...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="h-5 w-5" />
              <CardTitle className="text-lg">Lista de Chequeo Contractual</CardTitle>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300 text-xs">
                MODO DEMO
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Select 
                value={selectedTipoContrato} 
                onValueChange={(value) => setSelectedTipoContrato(value as TipoContrato)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TipoContrato).map((tipo) => (
                    <SelectItem key={tipo} value={tipo}>
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleSave}
                disabled={isSaving}
                variant="default"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar
              </Button>
              
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                variant="outline"
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Exportar Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Información del área */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-blue-900">Área: {areaCode.replace('-', ' ').toUpperCase()}</h3>
              <p className="text-sm text-blue-700">Tipo de contrato: {selectedTipoContrato}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">Total de items: {items.length}</p>
              <p className="text-sm text-blue-700">Items respondidos: {
                items.filter(item => {
                  const respuesta = getRespuestaForItem(item.id)
                  return respuesta && respuesta.respuesta !== null
                }).length
              }</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs por etapa */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          {etapas.map((etapa) => {
            const progreso = getProgresoByEtapa(etapa.nombre)
            return (
              <TabsTrigger key={etapa.id} value={etapa.nombre} className="relative text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-xs">{etapa.nombre}</span>
                  <Badge variant={progreso.porcentaje === 100 ? "default" : "secondary"} className="text-xs scale-90">
                    {progreso.respondidos}/{progreso.total}
                  </Badge>
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {etapas.map((etapa) => (
          <TabsContent key={etapa.id} value={etapa.nombre}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{etapa.nombre}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Progreso:</span>
                    <Progress 
                      value={getProgresoByEtapa(etapa.nombre).porcentaje} 
                      className="w-24" 
                    />
                    <span className="text-sm font-medium">
                      {getProgresoByEtapa(etapa.nombre).porcentaje}%
                    </span>
                  </div>
                </div>
                {etapa.descripcion && (
                  <p className="text-sm text-muted-foreground">{etapa.descripcion}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getItemsByEtapa(etapa.nombre).map((item, index) => {
                    const respuesta = getRespuestaForItem(item.id)
                    
                    return (
                      <div key={item.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge variant="outline">#{item.numero_item}</Badge>
                              <h4 className="font-medium">{item.titulo}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {item.descripcion}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Respuestas */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Cumplimiento
                            </Label>
                            <RadioGroup
                              value={respuesta?.respuesta || ""}
                              onValueChange={(value) => handleRespuestaChange(item.id, value as RespuestaItem)}
                            >
                              {Object.values(RespuestaItem).map((opcion) => (
                                <div key={opcion} className="flex items-center space-x-2">
                                  <RadioGroupItem value={opcion} id={`${item.id}-${opcion}`} />
                                  <Label 
                                    htmlFor={`${item.id}-${opcion}`}
                                    className={`cursor-pointer ${respuestaColors[opcion]}`}
                                  >
                                    {respuestaLabels[opcion]}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          {/* Observaciones */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              Observaciones
                            </Label>
                            <Textarea
                              value={respuesta?.observaciones || ""}
                              onChange={(e) => handleObservacionesChange(item.id, e.target.value)}
                              placeholder="Ingrese observaciones aquí..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  
                  {getItemsByEtapa(etapa.nombre).length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay items disponibles para esta etapa en el tipo de contrato seleccionado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
