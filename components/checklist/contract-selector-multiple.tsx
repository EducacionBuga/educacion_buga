'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Trash2, RefreshCw } from 'lucide-react'
import { ChecklistRegistro } from '@/hooks/use-checklist-data-multiple'

interface ContractSelectorMultipleProps {
  registros: ChecklistRegistro[]
  selectedRegistro: ChecklistRegistro | null
  onSelectRegistro: (registro: ChecklistRegistro | null) => void
  areaId: string
  onRefresh: () => Promise<void>
}

export function ContractSelectorMultiple({
  registros,
  selectedRegistro,
  onSelectRegistro,
  areaId,
  onRefresh
}: ContractSelectorMultipleProps) {
  const [showNewForm, setShowNewForm] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newContract, setNewContract] = useState({
    contrato: '',
    contratista: '',
    valor: '',
    objeto: ''
  })

  const handleCreateContract = async () => {
    if (!newContract.contrato || !newContract.contratista) return

    setIsCreating(true)
    try {
      const response = await fetch('/api/lista-chequeo/registros-multiple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dependencia: areaId,
          contrato: newContract.contrato,
          contratista: newContract.contratista,
          valor: parseFloat(newContract.valor) || 0,
          objeto: newContract.objeto
        })
      })

      if (!response.ok) {
        throw new Error('Error al crear contrato')
      }

      const nuevoRegistro = await response.json()
      
      // Limpiar formulario
      setNewContract({
        contrato: '',
        contratista: '',
        valor: '',
        objeto: ''
      })
      setShowNewForm(false)
      
      // Refrescar lista y seleccionar el nuevo contrato
      await onRefresh()
      onSelectRegistro(nuevoRegistro)
      
    } catch (error) {
      console.error('Error al crear contrato:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const formatCurrency = (value: number) => {
    // Formatear con puntos como separadores de miles (formato colombiano)
    const formatted = value.toLocaleString('es-CO', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
    
    return `$${formatted}`;
  }

  return (
    <div className="space-y-4">
      {/* Header con acciones */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Contratos Registrados</h2>
        <div className="flex gap-2">
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => setShowNewForm(!showNewForm)} 
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Formulario para nuevo contrato */}
      {showNewForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Registrar Nuevo Contrato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contrato">Número de Contrato *</Label>
                <Input
                  id="contrato"
                  value={newContract.contrato}
                  onChange={(e) => setNewContract(prev => ({...prev, contrato: e.target.value}))}
                  placeholder="Ej: 001-2024"
                />
              </div>
              <div>
                <Label htmlFor="contratista">Contratista *</Label>
                <Input
                  id="contratista"
                  value={newContract.contratista}
                  onChange={(e) => setNewContract(prev => ({...prev, contratista: e.target.value}))}
                  placeholder="Nombre del contratista"
                />
              </div>
              <div>
                <Label htmlFor="valor">Valor del Contrato</Label>
                <Input
                  id="valor"
                  type="number"
                  value={newContract.valor}
                  onChange={(e) => setNewContract(prev => ({...prev, valor: e.target.value}))}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="objeto">Objeto del Contrato</Label>
                <Textarea
                  id="objeto"
                  value={newContract.objeto}
                  onChange={(e) => setNewContract(prev => ({...prev, objeto: e.target.value}))}
                  placeholder="Descripción del objeto contractual"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowNewForm(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateContract}
                disabled={isCreating || !newContract.contrato || !newContract.contratista}
              >
                {isCreating ? 'Creando...' : 'Crear Contrato'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de contratos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {registros.map((registro) => (
          <Card 
            key={registro.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedRegistro?.id === registro.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:ring-1 hover:ring-gray-300'
            }`}
            onClick={() => onSelectRegistro(registro)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm">{registro.contrato}</h3>
                    <p className="text-xs text-gray-600">{registro.contratista}</p>
                  </div>
                  {selectedRegistro?.id === registro.id && (
                    <Badge variant="default" className="text-xs">
                      Seleccionado
                    </Badge>
                  )}
                </div>
                
                {registro.valor > 0 && (
                  <div className="text-sm">
                    <span className="text-gray-600">Valor: </span>
                    <span className="font-medium">{formatCurrency(registro.valor)}</span>
                  </div>
                )}
                
                {registro.objeto && (
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {registro.objeto}
                  </p>
                )}
                
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <FileText className="h-3 w-3" />
                  <span>4 Apartados Contractuales</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {registros.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay contratos registrados
            </h3>
            <p className="text-gray-600 mb-4">
              Crea tu primer contrato para comenzar con las listas de chequeo
            </p>
            <Button onClick={() => setShowNewForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Contrato
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
