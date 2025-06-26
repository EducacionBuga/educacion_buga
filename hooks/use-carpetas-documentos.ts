import { useState, useEffect, useCallback } from 'react'
import { carpetasDocumentosService } from '@/lib/carpetas-documentos-service'
import type { Carpeta, CarpetaInsert, CarpetaUpdate, Documento, DocumentoInsert, DocumentoUpdate } from '@/lib/carpetas-documentos-service'
import { toast } from '@/components/ui/use-toast'

export function useCarpetasDocumentos(areaId?: string, modulo?: string) {
  const [carpetas, setCarpetas] = useState<Carpeta[]>([])
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Estadísticas
  const [estadisticas, setEstadisticas] = useState({
    totalCarpetas: 0,
    totalDocumentos: 0,
    tamanoTotal: 0,
    tiposArchivo: {} as { [key: string]: number }
  })

  // =====================================================
  // FUNCIONES DE CARGA INICIAL
  // =====================================================

  const cargarCarpetas = useCallback(async () => {
    try {
      setError(null)
      const data = await carpetasDocumentosService.obtenerCarpetas(areaId, modulo)
      setCarpetas(data)
    } catch (err: any) {
      console.error('Error cargando carpetas:', err)
      setError(err.message || 'Error al cargar carpetas')
      toast({
        title: "Error",
        description: "No se pudieron cargar las carpetas",
        variant: "destructive"
      })
    }
  }, [areaId, modulo])

  const cargarDocumentos = useCallback(async (carpetaId?: string) => {
    try {
      setError(null)
      const data = await carpetasDocumentosService.obtenerDocumentos(carpetaId, areaId, modulo)
      setDocumentos(data)
    } catch (err: any) {
      console.error('Error cargando documentos:', err)
      setError(err.message || 'Error al cargar documentos')
      toast({
        title: "Error",
        description: "No se pudieron cargar los documentos",
        variant: "destructive"
      })
    }
  }, [areaId, modulo])

  const cargarEstadisticas = useCallback(async () => {
    try {
      const data = await carpetasDocumentosService.obtenerEstadisticas(areaId, modulo)
      setEstadisticas(data)
    } catch (err: any) {
      console.error('Error cargando estadísticas:', err)
    }
  }, [areaId, modulo])

  // =====================================================
  // OPERACIONES CRUD PARA CARPETAS
  // =====================================================

  const crearCarpeta = async (carpeta: CarpetaInsert): Promise<Carpeta | null> => {
    try {
      setError(null)
      const nuevaCarpeta = await carpetasDocumentosService.crearCarpeta(carpeta)
      
      // Actualizar estado local
      setCarpetas(prev => [nuevaCarpeta, ...prev])
      
      toast({
        title: "Carpeta creada",
        description: `La carpeta "${nuevaCarpeta.nombre}" se creó exitosamente`
      })

      // Actualizar estadísticas
      cargarEstadisticas()
      
      return nuevaCarpeta
    } catch (err: any) {
      console.error('Error creando carpeta:', err)
      setError(err.message || 'Error al crear carpeta')
      toast({
        title: "Error",
        description: "No se pudo crear la carpeta",
        variant: "destructive"
      })
      return null
    }
  }

  const actualizarCarpeta = async (id: string, carpeta: CarpetaUpdate): Promise<Carpeta | null> => {
    try {
      setError(null)
      const carpetaActualizada = await carpetasDocumentosService.actualizarCarpeta(id, carpeta)
      
      // Actualizar estado local
      setCarpetas(prev => prev.map(c => c.id === id ? carpetaActualizada : c))
      
      toast({
        title: "Carpeta actualizada",
        description: `La carpeta "${carpetaActualizada.nombre}" se actualizó exitosamente`
      })
      
      return carpetaActualizada
    } catch (err: any) {
      console.error('Error actualizando carpeta:', err)
      setError(err.message || 'Error al actualizar carpeta')
      toast({
        title: "Error",
        description: "No se pudo actualizar la carpeta",
        variant: "destructive"
      })
      return null
    }
  }

  const eliminarCarpeta = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await carpetasDocumentosService.eliminarCarpeta(id)
      
      // Actualizar estado local
      setCarpetas(prev => prev.filter(c => c.id !== id))
      
      toast({
        title: "Carpeta eliminada",
        description: "La carpeta se eliminó exitosamente"
      })

      // Actualizar estadísticas
      cargarEstadisticas()
      
      return true
    } catch (err: any) {
      console.error('Error eliminando carpeta:', err)
      setError(err.message || 'Error al eliminar carpeta')
      toast({
        title: "Error",
        description: err.message || "No se pudo eliminar la carpeta",
        variant: "destructive"
      })
      return false
    }
  }

  // =====================================================
  // OPERACIONES CRUD PARA DOCUMENTOS
  // =====================================================

  const crearDocumento = async (documento: DocumentoInsert): Promise<Documento | null> => {
    try {
      setError(null)
      const nuevoDocumento = await carpetasDocumentosService.crearDocumento(documento)
      
      // Actualizar estado local
      setDocumentos(prev => [nuevoDocumento, ...prev])
      
      toast({
        title: "Documento creado",
        description: `El documento "${nuevoDocumento.nombre}" se creó exitosamente`
      })

      // Actualizar estadísticas
      cargarEstadisticas()
      
      return nuevoDocumento
    } catch (err: any) {
      console.error('Error creando documento:', err)
      setError(err.message || 'Error al crear documento')
      toast({
        title: "Error",
        description: "No se pudo crear el documento",
        variant: "destructive"
      })
      return null
    }
  }

  const actualizarDocumento = async (id: string, documento: DocumentoUpdate): Promise<Documento | null> => {
    try {
      setError(null)
      const documentoActualizado = await carpetasDocumentosService.actualizarDocumento(id, documento)
      
      // Actualizar estado local
      setDocumentos(prev => prev.map(d => d.id === id ? documentoActualizado : d))
      
      toast({
        title: "Documento actualizado",
        description: `El documento "${documentoActualizado.nombre}" se actualizó exitosamente`
      })
      
      return documentoActualizado
    } catch (err: any) {
      console.error('Error actualizando documento:', err)
      setError(err.message || 'Error al actualizar documento')
      toast({
        title: "Error",
        description: "No se pudo actualizar el documento",
        variant: "destructive"
      })
      return null
    }
  }

  const eliminarDocumento = async (id: string): Promise<boolean> => {
    try {
      setError(null)
      await carpetasDocumentosService.eliminarDocumento(id)
      
      // Actualizar estado local
      setDocumentos(prev => prev.filter(d => d.id !== id))
      
      toast({
        title: "Documento eliminado",
        description: "El documento se eliminó exitosamente"
      })

      // Actualizar estadísticas
      cargarEstadisticas()
      
      return true
    } catch (err: any) {
      console.error('Error eliminando documento:', err)
      setError(err.message || 'Error al eliminar documento')
      toast({
        title: "Error",
        description: "No se pudo eliminar el documento",
        variant: "destructive"
      })
      return false
    }
  }

  // =====================================================
  // FUNCIONES AUXILIARES
  // =====================================================

  const buscarDocumentos = async (termino: string): Promise<Documento[]> => {
    try {
      setError(null)
      const resultados = await carpetasDocumentosService.buscarDocumentos(termino, areaId, modulo)
      return resultados
    } catch (err: any) {
      console.error('Error buscando documentos:', err)
      setError(err.message || 'Error al buscar documentos')
      toast({
        title: "Error",
        description: "Error en la búsqueda de documentos",
        variant: "destructive"
      })
      return []
    }
  }

  const obtenerCarpetasConDocumentos = async () => {
    try {
      setError(null)
      const data = await carpetasDocumentosService.obtenerCarpetasConDocumentos(areaId, modulo)
      return data
    } catch (err: any) {
      console.error('Error obteniendo carpetas con documentos:', err)
      setError(err.message || 'Error al obtener carpetas con documentos')
      return []
    }
  }

  const refrescarDatos = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        cargarCarpetas(),
        cargarDocumentos(),
        cargarEstadisticas()
      ])
    } finally {
      setLoading(false)
    }
  }, [cargarCarpetas, cargarDocumentos, cargarEstadisticas])

  // =====================================================
  // EFECTOS
  // =====================================================

  useEffect(() => {
    refrescarDatos()
  }, [refrescarDatos])

  // =====================================================
  // RETORNO DEL HOOK
  // =====================================================

  return {
    // Estados
    carpetas,
    documentos,
    estadisticas,
    loading,
    error,

    // Operaciones CRUD Carpetas
    crearCarpeta,
    actualizarCarpeta,
    eliminarCarpeta,

    // Operaciones CRUD Documentos
    crearDocumento,
    actualizarDocumento,
    eliminarDocumento,

    // Funciones auxiliares
    cargarCarpetas,
    cargarDocumentos,
    cargarEstadisticas,
    buscarDocumentos,
    obtenerCarpetasConDocumentos,
    refrescarDatos,

    // Utilidades
    formatearTamano: (bytes: number) => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }
  }
}

export default useCarpetasDocumentos
