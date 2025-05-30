"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useParams } from "next/navigation"
import { ModuleHeader } from "@/components/dashboard/module-header"
import { PlanAccionArea } from "@/components/modules/plan-accion-area"
import { PlanAccionAreaCharts } from "@/components/modules/plan-accion-area-charts"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import type { PlanAccionItem } from "@/types/plan-accion"

// Mapeo de slugs a nombres de área
const AREA_SLUGS_TO_NAMES: Record<string, string> = {
  "calidad-educativa": "Calidad Educativa",
  "inspeccion-vigilancia": "Inspección y Vigilancia",
  "cobertura-infraestructura": "Cobertura e Infraestructura",
  "talento-humano": "Talento Humano",
  planeacion: "Planeación",
  despacho: "Despacho",
}

export default function PlanAccionPage() {
  const params = useParams()
  const areaIdOrSlug = params.areaId as string
  const [areaId, setAreaId] = useState<string | null>(null)
  const [areaName, setAreaName] = useState<string>("")
  const [areaColor, setAreaColor] = useState<"blue" | "green" | "orange" | "purple" | "default">("default")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [planAccionItems, setPlanAccionItems] = useState<PlanAccionItem[]>([])
  const supabase = createClientComponentClient()

  // Cargar información del área
  useEffect(() => {
    async function loadAreaInfo() {
      try {
        setLoading(true)
        setError(null)

        // Verificar si es un UUID válido
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(areaIdOrSlug)

        let areaData

        if (isUuid) {
          // Si es un UUID, buscar directamente por ID
          const { data, error } = await supabase.from("areas").select("*").eq("id", areaIdOrSlug).single()

          if (error) {
            console.error("Error cargando información del área por ID:", error)
            throw new Error(`Error: ${error.message}`)
          }

          areaData = data
          setAreaId(areaIdOrSlug)
        } else {
          // Si es un slug, buscar por nombre o código
          const areaNameFromSlug = AREA_SLUGS_TO_NAMES[areaIdOrSlug] || areaIdOrSlug

          // Primero intentamos buscar por nombre
          const { data: dataByName, error: errorByName } = await supabase
            .from("areas")
            .select("*")
            .ilike("nombre", `%${areaNameFromSlug}%`)
            .limit(1)

          if (errorByName) {
            console.error("Error buscando área por nombre:", errorByName)
            throw new Error(`Error: ${errorByName.message}`)
          }

          if (dataByName && dataByName.length > 0) {
            areaData = dataByName[0]
            setAreaId(areaData.id)
          } else {
            // Si no encontramos por nombre, intentamos por código
            const { data: dataByCode, error: errorByCode } = await supabase
              .from("areas")
              .select("*")
              .ilike("codigo", `%${areaIdOrSlug}%`)
              .limit(1)

            if (errorByCode) {
              console.error("Error buscando área por código:", errorByCode)
              throw new Error(`Error: ${errorByCode.message}`)
            }

            if (dataByCode && dataByCode.length > 0) {
              areaData = dataByCode[0]
              setAreaId(areaData.id)
            } else {
              throw new Error(`No se encontró el área: ${areaIdOrSlug}`)
            }
          }
        }

        if (areaData) {
          setAreaName(areaData.nombre || "Área")

          // Asignar color según el código o nombre del área
          const codigo = areaData.codigo?.toLowerCase() || ""
          const nombre = areaData.nombre?.toLowerCase() || ""

          if (codigo.includes("calidad") || nombre.includes("calidad")) {
            setAreaColor("orange")
          } else if (
            codigo.includes("inspeccion") ||
            codigo.includes("vigilancia") ||
            nombre.includes("inspeccion") ||
            nombre.includes("vigilancia")
          ) {
            setAreaColor("blue")
          } else if (
            codigo.includes("cobertura") ||
            codigo.includes("infraestructura") ||
            nombre.includes("cobertura") ||
            nombre.includes("infraestructura")
          ) {
            setAreaColor("green")
          } else if (
            codigo.includes("talento") ||
            codigo.includes("humano") ||
            nombre.includes("talento") ||
            nombre.includes("humano")
          ) {
            setAreaColor("purple")
          } else {
            setAreaColor("default")
          }
        } else {
          setError("No se encontró información del área")
        }
      } catch (err: any) {
        console.error("Error inesperado:", err)
        setError(`Error inesperado: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    if (areaIdOrSlug) {
      loadAreaInfo()
    }
  }, [areaIdOrSlug, supabase])

  // Manejar cambios en los items del plan de acción
  const handleItemsChange = (items: PlanAccionItem[]) => {
    setPlanAccionItems(items)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Cargando información del área...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-4xl mx-auto mt-8">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-8">
      <ModuleHeader
        title={`Plan de Acción - ${areaName}`}
        description="Gestione los planes de acción del área y visualice su progreso"
      />

      {areaId && (
        <>
          <PlanAccionArea
            title={`Plan de Acción - ${areaName}`}
            description="Gestione los planes de acción del área"
            area={areaId}
            color={areaColor}
            onItemsChange={handleItemsChange}
          />

          <PlanAccionAreaCharts data={planAccionItems} area={areaName} color={areaColor} />
        </>
      )}
    </div>
  )
}
