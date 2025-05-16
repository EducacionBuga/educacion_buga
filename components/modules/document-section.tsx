"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { motion } from "framer-motion"
import {
  FileText,
  Upload,
  Download,
  Plus,
  Search,
  Trash2,
  Eye,
  Calendar,
  LinkIcon,
  FileArchive,
  Filter,
  MoreHorizontal,
} from "lucide-react"
import Link from "next/link"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export interface DocumentType {
  id: string
  name: string
  entity?: string
  date: string
  type: string
  size?: string
  status?: "pending" | "approved" | "rejected"
}

export interface DocumentSectionProps {
  title: string
  description?: string
  icon: React.ReactNode
  color?: "blue" | "green" | "orange" | "purple" | "default"
  documents?: {
    preContractual: DocumentType[]
    execution: DocumentType[]
    closure: DocumentType[]
  }
  linkedModule?: {
    title: string
    path: string
  }
  onUpload?: (file: File, type: "preContractual" | "execution" | "closure") => void
  onDelete?: (id: string, type: "preContractual" | "execution" | "closure") => void
  onView?: (id: string, type: "preContractual" | "execution" | "closure") => void
  onDownload?: (id: string, type: "preContractual" | "execution" | "closure") => void
}

export function DocumentSection({
  title,
  description,
  icon,
  color = "default",
  documents = { preContractual: [], execution: [], closure: [] },
  linkedModule,
  onUpload,
  onDelete,
  onView,
  onDownload,
}: DocumentSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [documentType, setDocumentType] = useState<string>("")
  const [documentName, setDocumentName] = useState<string>("")
  const [documentEntity, setDocumentEntity] = useState<string>("")
  const [activeTab, setActiveTab] = useState<string>("preContractual")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile, activeTab as "preContractual" | "execution" | "closure")
      setSelectedFile(null)
      setDocumentName("")
      setDocumentEntity("")
      setDocumentType("")
      setIsDialogOpen(false)
    }
  }

  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "green":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "orange":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20"
      case "purple":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20"
      default:
        return "bg-primary/10 text-primary border-primary/20"
    }
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return null

    switch (status) {
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            Aprobado
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            Rechazado
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            Pendiente
          </Badge>
        )
      default:
        return null
    }
  }

  const filterDocuments = (docs: DocumentType[]) => {
    if (!searchTerm) return docs
    return docs.filter(
      (doc) =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.entity && doc.entity.toLowerCase().includes(searchTerm.toLowerCase())),
    )
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const getDocumentTypeIcon = (type: string) => {
    switch (type) {
      case "PDF":
        return <FileText className="h-4 w-4 text-red-500" />
      case "DOCX":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "XLSX":
        return <FileText className="h-4 w-4 text-green-500" />
      case "JPG":
      case "PNG":
        return <FileText className="h-4 w-4 text-purple-500" />
      default:
        return <FileText className="h-4 w-4 text-gray-500" />
    }
  }

  const tabIcons = {
    preContractual: <FileText className="mr-2 h-4 w-4" />,
    execution: <Calendar className="mr-2 h-4 w-4" />,
    closure: <FileArchive className="mr-2 h-4 w-4" />,
  }

  const tabLabels = {
    preContractual: "Pre Contractuales",
    execution: "Ejecución Contractual",
    closure: "Cierre Contractual",
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full">
      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className={`pb-3 ${getColorClasses()} bg-opacity-10`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 ${getColorClasses()}`}>{icon}</div>
              <div>
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription className="text-foreground/70">{description}</CardDescription>}
              </div>
            </div>
            {linkedModule && (
              <Link href={linkedModule.path} className="flex items-center text-sm text-primary hover:underline">
                <LinkIcon className="mr-1 h-4 w-4" />
                {linkedModule.title}
              </Link>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar documento..."
                  className="pl-8 w-full sm:w-[250px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" title="Filtrar">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Documento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Subir Nuevo Documento</DialogTitle>
                  <DialogDescription>
                    Complete los detalles del documento y suba el archivo correspondiente.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="document-name" className="text-right">
                      Nombre
                    </Label>
                    <Input
                      id="document-name"
                      value={documentName}
                      onChange={(e) => setDocumentName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="document-entity" className="text-right">
                      Entidad
                    </Label>
                    <Input
                      id="document-entity"
                      value={documentEntity}
                      onChange={(e) => setDocumentEntity(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="document-type" className="text-right">
                      Tipo
                    </Label>
                    <select
                      id="document-type"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Seleccione un tipo</option>
                      <option value="PDF">PDF</option>
                      <option value="DOCX">DOCX</option>
                      <option value="XLSX">XLSX</option>
                      <option value="JPG">JPG</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="document-file" className="text-right">
                      Archivo
                    </Label>
                    <Input id="document-file" type="file" onChange={handleFileChange} className="col-span-3" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="document-category" className="text-right">
                      Categoría
                    </Label>
                    <select
                      id="document-category"
                      value={activeTab}
                      onChange={(e) => setActiveTab(e.target.value)}
                      className="col-span-3 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="preContractual">Documentos Pre Contractuales</option>
                      <option value="execution">Documentos Ejecución Contractual</option>
                      <option value="closure">Documentos Cierre Contractual</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleUpload} disabled={!selectedFile}>
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Documento
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="preContractual" onValueChange={setActiveTab} value={activeTab}>
            <TabsList className="mb-4 w-full grid grid-cols-3 h-auto">
              {Object.entries(tabLabels).map(([key, label]) => (
                <TabsTrigger key={key} value={key} className="py-2 flex items-center justify-center">
                  {tabIcons[key as keyof typeof tabIcons]}
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {Object.keys(tabLabels).map((tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="m-0">
                <motion.div variants={container} initial="hidden" animate="show" className="rounded-md border">
                  <ScrollArea className="h-[400px] w-full">
                    <Table>
                      <TableHeader className="sticky top-0 bg-card z-10">
                        <TableRow>
                          <TableHead>Nombre del Documento</TableHead>
                          <TableHead>Entidad</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filterDocuments(
                          tabValue === "preContractual"
                            ? documents.preContractual
                            : tabValue === "execution"
                              ? documents.execution
                              : documents.closure,
                        ).length > 0 ? (
                          filterDocuments(
                            tabValue === "preContractual"
                              ? documents.preContractual
                              : tabValue === "execution"
                                ? documents.execution
                                : documents.closure,
                          ).map((doc) => (
                            <motion.tr key={doc.id} variants={item} className="hover:bg-muted/30">
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getDocumentTypeIcon(doc.type)}
                                  <span className="font-medium">{doc.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>{doc.entity || "-"}</TableCell>
                              <TableCell>{doc.date}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{doc.type}</Badge>
                              </TableCell>
                              <TableCell>{getStatusBadge(doc.status)}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      {onView && (
                                        <DropdownMenuItem onClick={() => onView(doc.id, tabValue as any)}>
                                          <Eye className="mr-2 h-4 w-4" />
                                          <span>Ver documento</span>
                                        </DropdownMenuItem>
                                      )}
                                      {onDownload && (
                                        <DropdownMenuItem onClick={() => onDownload(doc.id, tabValue as any)}>
                                          <Download className="mr-2 h-4 w-4" />
                                          <span>Descargar</span>
                                        </DropdownMenuItem>
                                      )}
                                      {onDelete && (
                                        <DropdownMenuItem
                                          onClick={() => onDelete(doc.id, tabValue as any)}
                                          className="text-red-500 focus:text-red-500"
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          <span>Eliminar</span>
                                        </DropdownMenuItem>
                                      )}
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </TableCell>
                            </motion.tr>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center">
                              <div className="flex flex-col items-center justify-center text-muted-foreground">
                                <FileText className="mb-2 h-10 w-10" />
                                <p className="text-lg font-medium">No hay documentos disponibles</p>
                                <p className="text-sm">Suba documentos para visualizarlos aquí.</p>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </motion.div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/30 px-6 py-3">
          <div className="text-xs text-muted-foreground">
            {documents.preContractual.length + documents.execution.length + documents.closure.length} documentos en
            total
          </div>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-3 w-3" />
            Exportar Lista
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
