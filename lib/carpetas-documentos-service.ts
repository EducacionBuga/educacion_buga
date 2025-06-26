import { createClient } from '@/lib/supabase-client'
import type { Database } from '@/types/supabase-types'

type Carpeta = Database['public']['Tables']['carpetas']['Row']
type CarpetaInsert = Database['public']['Tables']['carpetas']['Insert']
type CarpetaUpdate = Database['public']['Tables']['carpetas']['Update']

type Documento = Database['public']['Tables']['documentos']['Row']
type DocumentoInsert = Database['public']['Tables']['documentos']['Insert']
type DocumentoUpdate = Database['public']['Tables']['documentos']['Update']

class CarpetasDocumentosService {
  private supabase = createClient()

  // =====================================================
  // MÉTODOS PARA CARPETAS
  // =====================================================

  async obtenerCarpetas(areaId?: string, modulo?: string): Promise<Carpeta[]> {
    try {
      let query = this.supabase
        .from('carpetas')
        .select('*')
        .order('created_at', { ascending: false })

      if (areaId) {
        query = query.eq('area_id', areaId)
      }

      if (modulo) {
        query = query.eq('modulo', modulo)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error obteniendo carpetas:', error)
        throw new Error(`Error al obtener carpetas: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error en obtenerCarpetas:', error)
      throw error
    }
  }

  async obtenerCarpetaPorId(id: string): Promise<Carpeta | null> {
    try {
      const { data, error } = await this.supabase
        .from('carpetas')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error obteniendo carpeta por ID:', error)
        throw new Error(`Error al obtener carpeta: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en obtenerCarpetaPorId:', error)
      throw error
    }
  }

  async crearCarpeta(carpeta: CarpetaInsert): Promise<Carpeta> {
    try {
      const { data, error } = await this.supabase
        .from('carpetas')
        .insert(carpeta)
        .select()
        .single()

      if (error) {
        console.error('Error creando carpeta:', error)
        throw new Error(`Error al crear carpeta: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en crearCarpeta:', error)
      throw error
    }
  }

  async actualizarCarpeta(id: string, carpeta: CarpetaUpdate): Promise<Carpeta> {
    try {
      const { data, error } = await this.supabase
        .from('carpetas')
        .update(carpeta)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando carpeta:', error)
        throw new Error(`Error al actualizar carpeta: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en actualizarCarpeta:', error)
      throw error
    }
  }

  async eliminarCarpeta(id: string): Promise<void> {
    try {
      // Primero verificar si hay documentos en la carpeta
      const { data: documentos } = await this.supabase
        .from('documentos')
        .select('id')
        .eq('carpeta_id', id)

      if (documentos && documentos.length > 0) {
        throw new Error('No se puede eliminar la carpeta porque contiene documentos')
      }

      const { error } = await this.supabase
        .from('carpetas')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error eliminando carpeta:', error)
        throw new Error(`Error al eliminar carpeta: ${error.message}`)
      }
    } catch (error) {
      console.error('Error en eliminarCarpeta:', error)
      throw error
    }
  }

  // =====================================================
  // MÉTODOS PARA DOCUMENTOS
  // =====================================================

  async obtenerDocumentos(carpetaId?: string, areaId?: string, modulo?: string): Promise<Documento[]> {
    try {
      let query = this.supabase
        .from('documentos')
        .select('*')
        .order('created_at', { ascending: false })

      if (carpetaId) {
        query = query.eq('carpeta_id', carpetaId)
      }

      if (areaId) {
        query = query.eq('area_id', areaId)
      }

      if (modulo) {
        query = query.eq('modulo', modulo)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error obteniendo documentos:', error)
        throw new Error(`Error al obtener documentos: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error en obtenerDocumentos:', error)
      throw error
    }
  }

  async obtenerDocumentoPorId(id: string): Promise<Documento | null> {
    try {
      const { data, error } = await this.supabase
        .from('documentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Error obteniendo documento por ID:', error)
        throw new Error(`Error al obtener documento: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en obtenerDocumentoPorId:', error)
      throw error
    }
  }

  async crearDocumento(documento: DocumentoInsert): Promise<Documento> {
    try {
      const { data, error } = await this.supabase
        .from('documentos')
        .insert(documento)
        .select()
        .single()

      if (error) {
        console.error('Error creando documento:', error)
        throw new Error(`Error al crear documento: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en crearDocumento:', error)
      throw error
    }
  }

  async actualizarDocumento(id: string, documento: DocumentoUpdate): Promise<Documento> {
    try {
      const { data, error } = await this.supabase
        .from('documentos')
        .update(documento)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Error actualizando documento:', error)
        throw new Error(`Error al actualizar documento: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error en actualizarDocumento:', error)
      throw error
    }
  }

  async eliminarDocumento(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('documentos')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error eliminando documento:', error)
        throw new Error(`Error al eliminar documento: ${error.message}`)
      }
    } catch (error) {
      console.error('Error en eliminarDocumento:', error)
      throw error
    }
  }

  // =====================================================
  // MÉTODOS COMBINADOS
  // =====================================================

  async obtenerCarpetasConDocumentos(areaId?: string, modulo?: string): Promise<(Carpeta & { documentos: Documento[] })[]> {
    try {
      const carpetas = await this.obtenerCarpetas(areaId, modulo)
      
      const carpetasConDocumentos = await Promise.all(
        carpetas.map(async (carpeta) => {
          const documentos = await this.obtenerDocumentos(carpeta.id)
          return {
            ...carpeta,
            documentos
          }
        })
      )

      return carpetasConDocumentos
    } catch (error) {
      console.error('Error en obtenerCarpetasConDocumentos:', error)
      throw error
    }
  }

  async buscarDocumentos(termino: string, areaId?: string, modulo?: string): Promise<Documento[]> {
    try {
      let query = this.supabase
        .from('documentos')
        .select('*')
        .or(`nombre.ilike.%${termino}%,descripcion.ilike.%${termino}%`)
        .order('created_at', { ascending: false })

      if (areaId) {
        query = query.eq('area_id', areaId)
      }

      if (modulo) {
        query = query.eq('modulo', modulo)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error buscando documentos:', error)
        throw new Error(`Error al buscar documentos: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error en buscarDocumentos:', error)
      throw error
    }
  }

  // =====================================================
  // MÉTODOS DE ESTADÍSTICAS
  // =====================================================

  async obtenerEstadisticas(areaId?: string, modulo?: string): Promise<{
    totalCarpetas: number
    totalDocumentos: number
    tamanoTotal: number
    tiposArchivo: { [key: string]: number }
  }> {
    try {
      // Contar carpetas
      let carpetasQuery = this.supabase
        .from('carpetas')
        .select('id', { count: 'exact', head: true })

      if (areaId) carpetasQuery = carpetasQuery.eq('area_id', areaId)
      if (modulo) carpetasQuery = carpetasQuery.eq('modulo', modulo)

      const { count: totalCarpetas } = await carpetasQuery

      // Obtener estadísticas de documentos
      let documentosQuery = this.supabase
        .from('documentos')
        .select('tamano, tipo_archivo')

      if (areaId) documentosQuery = documentosQuery.eq('area_id', areaId)
      if (modulo) documentosQuery = documentosQuery.eq('modulo', modulo)

      const { data: documentos } = await documentosQuery

      const totalDocumentos = documentos?.length || 0
      const tamanoTotal = documentos?.reduce((sum, doc) => sum + (doc.tamano || 0), 0) || 0
      
      const tiposArchivo: { [key: string]: number } = {}
      documentos?.forEach(doc => {
        tiposArchivo[doc.tipo_archivo] = (tiposArchivo[doc.tipo_archivo] || 0) + 1
      })

      return {
        totalCarpetas: totalCarpetas || 0,
        totalDocumentos,
        tamanoTotal,
        tiposArchivo
      }
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error)
      throw error
    }
  }
}

// Exportar instancia del servicio
export const carpetasDocumentosService = new CarpetasDocumentosService()
export default carpetasDocumentosService

// Exportar tipos para uso en componentes
export type { Carpeta, CarpetaInsert, CarpetaUpdate, Documento, DocumentoInsert, DocumentoUpdate }
