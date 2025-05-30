"use client"

import { useState, useEffect } from "react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "@/components/ui/use-toast"
import { supabaseClient } from "@/lib/supabase-client"
import { areaCodeToName, etapaMap, initialChecklistItems } from "@/constants/checklist"
import { Etapa } from "@/constants/checklist"

export interface ChecklistItem {
  id: string
  etapa: string
  documento: string
  descripcion: string
  si: boolean | null
  no: boolean | null
  noAplica: boolean | null
  observaciones: string
}

export function useChecklistData(areaCode: string) {
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [areaUuid, setAreaUuid] = useState<string>("")

  // Obtener el UUID del área desde Supabase
  const getAreaUuid = async (areaCode: string) => {
    try {
      const areaName = areaCodeToName[areaCode as keyof typeof areaCodeToName]
      if (!areaName) {
        console.error(`No se encontró un nombre de área para el código: ${areaCode}`)
        return
      }

      const { data, error } = await supabaseClient.from("areas").select("id").eq("codigo", areaName).single()

      if (error) {
        console.error("Error al obtener el UUID del área:", error)
        return
      }

      if (data) {
        setAreaUuid(data.id)
        console.log(`UUID del área ${areaCode}:`, data.id)

        // Cargar datos existentes de Supabase una vez que tengamos el UUID
        await loadChecklistItems(data.id)
      }
    } catch (error) {
      console.error("Error al obtener el UUID del área:", error)
    }
  }

  // Cargar datos existentes de Supabase
  const loadChecklistItems = async (currentAreaUuid: string) => {
    setIsLoading(true)
    try {
      // Obtener las categorías (etapas)
      const { data: categorias, error: categoriasError } = await supabaseClient
        .from("lista_chequeo_categorias")
        .select("id, nombre")

      if (categoriasError) {
        console.error("Error al cargar categorías:", categoriasError)
        throw categoriasError
      }

      // Mapear categorías por nombre
      const categoriasMap = new Map()
      categorias?.forEach((cat) => {
        categoriasMap.set(cat.nombre.toUpperCase(), cat.id)
      })

      // Obtener los ítems de la lista de chequeo
      const { data: items, error: itemsError } = await supabaseClient
        .from("lista_chequeo_items")
        .select("id, categoria_id, nombre_documento, descripcion")
        .order("orden", { ascending: true })

      if (itemsError) {
        console.error("Error al cargar ítems:", itemsError)
        throw itemsError
      }

      // Si no hay ítems, crear los ítems iniciales
      if (!items || items.length === 0) {
        await createInitialItems(categoriasMap, currentAreaUuid)
        return
      }

      // Obtener las respuestas para el área actual
      const { data: respuestas, error: respuestasError } = await supabaseClient
        .from("lista_chequeo_respuestas")
        .select("*")
        .eq("area_id", currentAreaUuid)

      if (respuestasError) {
        console.error("Error al cargar respuestas:", respuestasError)
        throw respuestasError
      }

      // Mapear respuestas por item_id
      const respuestasMap = new Map()
      respuestas?.forEach((resp) => {
        respuestasMap.set(resp.item_id, resp)
      })

      // Convertir los ítems de Supabase al formato del componente
      const loadedItems: ChecklistItem[] = items.map((item) => {
        const categoria = categorias?.find((cat) => cat.id === item.categoria_id)
        const etapa = categoria ? etapaMap.get(categoria.nombre.toUpperCase()) || categoria.nombre : "Desconocida"
        const respuesta = respuestasMap.get(item.id)

        return {
          id: item.id,
          etapa: etapa,
          documento: item.nombre_documento,
          descripcion: item.descripcion,
          si: respuesta ? respuesta.respuesta === "SI" : null,
          no: respuesta ? respuesta.respuesta === "NO" : null,
          noAplica: respuesta ? respuesta.respuesta === "NO_APLICA" : null,
          observaciones: respuesta ? respuesta.observaciones || "" : "",
        }
      })

      setChecklistItems(loadedItems)
      setIsSaved(true)
    } catch (error) {
      console.error("Error al cargar datos de la lista de chequeo:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos de la lista de chequeo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Crear ítems iniciales en Supabase
  const createInitialItems = async (categoriasMap: Map<string, string>, currentAreaUuid: string) => {
    try {
      // Mapear etapas a categorías
      const etapaToCategoriaMap = {
        [Etapa.Precontractual]: categoriasMap.get("PRECONTRACTUAL"),
        [Etapa.Ejecucion]: categoriasMap.get("EJECUCION"),
        [Etapa.Cierre]: categoriasMap.get("CIERRE"),
      }

      // Crear ítems con IDs únicos
      const itemsWithIds: ChecklistItem[] = initialChecklistItems.map((item) => ({
        ...item,
        id: uuidv4(),
      }))

      setChecklistItems(itemsWithIds)

      // Crear ítems en la base de datos
      for (let i = 0; i < itemsWithIds.length; i++) {
        const item = itemsWithIds[i]
        const categoriaId = etapaToCategoriaMap[item.etapa as keyof typeof etapaToCategoriaMap]

        if (!categoriaId) {
          console.error(`No se encontró categoría para la etapa: ${item.etapa}`)
          continue
        }

        // Insertar ítem en la tabla lista_chequeo_items
        const { error: itemError } = await supabaseClient.from("lista_chequeo_items").insert({
          id: item.id,
          categoria_id: categoriaId,
          nombre_documento: item.documento,
          descripcion: item.descripcion,
          orden: i + 1,
        })

        if (itemError) {
          console.error("Error al crear ítem:", itemError)
          throw itemError
        }
      }

      toast({
        title: "Éxito",
        description: "Se han creado los ítems iniciales de la lista de chequeo.",
      })
    } catch (error) {
      console.error("Error al crear ítems iniciales:", error)
      toast({
        title: "Error",
        description: "No se pudieron crear los ítems iniciales de la lista de chequeo.",
        variant: "destructive",
      })
    }
  }

  // Guardar la lista de chequeo en Supabase
  const saveChecklist = async () => {
    setIsLoading(true)
    try {
      // Verificar que tenemos el UUID del área
      if (!areaUuid) {
        toast({
          title: "Error",
          description: "No se pudo determinar el UUID del área. Por favor, recargue la página.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Obtener el usuario actual
      const { data: userData, error: userError } = await supabaseClient.auth.getUser()
      if (userError) throw userError

      const userId = userData.user?.id

      // Guardar cada respuesta en Supabase
      for (const item of checklistItems) {
        let respuesta = null
        if (item.si) respuesta = "SI"
        else if (item.no) respuesta = "NO"
        else if (item.noAplica) respuesta = "NO_APLICA"

        // Si no hay respuesta, continuamos con el siguiente ítem
        if (!respuesta) continue

        // Verificar si ya existe una respuesta para este ítem y área
        const { data: existingResponse, error: checkError } = await supabaseClient
          .from("lista_chequeo_respuestas")
          .select("id")
          .eq("area_id", areaUuid)
          .eq("item_id", item.id)
          .maybeSingle()

        if (checkError) {
          console.error("Error al verificar respuesta existente:", checkError)
          throw checkError
        }

        if (existingResponse) {
          // Actualizar respuesta existente
          const { error: updateError } = await supabaseClient
            .from("lista_chequeo_respuestas")
            .update({
              respuesta: respuesta,
              observaciones: item.observaciones,
              usuario_id: userId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingResponse.id)

          if (updateError) {
            console.error("Error al actualizar respuesta:", updateError)
            throw updateError
          }
        } else {
          // Crear nueva respuesta
          const { error: insertError } = await supabaseClient.from("lista_chequeo_respuestas").insert({
            id: uuidv4(),
            area_id: areaUuid,
            item_id: item.id,
            respuesta: respuesta,
            observaciones: item.observaciones,
            usuario_id: userId,
          })

          if (insertError) {
            console.error("Error al insertar respuesta:", insertError)
            throw insertError
          }
        }
      }

      // Actualizar el estado
      setIsSaved(true)

      // Mostrar mensaje de éxito
      toast({
        title: "Éxito",
        description:
          "Lista de chequeo guardada correctamente. Los datos están disponibles en la matriz de seguimiento.",
      })
    } catch (error) {
      console.error("Error al guardar la lista de chequeo:", error)
      toast({
        title: "Error",
        description: "Error al guardar la lista de chequeo. Por favor, intente nuevamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Inicializar el hook obteniendo el UUID del área
  useEffect(() => {
    if (areaCode) {
      getAreaUuid(areaCode)
    }
  }, [areaCode])

  return {
    checklistItems,
    setChecklistItems,
    isLoading,
    isSaved,
    areaUuid,
    saveChecklist,
  }
}
