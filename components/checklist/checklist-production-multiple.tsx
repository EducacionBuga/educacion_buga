'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Download, Plus, FileText, CheckCircle } from 'lucide-react'
import { useChecklistDataMultiple } from '@/hooks/use-checklist-data-multiple'
import { useExcelExportMultiple } from '@/hooks/use-excel-export-multiple'
import { ContractSelectorMultiple } from './contract-selector-multiple'
import { ChecklistFormMultiple } from './checklist-form-multiple'

// Tipos de apartados que puede tener un contrato
const APARTADOS_CONTRATO = [
  { id: 'SAMC', nombre: 'SAMC', descripcion: 'Selección Abreviada de Menor Cuantía' },
  { id: 'MINIMA CUANTÍA', nombre: 'MINIMA CUANTÍA', descripcion: 'Mínima Cuantía' },
  { id: 'CONTRATO INTERADMINISTRATIVO', nombre: 'INTERADMINISTRATIVO', descripcion: 'Contrato Interadministrativo' },
  { id: 'PRESTACIÓN DE SERVICIOS', nombre: 'PRESTACIÓN DE SERVICIOS', descripcion: 'Prestación de Servicios' }
]

interface ChecklistProductionMultipleProps {
  areaId: string
}

export function ChecklistProductionMultiple({ areaId }: ChecklistProductionMultipleProps) {
  const [selectedApartado, setSelectedApartado] = useState<string>('SAMC')
  
  const {
    registros,
    selectedRegistro,
    setSelectedRegistro,
    itemsPorApartado,
    respuestasPorApartado,
    isLoading,
    error,
    saveRespuestas,
    isSaving,
    updateRespuesta,
    getRespuestaForItem,
    refreshData
  } = useChecklistDataMultiple(areaId)
  
  const { exportToExcel, isExporting } = useExcelExportMultiple()

  const handleExportContract = async () => {
    if (!selectedRegistro) return
    
    console.log('🎯🎯🎯 BOTÓN MÚLTIPLE PRESIONADO - DEBERÍA USAR API MÚLTIPLE 🎯🎯🎯')
    console.log('📋 Contrato:', selectedRegistro.contrato)
    console.log('📊 Apartados disponibles:', Object.keys(respuestasPorApartado))
    
    try {
      await exportToExcel(selectedRegistro, respuestasPorApartado)
    } catch (error) {
      console.error('Error al exportar:', error)
    }
  }

  const handleSaveApartado = async () => {
    if (!selectedRegistro || !selectedApartado) return
    
    try {
      await saveRespuestas(selectedRegistro.id, selectedApartado)
      await refreshData()
    } catch (error) {
      console.error('Error al guardar:', error)
    }
  }

  // Obtener progreso por apartado
  const getProgresoApartado = (apartadoId: string) => {
    const items = itemsPorApartado[apartadoId] || []
    const respuestas = respuestasPorApartado[apartadoId] || new Map()
    
    if (items.length === 0) return { completados: 0, total: 0, porcentaje: 0 }
    
    const completados = items.filter(item => {
      const respuesta = respuestas.get(item.id)
      return respuesta && respuesta.respuesta !== null
    }).length
    
    return {
      completados,
      total: items.length,
      porcentaje: Math.round((completados / items.length) * 100)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando sistema de listas de chequeo...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">
          <FileText className="h-8 w-8 mx-auto mb-2" />
          <p>Error: {error}</p>
        </div>
        <Button onClick={refreshData} variant="outline">
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4 checklist-compact">
      {/* Header */}
      <div className="flex justify-between items-center compact-header">
        <div>
          <h1 className="text-lg font-semibold">Lista de Chequeo Contractual</h1>
          <p className="text-sm text-gray-600">Gestión integral por apartados contractuales</p>
        </div>
        <div className="flex gap-2">
          {selectedRegistro && (
            <>
              <Button
                onClick={handleExportContract}
                disabled={isExporting}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'Exportando...' : 'Exportar Excel'}
              </Button>
              <Button
                onClick={handleSaveApartado}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Selector de Contrato */}
      <ContractSelectorMultiple
        registros={registros}
        selectedRegistro={selectedRegistro}
        onSelectRegistro={setSelectedRegistro}
        areaId={areaId}
        onRefresh={refreshData}
      />

      {selectedRegistro && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Apartados */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apartados del Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {APARTADOS_CONTRATO.map((apartado) => {
                  const progreso = getProgresoApartado(apartado.id)
                  const isSelected = selectedApartado === apartado.id
                  
                  return (
                    <button
                      key={apartado.id}
                      onClick={() => setSelectedApartado(apartado.id)}
                      className={`w-full p-3 rounded-lg border text-left transition-colors ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm">{apartado.nombre}</h3>
                        <Badge variant={progreso.porcentaje === 100 ? 'default' : 'secondary'}>
                          {progreso.porcentaje}%
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{apartado.descripcion}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{progreso.completados}/{progreso.total} items</span>
                        {progreso.porcentaje === 100 && (
                          <CheckCircle className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                    </button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Panel Principal - Lista de Chequeo */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  {selectedApartado}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ChecklistFormMultiple
                  apartadoId={selectedApartado}
                  registroId={selectedRegistro.id}
                  items={itemsPorApartado[selectedApartado] || []}
                  respuestas={respuestasPorApartado[selectedApartado] || new Map()}
                  onUpdateRespuesta={(itemId, respuesta, observaciones) => 
                    updateRespuesta(selectedApartado, itemId, respuesta, observaciones)
                  }
                  getRespuestaForItem={(itemId) => getRespuestaForItem(selectedApartado, itemId)}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
