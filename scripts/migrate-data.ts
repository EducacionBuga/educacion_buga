import { createClient } from "@supabase/supabase-js"
import { CloudflareR2Service } from "@/lib/cloudflare-r2"
import { v4 as uuidv4 } from "uuid"

// Este script debe ejecutarse una sola vez para migrar datos existentes
async function migrateData() {
  // Inicializar cliente de Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Obtener usuario administrador para la migración
  const { data: adminUser } = await supabase.from("usuarios").select("id").eq("rol", "ADMIN").single()

  if (!adminUser) {
    console.error("No se encontró un usuario administrador para la migración")
    return
  }

  const adminId = adminUser.id

  // Áreas y módulos a migrar
  const areas = [
    { id: "calidad-educativa", name: "Calidad Educativa" },
    { id: "inspeccion-vigilancia", name: "Inspección y Vigilancia" },
    { id: "cobertura-infraestructura", name: "Cobertura e Infraestructura" },
    { id: "talento-humano", name: "Talento Humano" },
  ]

  const modules = ["proveedores", "prestacion-servicio"]

  // Migrar datos por área y módulo
  for (const area of areas) {
    for (const moduleType of modules) {
      console.log(`Migrando ${area.id}/${moduleType}...`)

      // 1. Migrar carpetas
      const foldersKey = `${area.id}-${moduleType}-folders`
      const storedFolders = localStorage.getItem(foldersKey)

      if (storedFolders) {
        const folders = JSON.parse(storedFolders)

        // Obtener área de Supabase
        const { data: areaData } = await supabase.from("areas").select("id").eq("codigo", area.id).single()

        if (!areaData) {
          console.error(`Área ${area.id} no encontrada en Supabase`)
          continue
        }

        const areaId = areaData.id

        // Crear carpetas en Supabase
        for (const folder of folders) {
          const { data: newFolder, error } = await supabase
            .from("carpetas")
            .insert({
              id: uuidv4(),
              nombre: folder.name,
              descripcion: folder.description || "",
              color: folder.color,
              categoria: folder.category,
              area_id: areaId,
              modulo: moduleType,
              creado_por: adminId,
            })
            .select()
            .single()

          if (error) {
            console.error(`Error al crear carpeta ${folder.name}:`, error)
            continue
          }

          // 2. Migrar documentos de esta carpeta
          const documentsKey = `${area.id}-${moduleType}-documents`
          const storedDocuments = localStorage.getItem(documentsKey)

          if (storedDocuments) {
            const documents = JSON.parse(storedDocuments)
            const folderDocuments = documents.filter((doc) => doc.folderId === folder.id)

            for (const doc of folderDocuments) {
              try {
                // Convertir data URL a File para subir a R2
                if (doc.fileUrl && doc.fileUrl.startsWith("data:")) {
                  const response = await fetch(doc.fileUrl)
                  const blob = await response.blob()
                  const file = new File([blob], doc.name, { type: doc.fileType })

                  // Subir a R2
                  const uploadResult = await CloudflareR2Service.uploadFile({
                    file,
                    areaId: area.id,
                    modulo: moduleType,
                    categoria: folder.category,
                    userId: adminId,
                  })

                  if (!uploadResult.success) {
                    throw new Error(uploadResult.error)
                  }

                  // Guardar referencia en Supabase
                  await supabase.from("documentos").insert({
                    nombre: doc.name,
                    descripcion: doc.description || "",
                    carpeta_id: newFolder.id,
                    tipo_archivo: doc.fileType,
                    tamano: doc.fileSize,
                    r2_key: uploadResult.r2Key!,
                    url_publica: uploadResult.url,
                    r2_bucket: process.env.R2_BUCKET!,
                    r2_prefijo: `${area.id}/${moduleType}/${folder.category}`,
                    creado_por: adminId,
                    estado: "activo",
                  })

                  console.log(`Documento ${doc.name} migrado correctamente`)
                } else {
                  console.warn(`Documento ${doc.name} no tiene una URL de datos válida, omitiendo`)
                }
              } catch (error) {
                console.error(`Error al migrar documento ${doc.name}:`, error)
              }
            }
          }
        }
      }
    }
  }

  // 3. Migrar planes de acción
  for (const area of areas) {
    const planKey = `${area.id}-plan-accion`
    const storedPlans = localStorage.getItem(planKey)

    if (storedPlans) {
      const plans = JSON.parse(storedPlans)

      // Obtener área de Supabase
      const { data: areaData } = await supabase.from("areas").select("id").eq("codigo", area.id).single()

      if (!areaData) {
        console.error(`Área ${area.id} no encontrada en Supabase`)
        continue
      }

      const areaId = areaData.id

      for (const plan of plans) {
        try {
          await supabase.from("plan_accion").insert({
            numero: plan.numero,
            meta: plan.meta,
            actividad: plan.actividad,
            proceso: plan.proceso,
            presupuesto_disponible: Number.parseFloat(plan.presupuestoDisponible) || 0,
            presupuesto_ejecutado: Number.parseFloat(plan.presupuestoEjecutado) || 0,
            porcentaje_avance: Number.parseInt(plan.porcentajeAvance) || 0,
            recursos_necesarios: plan.recursosNecesarios,
            indicador: plan.indicador,
            unidad_medida: plan.unidadMedida,
            formula: plan.formula,
            periodo: plan.periodo,
            fecha_inicio: plan.fechaInicio,
            fecha_fin: plan.fechaFin,
            responsable_id: adminId, // Temporal, luego se puede actualizar
            area_id: areaId,
            estado: plan.estado,
            ano: new Date().getFullYear(),
          })

          console.log(`Plan de acción ${plan.numero} migrado correctamente`)
        } catch (error) {
          console.error(`Error al migrar plan de acción ${plan.numero}:`, error)
        }
      }
    }
  }

  // 4. Migrar listas de chequeo
  for (const area of areas) {
    const checklistKey = `${area.id}-lista-chequeo`
    const storedChecklist = localStorage.getItem(checklistKey)

    if (storedChecklist) {
      const checklistItems = JSON.parse(storedChecklist)

      // Obtener área de Supabase
      const { data: areaData } = await supabase.from("areas").select("id").eq("codigo", area.id).single()

      if (!areaData) {
        console.error(`Área ${area.id} no encontrada en Supabase`)
        continue
      }

      const areaId = areaData.id

      // Agrupar por categoría
      const categoriesMap = new Map()

      for (const item of checklistItems) {
        if (!categoriesMap.has(item.category)) {
          categoriesMap.set(item.category, [])
        }
        categoriesMap.get(item.category).push(item)
      }

      // Crear categorías y sus ítems
      let categoryOrder = 0
      for (const [categoryName, items] of categoriesMap.entries()) {
        try {
          // Crear categoría
          const { data: category, error } = await supabase
            .from("categorias_chequeo")
            .insert({
              nombre: categoryName,
              descripcion: `Categoría ${categoryName}`,
              orden: categoryOrder++,
            })
            .select()
            .single()

          if (error) {
            throw error
          }

          // Crear ítems
          for (const item of items) {
            const { data: checkItem } = await supabase
              .from("items_chequeo")
              .insert({
                categoria_id: category.id,
                descripcion: item.description,
                obligatorio: true,
              })
              .select()
              .single()

            // Crear respuesta
            await supabase.from("respuestas_chequeo").insert({
              item_id: checkItem.id,
              area_id: areaId,
              completado: item.completed,
              usuario_id: adminId,
              comentario: "",
            })
          }

          console.log(`Categoría ${categoryName} con ${items.length} ítems migrada correctamente`)
        } catch (error) {
          console.error(`Error al migrar categoría ${categoryName}:`, error)
        }
      }
    }
  }

  console.log("Migración completada")
}

// Ejecutar migración
migrateData().catch(console.error)
