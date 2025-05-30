"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, FolderOpen, Search, Filter, RefreshCw, HardDrive } from "lucide-react"
import { formatFileSize } from "@/lib/utils"

interface DocumentoReporte {
  id: string
  name: string
  area: string
  moduleType: string
  folderName: string
  fileType: string
  fileSize: number
  createdAt: string
  updatedAt?: string
}

interface FolderReporte {
  id: string
  name: string
  area: string
  moduleType: string
  color: string
  category: string
  createdAt: string
  documentCount: number
}

interface DocumentosReportProps {
  documentosData?: DocumentoReporte[]
  foldersData?: FolderReporte[]
  isLoading?: boolean
  onRefresh?: () => void
  stats?: {
    totalDocuments: number
    totalFolders: number
    totalSize: number
    documentsByArea: Array<{ area: string; count: number }>
    documentsByType: Array<{ type: string; count: number }>
  }
}

export function DocumentosReport({
  documentosData = [],
  foldersData = [],
  isLoading = false,
  onRefresh = () => {},
  stats = {
    totalDocuments: 0,
    totalFolders: 0,
    totalSize: 0,
    documentsByArea: [],
    documentsByType: [],
  },
}: DocumentosReportProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [areaFilter, setAreaFilter] = useState("todas")
  const [typeFilter, setTypeFilter] = useState("todos")

  const filteredDocuments =
    documentosData?.filter((doc) => {
      const matchesSearch =
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.folderName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesArea = areaFilter === "todas" || doc.area === areaFilter
      const matchesType = typeFilter === "todos" || doc.fileType.includes(typeFilter)

      return matchesSearch && matchesArea && matchesType
    }) || []

  const filteredFolders =
    foldersData?.filter((folder) => {
      const matchesSearch = folder.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesArea = areaFilter === "todas" || folder.area === areaFilter

      return matchesSearch && matchesArea
    }) || []

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Carpetas</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFolders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espacio Usado</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.totalSize)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acciones</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button onClick={onRefresh} size="sm" className="w-full">
              Actualizar
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar documentos o carpetas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={areaFilter} onValueChange={setAreaFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas las áreas</SelectItem>
                <SelectItem value="Calidad Educativa">Calidad Educativa</SelectItem>
                <SelectItem value="Inspección y Vigilancia">Inspección y Vigilancia</SelectItem>
                <SelectItem value="Cobertura e Infraestructura">Cobertura e Infraestructura</SelectItem>
                <SelectItem value="Talento Humano">Talento Humano</SelectItem>
                <SelectItem value="Despacho">Despacho</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="word">Word</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="image">Imagen</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs para documentos y carpetas */}
      <Tabs defaultValue="documentos" className="w-full">
        <TabsList>
          <TabsTrigger value="documentos">Documentos ({filteredDocuments.length})</TabsTrigger>
          <TabsTrigger value="carpetas">Carpetas ({filteredFolders.length})</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="documentos" className="space-y-4">
          <div className="grid gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{doc.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{doc.area}</span>
                          <span>•</span>
                          <span>{doc.moduleType}</span>
                          <span>•</span>
                          <span>{doc.folderName}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{doc.fileType}</Badge>
                      <Badge variant="secondary">{formatFileSize(doc.fileSize)}</Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="carpetas" className="space-y-4">
          <div className="grid gap-4">
            {filteredFolders.map((folder) => (
              <Card key={folder.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-yellow-500" />
                      <div>
                        <h4 className="font-medium">{folder.name}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <span>{folder.area}</span>
                          <span>•</span>
                          <span>{folder.moduleType}</span>
                          <span>•</span>
                          <span>{folder.documentCount} documentos</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge
                        variant="outline"
                        style={{ backgroundColor: `${folder.color}20`, borderColor: folder.color }}
                      >
                        {folder.category}
                      </Badge>
                      <div className="text-xs text-muted-foreground">
                        {new Date(folder.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="estadisticas" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos por Área</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.documentsByArea.map((item) => (
                    <div key={item.area} className="flex justify-between items-center">
                      <span className="text-sm">{item.area}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Documentos por Tipo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.documentsByType.map((item) => (
                    <div key={item.type} className="flex justify-between items-center">
                      <span className="text-sm">{item.type}</span>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
