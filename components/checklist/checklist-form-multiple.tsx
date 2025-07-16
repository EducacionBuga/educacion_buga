'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, FileText, AlertCircle } from 'lucide-react'
import { ChecklistItem, ChecklistRespuesta, RespuestaItem, ChecklistEtapa } from '@/hooks/use-checklist-data-multiple'

interface ChecklistFormMultipleProps {
  apartadoId: string
  registroId: string
  items: ChecklistItem[]
  respuestas: Map<string, ChecklistRespuesta>
  onUpdateRespuesta: (itemId: string, respuesta: RespuestaItem | null, observaciones: string) => void
  getRespuestaForItem: (itemId: string) => ChecklistRespuesta | null
}

export function ChecklistFormMultiple({
  apartadoId,
  registroId,
  items,
  respuestas,
  onUpdateRespuesta,
  getRespuestaForItem
}: ChecklistFormMultipleProps) {
  const [observaciones, setObservaciones] = useState<Record<string, string>>({})

  // Agrupar items por etapa
  const itemsPorEtapa = items.reduce((acc, item) => {
    const etapaId = item.etapa_id
    if (!acc[etapaId]) {
      acc[etapaId] = []
    }
    acc[etapaId].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  // Obtener etapas únicas
  const etapas = items.reduce((acc, item) => {
    if (item.etapa && !acc.find(e => e.id === item.etapa!.id)) {
      acc.push(item.etapa)
    }
    return acc
  }, [] as ChecklistEtapa[]).sort((a, b) => a.orden - b.orden)

  const handleRespuestaChange = (itemId: string, respuesta: RespuestaItem | null) => {
    const observacionActual = observaciones[itemId] || getRespuestaForItem(itemId)?.observaciones || ''
    onUpdateRespuesta(itemId, respuesta, observacionActual)
  }

  const handleObservacionChange = (itemId: string, observacion: string) => {
    setObservaciones(prev => ({
      ...prev,
      [itemId]: observacion
    }))
    
    const respuestaActual = getRespuestaForItem(itemId)
    onUpdateRespuesta(itemId, respuestaActual?.respuesta || null, observacion)
  }

  const getObservacionValue = (itemId: string) => {
    return observaciones[itemId] ?? getRespuestaForItem(itemId)?.observaciones ?? ''
  }

  // Obtener progreso por etapa
  const getProgresoEtapa = (etapaId: string) => {
    const itemsEtapa = itemsPorEtapa[etapaId] || []
    if (itemsEtapa.length === 0) return { completados: 0, total: 0, porcentaje: 0 }
    
    const completados = itemsEtapa.filter(item => {
      const respuesta = getRespuestaForItem(item.id)
      return respuesta && respuesta.respuesta !== null
    }).length
    
    return {
      completados,
      total: itemsEtapa.length,
      porcentaje: Math.round((completados / itemsEtapa.length) * 100)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay items para este apartado
        </h3>
        <p className="text-gray-600">
          Los items para {apartadoId} se cargarán automáticamente
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header del apartado */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{apartadoId}</h3>
          <p className="text-gray-600">{items.length} items total</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {etapas.length} etapas
        </Badge>
      </div>

      {/* Tabs por etapas */}
      <Tabs defaultValue={etapas[0]?.id} className="w-full">
        <TabsList className="grid grid-cols-5 w-full">
          {etapas.map((etapa) => {
            const progreso = getProgresoEtapa(etapa.id)
            return (
              <TabsTrigger 
                key={etapa.id} 
                value={etapa.id}
                className="flex flex-col gap-1 h-auto py-2"
              >
                <span className="text-xs font-medium">{etapa.nombre}</span>
                <div className="flex items-center gap-1">
                  <span className="text-xs text-gray-500">
                    {progreso.completados}/{progreso.total}
                  </span>
                  {progreso.porcentaje === 100 && (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  )}
                </div>
              </TabsTrigger>
            )
          })}
        </TabsList>

        {etapas.map((etapa) => (
          <TabsContent key={etapa.id} value={etapa.id} className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900">{etapa.nombre}</h4>
              <p className="text-sm text-blue-700">{etapa.descripcion}</p>
            </div>
            
            <div className="space-y-4">
              {(itemsPorEtapa[etapa.id] || []).map((item) => {
                const respuesta = getRespuestaForItem(item.id)
                const observacionValue = getObservacionValue(item.id)
                
                return (
                  <Card key={item.id} className="transition-shadow hover:shadow-sm">
                    <CardContent className="p-4">
                      <div className="space-y-4">
                        {/* Header del item */}
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                #{item.numero_item}
                              </Badge>
                              {respuesta?.respuesta && (
                                <Badge 
                                  variant={respuesta.respuesta === 'SI' ? 'default' : 
                                          respuesta.respuesta === 'NO' ? 'destructive' : 'secondary'}
                                  className="text-xs"
                                >
                                  {respuesta.respuesta === 'SI' ? 'Cumple' :
                                   respuesta.respuesta === 'NO' ? 'No Cumple' : 'No Aplica'}
                                </Badge>
                              )}
                            </div>
                            <h5 className="font-medium text-sm mb-1">{item.titulo}</h5>
                            {item.descripcion && (
                              <p className="text-xs text-gray-600">{item.descripcion}</p>
                            )}
                          </div>
                        </div>

                        {/* Opciones de respuesta */}
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Cumplimiento</Label>
                          <RadioGroup
                            value={respuesta?.respuesta || ''}
                            onValueChange={(value) => handleRespuestaChange(item.id, value as RespuestaItem)}
                            className="flex gap-6"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="SI" id={`${item.id}-si`} />
                              <Label htmlFor={`${item.id}-si`} className="text-sm text-green-700">
                                Cumple
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NO" id={`${item.id}-no`} />
                              <Label htmlFor={`${item.id}-no`} className="text-sm text-red-700">
                                No Cumple
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="NO_APLICA" id={`${item.id}-na`} />
                              <Label htmlFor={`${item.id}-na`} className="text-sm text-gray-600">
                                No Aplica
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {/* Observaciones */}
                        <div>
                          <Label htmlFor={`obs-${item.id}`} className="text-sm font-medium mb-2 block">
                            Observaciones
                          </Label>
                          <Textarea
                            id={`obs-${item.id}`}
                            value={observacionValue}
                            onChange={(e) => handleObservacionChange(item.id, e.target.value)}
                            placeholder="Registre observaciones relevantes..."
                            rows={2}
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
