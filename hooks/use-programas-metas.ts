"use client"

import { useState, useEffect, useCallback } from "react"

interface Meta {
  programa: string
  metas: string[]
}

interface ProgramasMetasData {
  categoria_mayor: string
  subcategoria: string
  items: Meta[]
}

export function useProgramasMetas() {
  const [programasData, setProgramasData] = useState<ProgramasMetasData | null>(null)
  const [programas, setProgramas] = useState<string[]>([])
  const [metasPorPrograma, setMetasPorPrograma] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProgramasMetas = async () => {
      try {
        setLoading(true)
        const response = await fetch('/programas_metas_final.json')
        
        if (!response.ok) {
          throw new Error(`Error al cargar los datos: ${response.status} ${response.statusText}`)
        }
        
        const data: ProgramasMetasData = await response.json()
        setProgramasData(data)
        
        // Extraer lista de programas
        const programasList = data.items.map(item => item.programa)
        setProgramas(programasList)
        
        // Crear mapa de metas por programa
        const metasMap: Record<string, string[]> = {}
        data.items.forEach(item => {
          metasMap[item.programa] = item.metas
        })
        setMetasPorPrograma(metasMap)
        
      } catch (err) {
        console.error('Error cargando programas y metas:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    loadProgramasMetas()
  }, [])

  const getMetasByPrograma = useCallback((programa: string): string[] => {
    return metasPorPrograma[programa] || []
  }, [metasPorPrograma])

  const searchProgramas = useCallback((query: string): string[] => {
    if (!query.trim()) return programas
    
    return programas.filter(programa => 
      programa.toLowerCase().includes(query.toLowerCase())
    )
  }, [programas])

  const searchMetas = useCallback((programa: string, query: string): string[] => {
    const metas = getMetasByPrograma(programa)
    if (!query.trim()) return metas
    
    return metas.filter(meta => 
      meta.toLowerCase().includes(query.toLowerCase())
    )
  }, [getMetasByPrograma])

  return {
    programasData,
    programas,
    metasPorPrograma,
    loading,
    error,
    getMetasByPrograma,
    searchProgramas,
    searchMetas
  }
}