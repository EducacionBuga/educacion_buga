"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { areaCodeToId } from "@/constants/checklist"

export function ListaChequeoDebug() {
  const pathname = usePathname()
  const areaMatch = pathname?.match(/\/dashboard\/([^/]+)\/lista-chequeo/)
  const areaCode = areaMatch ? areaMatch[1] : "area-desconocida"
  
  const [debugInfo, setDebugInfo] = useState<any>({})
  const [loading, setLoading] = useState(false)
  
  const supabase = createClientComponentClient()

  const runDebugCheck = async () => {
    setLoading(true)
    const info: any = {}
    
    try {
      // 1. Verificar área
      info.areaCode = areaCode
      info.areaId = areaCodeToId[areaCode]
      
      // 2. Verificar categorías
      const { data: categorias, error: categoriasError } = await supabase
        .from('lista_chequeo_categorias')
        .select('*')
        .order('orden')
      
      info.categorias = categorias
      info.categoriasError = categoriasError
      
      // 3. Verificar etapas
      const { data: etapas, error: etapasError } = await supabase
        .from('lista_chequeo_etapas')
        .select('*')
        .order('orden')
      
      info.etapas = etapas
      info.etapasError = etapasError
      
      // 4. Verificar items para SAMC
      if (categorias && categorias.length > 0) {
        const samcCategoria = categorias.find(c => c.nombre === 'SAMC')
        if (samcCategoria) {
          const { data: items, error: itemsError } = await supabase
            .from('lista_chequeo_item_categorias')
            .select(`
              *,
              lista_chequeo_items_maestros (
                *,
                lista_chequeo_etapas (*)
              )
            `)
            .eq('categoria_id', samcCategoria.id)
            .limit(5)
          
          info.itemsSAMC = items
          info.itemsError = itemsError
        }
      }
      
      // 5. Verificar si hay respuestas existentes
      if (info.areaId && categorias && categorias.length > 0) {
        const samcCategoria = categorias.find(c => c.nombre === 'SAMC')
        if (samcCategoria) {
          const { data: respuestas, error: respuestasError } = await supabase
            .from('lista_chequeo_respuestas')
            .select('*')
            .eq('area_id', info.areaId)
            .eq('categoria_id', samcCategoria.id)
            .limit(5)
          
          info.respuestas = respuestas
          info.respuestasError = respuestasError
        }
      }
      
    } catch (error) {
      info.generalError = error
    }
    
    setDebugInfo(info)
    setLoading(false)
  }
  
  useEffect(() => {
    runDebugCheck()
  }, [areaCode])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Debug Lista de Chequeo</CardTitle>
          <Button onClick={runDebugCheck} disabled={loading}>
            {loading ? "Verificando..." : "Verificar Datos"}
          </Button>
        </CardHeader>
        <CardContent>
          <pre className="text-xs overflow-auto max-h-96 bg-gray-100 p-4 rounded">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
