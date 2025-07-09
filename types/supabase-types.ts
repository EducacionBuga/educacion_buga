export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      areas: {
        Row: {
          id: string
          codigo: string
          nombre: string
          descripcion: string | null
          color: string
          icono_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nombre: string
          descripcion?: string | null
          color: string
          icono_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nombre?: string
          descripcion?: string | null
          color?: string
          icono_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      usuarios: {
        Row: {
          id: string
          nombre: string
          area_id: string | null
          rol: string
          cargo: string | null
          avatar_url: string | null
          ultimo_acceso: string | null
          estado: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nombre: string
          area_id?: string | null
          rol: string
          cargo?: string | null
          avatar_url?: string | null
          ultimo_acceso?: string | null
          estado?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          area_id?: string | null
          rol?: string
          cargo?: string | null
          avatar_url?: string | null
          ultimo_acceso?: string | null
          estado?: string
          created_at?: string
          updated_at?: string
        }
      }
      carpetas: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          color: string
          categoria: string
          area_id: string
          modulo: string
          fecha: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string
          color?: string
          categoria: string
          area_id: string
          modulo: string
          fecha: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          color?: string
          categoria?: string
          area_id?: string
          modulo?: string
          fecha?: string
          created_at?: string
          updated_at?: string
        }
      }
      documentos: {
        Row: {
          id: string
          nombre: string
          descripcion: string
          tipo_archivo: string
          tamano: number
          ruta_archivo: string
          url_archivo: string
          carpeta_id: string
          area_id: string
          modulo: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string
          tipo_archivo: string
          tamano: number
          ruta_archivo: string
          url_archivo: string
          carpeta_id: string
          area_id: string
          modulo: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string
          tipo_archivo?: string
          tamano?: number
          ruta_archivo?: string
          url_archivo?: string
          carpeta_id?: string
          area_id?: string
          modulo?: string
          created_at?: string
          updated_at?: string
        }
      }
      lista_chequeo_categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          hoja_excel: string
          orden: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          hoja_excel: string
          orden: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          hoja_excel?: string
          orden?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lista_chequeo_etapas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          orden: number
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          orden: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          orden?: number
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lista_chequeo_items_maestros: {
        Row: {
          id: string
          numero_item: number
          titulo: string
          descripcion: string
          etapa_id: string
          activo: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          numero_item: number
          titulo: string
          descripcion: string
          etapa_id: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          numero_item?: number
          titulo?: string
          descripcion?: string
          etapa_id?: string
          activo?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      lista_chequeo_item_categorias: {
        Row: {
          id: string
          item_id: string
          categoria_id: string
          fila_excel: number
          created_at: string
        }
        Insert: {
          id?: string
          item_id: string
          categoria_id: string
          fila_excel: number
          created_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          categoria_id?: string
          fila_excel?: number
          created_at?: string
        }
      }
      lista_chequeo_respuestas: {
        Row: {
          id: string
          area_id: string
          categoria_id: string
          item_id: string
          respuesta: string | null
          observaciones: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          area_id: string
          categoria_id: string
          item_id: string
          respuesta?: string | null
          observaciones?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          area_id?: string
          categoria_id?: string
          item_id?: string
          respuesta?: string | null
          observaciones?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plan_accion: {
        Row: {
          id: string
          area_id: string
          numero: string | null
          programa: string
          objetivo: string | null
          meta: string
          presupuesto: string | null
          acciones: string | null
          indicadores: string | null
          porcentaje_avance: number
          fecha_inicio: string | null
          fecha_fin: string | null
          responsable: string
          estado: string
          prioridad: string | null
          user_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          area_id: string
          numero?: string | null
          programa: string
          objetivo?: string | null
          meta: string
          presupuesto?: string | null
          acciones?: string | null
          indicadores?: string | null
          porcentaje_avance?: number
          fecha_inicio?: string | null
          fecha_fin?: string | null
          responsable: string
          estado?: string
          prioridad?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          area_id?: string
          numero?: string | null
          programa?: string
          objetivo?: string | null
          meta?: string
          presupuesto?: string | null
          acciones?: string | null
          indicadores?: string | null
          porcentaje_avance?: number
          fecha_inicio?: string | null
          fecha_fin?: string | null
          responsable?: string
          estado?: string
          prioridad?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      plan_validaciones: {
        Row: {
          id: string
          plan_id: string
          estado_validacion: "pendiente" | "aprobado" | "rechazado" | "en_revision"
          comentarios: string | null
          validado_por: string | null
          fecha_validacion: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          plan_id: string
          estado_validacion?: "pendiente" | "aprobado" | "rechazado" | "en_revision"
          comentarios?: string | null
          validado_por?: string | null
          fecha_validacion?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          plan_id?: string
          estado_validacion?: "pendiente" | "aprobado" | "rechazado" | "en_revision"
          comentarios?: string | null
          validado_por?: string | null
          fecha_validacion?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Definiciones para el resto de tablas...
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
