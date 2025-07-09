import { NextRequest, NextResponse } from 'next/server'
import * as XLSX from 'xlsx'
import * as fs from 'fs'
import * as path from 'path'
import { createAdminClient } from '@/lib/supabase-client'
import { TipoContrato, RespuestaItem } from '@/constants/checklist'

// Mapeo de respuestas a columnas
const RESPUESTA_TO_COLUMN = {
  [RespuestaItem.CUMPLE]: 'C',
  [RespuestaItem.NO_CUMPLE]: 'D',
  [RespuestaItem.NO_APLICA]: 'E'
}

const OBSERVACIONES_COLUMN = 'J'

interface ChecklistDataForExport {
  numero_item: number
  respuesta: RespuestaItem | null
  observaciones: string | null
  fila_excel: number
}

async function getChecklistDataFromDB(areaCode: string, tipoContrato: TipoContrato): Promise<ChecklistDataForExport[]> {
  try {
    console.log('Obteniendo datos de lista de chequeo para:', { areaCode, tipoContrato })
    
    const supabase = createAdminClient()
    
    // Obtener el área ID desde el mapeo
    const { areaCodeToId } = await import('@/constants/checklist')
    const areaId = areaCodeToId[areaCode]
    
    if (!areaId) {
      console.error('Área no encontrada para código:', areaCode)
      return []
    }

    console.log('Usando área ID:', areaId)

    // Obtener la categoría (tipo de contrato)
    const { data: categoria, error: categoriaError } = await supabase
      .from('lista_chequeo_categorias')
      .select('id')
      .eq('nombre', tipoContrato)
      .single()

    if (categoriaError || !categoria) {
      console.error('Error al obtener categoría:', categoriaError)
      return []
    }

    console.log('Usando categoría ID:', categoria.id)

    // Obtener los items que pertenecen a esta categoría con su mapeo de filas
    const { data: itemsWithMapping, error: itemsError } = await supabase
      .from('lista_chequeo_item_categorias')
      .select(`
        fila_excel,
        lista_chequeo_items_maestros (
          id,
          numero_item
        )
      `)
      .eq('categoria_id', categoria.id)

    if (itemsError) {
      console.error('Error al obtener items:', itemsError)
      return []
    }

    console.log(`Encontrados ${itemsWithMapping?.length || 0} items para la categoría`)

    // Obtener las respuestas existentes para estos items
    const itemIds = itemsWithMapping?.map(item => (item.lista_chequeo_items_maestros as any).id) || []
    
    if (itemIds.length === 0) {
      console.log('No hay items para esta categoría')
      return []
    }

    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .eq('area_id', areaId)
      .in('item_id', itemIds)

    if (respuestasError) {
      console.error('Error al obtener respuestas:', respuestasError)
      return []
    }

    console.log(`Encontradas ${respuestas?.length || 0} respuestas`)

    // Crear mapeo de respuestas por item_id
    const respuestasMap = new Map()
    respuestas?.forEach(respuesta => {
      respuestasMap.set(respuesta.item_id, respuesta)
    })

    // Transformar los datos combinando items con respuestas
    const dataForExport: ChecklistDataForExport[] = []
    
    itemsWithMapping?.forEach(item => {
      const itemData = item.lista_chequeo_items_maestros as any
      const respuesta = respuestasMap.get(itemData.id)
      
      dataForExport.push({
        numero_item: itemData.numero_item,
        respuesta: respuesta?.respuesta || null,
        observaciones: respuesta?.observaciones || null,
        fila_excel: item.fila_excel
      })
    })

    console.log(`Datos preparados para exportación: ${dataForExport.length} items`)
    return dataForExport

  } catch (error) {
    console.error('Error en getChecklistDataFromDB:', error)
    return []
  }
}

function cleanObservationText(text: string): string {
  if (!text) return ''
  
  return text
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Eliminar caracteres de control
    .replace(/[\u2000-\u206F]/g, ' ') // Convertir espacios especiales a espacios normales
    .replace(/\s+/g, ' ') // Convertir múltiples espacios a uno solo
    .trim()
    .substring(0, 500) // Limitar longitud
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { areaCode, tipoContrato } = body

    if (!areaCode || !tipoContrato) {
      return NextResponse.json(
        { error: 'areaCode y tipoContrato son requeridos' },
        { status: 400 }
      )
    }

    console.log('Iniciando exportación Excel para:', { areaCode, tipoContrato })

    // Obtener datos de la base de datos
    const checklistData = await getChecklistDataFromDB(areaCode, tipoContrato)

    // Leer la plantilla Excel
    const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx')
    
    if (!fs.existsSync(templatePath)) {
      console.error('Plantilla no encontrada en:', templatePath)
      return NextResponse.json(
        { error: 'Plantilla no encontrada' },
        { status: 404 }
      )
    }

    const templateBuffer = fs.readFileSync(templatePath)
    const workbook = XLSX.read(templateBuffer, { type: 'buffer' })

    // Verificar que la hoja existe
    const sheetName = tipoContrato
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`Hoja ${sheetName} no encontrada. Hojas disponibles:`, workbook.SheetNames)
      return NextResponse.json(
        { error: `Hoja ${sheetName} no encontrada en la plantilla` },
        { status: 400 }
      )
    }

    const worksheet = workbook.Sheets[sheetName]

    console.log(`Procesando ${checklistData.length} respuestas para la hoja ${sheetName}`)

    // Llenar los datos en la plantilla
    checklistData.forEach((data) => {
      try {
        const row = data.fila_excel

        // Marcar la respuesta en la columna correspondiente
        if (data.respuesta) {
          const column = RESPUESTA_TO_COLUMN[data.respuesta]
          if (column && row) {
            const cellAddress = `${column}${row}`
            if (!worksheet[cellAddress]) {
              worksheet[cellAddress] = { t: 's', v: '' }
            }
            worksheet[cellAddress].v = '✔'
            console.log(`Marcando ${cellAddress} con ✔ para respuesta ${data.respuesta}`)
          }
        }

        // Escribir observaciones
        if (data.observaciones && row) {
          const observacionesAddress = `${OBSERVACIONES_COLUMN}${row}`
          if (!worksheet[observacionesAddress]) {
            worksheet[observacionesAddress] = { t: 's', v: '' }
          }
          worksheet[observacionesAddress].v = cleanObservationText(data.observaciones)
          console.log(`Escribiendo observación en ${observacionesAddress}`)
        }

      } catch (error) {
        console.error('Error procesando item:', data.numero_item, error)
      }
    })

    // Generar el archivo Excel
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx',
      compression: true
    })

    console.log('Excel generado exitosamente')

    // Retornar el archivo
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="lista_chequeo_${tipoContrato}_${areaCode}.xlsx"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error('Error en export-excel:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor al generar Excel' },
      { status: 500 }
    )
  }
}
