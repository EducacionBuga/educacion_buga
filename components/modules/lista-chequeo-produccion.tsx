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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { FileText, Save, Download, Loader2, AlertCircle, CheckCircle, RefreshCw, Plus, Building2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { 
  TipoContrato, 
  EtapaContrato, 
  RespuestaItem, 
  respuestaLabels,
  respuestaColors
} from "@/constants/checklist"
import { useChecklistData } from "@/hooks/use-checklist-data"

export function ListaChequeoProduccion() {
  // Obtener el área actual de la URL
  const pathname = usePathname()
  const areaMatch = pathname?.match(/\/dashboard\/([^/]+)\/lista-chequeo/)
  const areaCode = areaMatch ? areaMatch[1] : "area-desconocida"

  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<string>(EtapaContrato.PRECONTRACTUAL)
  const [isExporting, setIsExporting] = useState(false)
  const [showNewContractForm, setShowNewContractForm] = useState(false)
  const [newContract, setNewContract] = useState({
    numeroContrato: '',
    valorContrato: '',
    contratista: ''
  })

  const {
    categorias,
    etapas,
    items,
    registros,
    selectedTipoContrato,
    selectedRegistro,
    isLoading,
    isSaving,
    error,
    areaId,
    setSelectedTipoContrato,
    setSelectedRegistro,
    updateRespuesta,
    saveRespuestas,
    exportToExcel,
    createRegistro,
    getRespuestaForItem,
    getItemsByEtapa,
    getProgresoByEtapa,
    reload
  } = useChecklistData(areaCode)

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
        title: "✅ Guardado exitoso",
        description: "Las respuestas se han guardado correctamente en la base de datos"
      })
    } else {
      toast({
        title: "❌ Error al guardar",
        description: "No se pudieron guardar las respuestas. Por favor, inténtelo de nuevo.",
        variant: "destructive"
      })
    }
  }, [saveRespuestas, toast])

  // Manejar exportación a Excel
  const handleExport = useCallback(async () => {
    if (!selectedRegistro) {
      toast({
        title: "⚠️ Sin registro seleccionado",
        description: "Debe seleccionar un contrato para exportar",
        variant: "destructive"
      })
      return
    }

    setIsExporting(true)
    try {
      const success = await exportToExcel(selectedRegistro.id)
      
      if (success) {
        toast({
          title: "📄 Exportación completada",
          description: `Archivo Excel descargado: lista-chequeo-${selectedRegistro.numero_contrato}.xlsx`,
        })
      } else {
        toast({
          title: "⚠️ Error en la exportación",
          description: "No se pudo exportar el archivo Excel",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error al exportar:', error)
      toast({
        title: "❌ Error en la exportación",
        description: "No se pudo exportar el archivo Excel",
        variant: "destructive"
      })
    } finally {
      setIsExporting(false)
    }
  }, [exportToExcel, selectedRegistro, toast])

  // Manejar recarga manual
  const handleReload = useCallback(() => {
    reload()
    toast({
      title: "🔄 Recargando datos",
      description: "Actualizando información desde la base de datos..."
    })
  }, [reload, toast])

  // Manejar creación de nuevo contrato
  const handleCreateContract = useCallback(async () => {
    if (!newContract.numeroContrato || !newContract.contratista) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Debe completar número de contrato y contratista",
        variant: "destructive"
      })
      return
    }

    const valorContrato = parseFloat(newContract.valorContrato) || 0

    const nuevoRegistro = await createRegistro(
      newContract.numeroContrato,
      valorContrato,
      newContract.contratista
    )

    if (nuevoRegistro) {
      toast({
        title: "✅ Contrato creado",
        description: `Contrato ${newContract.numeroContrato} creado exitosamente`
      })
      setShowNewContractForm(false)
      setNewContract({
        numeroContrato: '',
        valorContrato: '',
        contratista: ''
      })
    } else {
      toast({
        title: "❌ Error al crear contrato",
        description: "No se pudo crear el contrato. Verifique que el número no exista.",
        variant: "destructive"
      })
    }
  }, [newContract, createRegistro, toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-lg font-medium">Cargando lista de chequeo...</p>
              <p className="text-sm text-muted-foreground">Conectando con la base de datos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error de conexión:</strong> {error}
          </AlertDescription>
        </Alert>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-red-600">Error al cargar los datos</p>
              <p className="text-sm text-muted-foreground mb-4">
                No se pudo conectar con la base de datos
              </p>
              <Button onClick={handleReload} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
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
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-300 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                PRODUCCIÓN
              </Badge>
            </div>
            <div className="flex items-center space-x-3">
              <Select 
                value={selectedTipoContrato} 
                onValueChange={(value) => setSelectedTipoContrato(value as TipoContrato)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Seleccionar tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nombre}>
                      {categoria.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button 
                onClick={handleReload}
                variant="outline"
                size="sm"
                disabled={isLoading}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              
              <Button 
                onClick={handleSave}
                disabled={isSaving || isLoading || !selectedRegistro}
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
                disabled={isExporting || isLoading || !selectedRegistro}
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
              <h3 className="font-medium text-blue-900">
                📍 Área: {areaCode.replace(/-/g, ' ').toUpperCase()}
              </h3>
              <p className="text-sm text-blue-700">
                📋 Tipo de contrato: {selectedTipoContrato}
              </p>
              <p className="text-xs text-blue-600">
                🔗 ID de área: {areaId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-700">📊 Total de items: {items.length}</p>
              <p className="text-sm text-blue-700">
                ✅ Items respondidos: {
                  items.filter(item => {
                    const respuesta = getRespuestaForItem(item.id)
                    return respuesta && respuesta.respuesta !== null
                  }).length
                }
              </p>
              <p className="text-xs text-blue-600">
                💾 Conectado a base de datos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gestión de Contratos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <CardTitle>Gestión de Contratos</CardTitle>
            </div>
            <Button 
              onClick={() => setShowNewContractForm(!showNewContractForm)}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Contrato
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulario para nuevo contrato */}
          {showNewContractForm && (
            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
              <h4 className="font-medium">📝 Crear Nuevo Contrato</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="numeroContrato">Número de Contrato *</Label>
                  <Input
                    id="numeroContrato"
                    value={newContract.numeroContrato}
                    onChange={(e) => setNewContract(prev => ({
                      ...prev,
                      numeroContrato: e.target.value
                    }))}
                    placeholder="Ej: 001-2024"
                  />
                </div>
                <div>
                  <Label htmlFor="valorContrato">Valor del Contrato</Label>
                  <Input
                    id="valorContrato"
                    type="number"
                    value={newContract.valorContrato}
                    onChange={(e) => setNewContract(prev => ({
                      ...prev,
                      valorContrato: e.target.value
                    }))}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="contratista">Contratista *</Label>
                  <Input
                    id="contratista"
                    value={newContract.contratista}
                    onChange={(e) => setNewContract(prev => ({
                      ...prev,
                      contratista: e.target.value
                    }))}
                    placeholder="Nombre del contratista"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleCreateContract} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Contrato
                </Button>
                <Button 
                  onClick={() => setShowNewContractForm(false)} 
                  variant="outline" 
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Selector de contrato existente */}
          <div className="space-y-2">
            <Label>Contrato Activo:</Label>
            <Select 
              value={selectedRegistro?.id || ''} 
              onValueChange={(value) => {
                const registro = registros.find(r => r.id === value)
                setSelectedRegistro(registro || null)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar contrato..." />
              </SelectTrigger>
              <SelectContent>
                {registros.map((registro) => (
                  <SelectItem key={registro.id} value={registro.id}>
                    <div className="flex items-center space-x-2">
                      <span>{registro.numero_contrato}</span>
                      <span className="text-sm text-muted-foreground">
                        - {registro.contratista}
                      </span>
                      <Badge variant={
                        registro.estado === 'COMPLETADO' ? 'default' :
                        registro.estado === 'REVISADO' ? 'secondary' : 'outline'
                      }>
                        {registro.porcentaje_completado}%
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Información del contrato seleccionado */}
          {selectedRegistro && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">
                📄 Contrato: {selectedRegistro.numero_contrato}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-green-700">👤 Contratista:</span>
                  <p className="font-medium">{selectedRegistro.contratista}</p>
                </div>
                <div>
                  <span className="text-green-700">💰 Valor:</span>
                  <p className="font-medium">
                    ${selectedRegistro.valor_contrato.toLocaleString()}
                  </p>
                </div>
                <div>
                  <span className="text-green-700">📊 Estado:</span>
                  <Badge variant={
                    selectedRegistro.estado === 'COMPLETADO' ? 'default' :
                    selectedRegistro.estado === 'REVISADO' ? 'secondary' : 'outline'
                  }>
                    {selectedRegistro.estado}
                  </Badge>
                </div>
                <div>
                  <span className="text-green-700">✅ Progreso:</span>
                  <div className="flex items-center space-x-2">
                    <Progress value={selectedRegistro.porcentaje_completado} className="flex-1" />
                    <span className="font-medium">{selectedRegistro.porcentaje_completado}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {registros.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay contratos registrados para este tipo</p>
              <p className="text-sm">Cree un nuevo contrato para comenzar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estado de sincronización */}
      {!error && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            ✅ <strong>Conectado a base de datos:</strong> Los cambios se guardan automáticamente en el sistema de producción.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs por etapa - Solo se muestran si hay un contrato seleccionado */}
      {selectedRegistro ? (
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
                  <CardTitle>🎯 {etapa.nombre}</CardTitle>
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
                  <p className="text-sm text-muted-foreground">📝 {etapa.descripcion}</p>
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
                              {respuesta?.respuesta && (
                                <Badge 
                                  variant={
                                    respuesta.respuesta === RespuestaItem.CUMPLE ? "default" :
                                    respuesta.respuesta === RespuestaItem.NO_CUMPLE ? "destructive" : "secondary"
                                  }
                                  className="text-xs"
                                >
                                  {respuestaLabels[respuesta.respuesta]}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              📄 {item.descripcion}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Respuestas */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">
                              ✅ Cumplimiento
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
                              📝 Observaciones
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
                      📭 No hay items disponibles para esta etapa en el tipo de contrato seleccionado.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">Seleccione un Contrato</h3>
            <p className="text-muted-foreground mb-4">
              Para comenzar con la lista de chequeo, debe seleccionar un contrato existente o crear uno nuevo.
            </p>
            <Button 
              onClick={() => setShowNewContractForm(true)}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Contrato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
