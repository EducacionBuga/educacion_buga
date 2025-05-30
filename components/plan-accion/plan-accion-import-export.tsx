"use client"

import React, { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Upload, Download, FileSpreadsheet, FileText, AlertCircle, CheckCircle, FileDown } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { usePlanAccionImportExport, type ImportResult } from "@/hooks/use-plan-accion-import-export"
import type { PlanAccionItem } from "@/types/plan-accion"

interface PlanAccionImportExportProps {
  data: PlanAccionItem[]
  onImport: (data: PlanAccionItem[]) => void
  disabled?: boolean
}

export function PlanAccionImportExport({ data, onImport, disabled = false }: PlanAccionImportExportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const {
    isImporting,
    isExporting,
    importFromCSV,
    importFromExcel,
    exportToCSV,
    exportToExcel,
    downloadTemplate,
  } = usePlanAccionImportExport()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    const fileExtension = selectedFile.name.toLowerCase().split('.').pop()
    let result: ImportResult

    if (fileExtension === 'csv') {
      result = await importFromCSV(selectedFile)
    } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      result = await importFromExcel(selectedFile)
    } else {
      result = {
        success: false,
        errors: ['Formato de archivo no soportado. Use archivos CSV o Excel (.xlsx)']
      }
    }

    setImportResult(result)

    if (result.success && result.data) {
      onImport(result.data)
      setIsDialogOpen(false)
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExportCSV = () => {
    exportToCSV(data, `plan-accion-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const handleExportExcel = () => {
    exportToExcel(data, `plan-accion-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const handleDownloadTemplate = () => {
    downloadTemplate()
  }

  const resetImport = () => {
    setSelectedFile(null)
    setImportResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Resumen de datos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Registros Actuales</p>
                <p className="text-2xl font-bold text-blue-900">{data.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Listos para Exportar</p>
                <p className="text-2xl font-bold text-green-900">{data.length > 0 ? "Sí" : "No"}</p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Última Actualización</p>
                <p className="text-sm font-bold text-purple-900">
                  {new Date().toLocaleDateString('es-ES')}
                </p>
              </div>
              <Upload className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Botones de acción principal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Botón Importar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="default" 
              disabled={disabled}
              className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-lg transition-all duration-200"
            >
              <Upload className="h-6 w-6" />
              <span className="font-medium">Importar Plan</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Importar Plan de Acción</DialogTitle>
              <DialogDescription>
                Suba un archivo CSV o Excel para actualizar el plan de acción. El archivo debe seguir el formato estándar.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Selector de archivo */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">Seleccionar archivo</Label>
                <Input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={isImporting}
                />
                <p className="text-sm text-muted-foreground">
                  Formatos soportados: CSV, Excel (.xlsx, .xls)
                </p>
              </div>

              {/* Archivo seleccionado */}
              {selectedFile && (
                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center space-x-2">
                      {selectedFile.name.endsWith('.csv') ? (
                        <FileText className="h-5 w-5 text-green-600" />
                      ) : (
                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                      )}
                      <div>
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Progreso de importación */}
              {isImporting && (
                <div className="space-y-2">
                  <Label>Procesando archivo...</Label>
                  <Progress value={undefined} className="w-full" />
                </div>
              )}

              {/* Resultado de importación */}
              {importResult && (
                <Alert variant={importResult.success ? "default" : "destructive"}>
                  {importResult.success ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>
                    {importResult.success ? (
                      `Se importaron ${importResult.data?.length || 0} registros correctamente.`
                    ) : (
                      <div>
                        <p className="font-medium mb-2">Se encontraron errores:</p>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {importResult.errors?.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {importResult.errors && importResult.errors.length > 5 && (
                            <li>... y {importResult.errors.length - 5} errores más</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Botones de acción */}
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={resetImport}
                  disabled={isImporting}
                >
                  Limpiar
                </Button>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isImporting}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleImport}
                    disabled={!selectedFile || isImporting}
                  >
                    {isImporting ? "Importando..." : "Importar"}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Botón Descargar Plantilla */}
        <Button
          variant="outline"
          onClick={handleDownloadTemplate}
          disabled={disabled}
          className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-lg transition-all duration-200 border-2 border-dashed border-primary/30 hover:border-primary/60"
        >
          <FileDown className="h-6 w-6" />
          <span className="font-medium">Descargar Plantilla</span>
        </Button>

        {/* Botón Exportar CSV */}
        <Button
          variant="outline"
          onClick={handleExportCSV}
          disabled={disabled || isExporting || data.length === 0}
          className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-lg transition-all duration-200 bg-green-50 hover:bg-green-100 border-green-200 hover:border-green-300"
        >
          <Download className="h-6 w-6 text-green-600" />
          <span className="font-medium text-green-700">
            {isExporting ? "Exportando..." : "Exportar CSV"}
          </span>
        </Button>

        {/* Botón Exportar Excel */}
        <Button
          variant="outline"
          onClick={handleExportExcel}
          disabled={disabled || isExporting || data.length === 0}
          className="h-16 flex flex-col items-center justify-center space-y-2 hover:shadow-lg transition-all duration-200 bg-blue-50 hover:bg-blue-100 border-blue-200 hover:border-blue-300"
        >
          <Download className="h-6 w-6 text-blue-600" />
          <span className="font-medium text-blue-700">
            {isExporting ? "Exportando..." : "Exportar Excel"}
          </span>
        </Button>
      </div>

      {/* Información sobre el formato de archivo */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <FileText className="mr-2 h-5 w-5 text-primary" />
            Formato de archivo requerido
          </CardTitle>
          <CardDescription>
            Para importar correctamente, el archivo debe contener estas columnas en español:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-semibold text-red-700 flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                Columnas obligatorias:
              </h4>
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <ul className="space-y-2 text-red-800">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Meta de Producto PDM 2024-2027
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Actividad a Realizar
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Responsable
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Estado
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-700 flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Columnas opcionales:
              </h4>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Proceso / Estrategia
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Presupuesto Disponible
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Porcentaje de Avance
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Fecha de Inicio / Finalización
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <Alert className="mt-6 bg-amber-50 border-amber-200">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Importante:</strong> Las fechas deben estar en formato DD/MM/YYYY y los porcentajes como números del 0 al 100. 
              Descargue la plantilla para ver el formato exacto requerido.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
