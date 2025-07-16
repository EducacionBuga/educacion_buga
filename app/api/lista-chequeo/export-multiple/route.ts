import { NextRequest, NextResponse } from 'next/server'
import ExcelJS from 'exceljs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contrato, contratista, valor, objeto, apartados } = body

    console.log('🚀 Exportación múltiple iniciada para contrato:', contrato)
    console.log('📋 Apartados recibidos:', Object.keys(apartados))
    Object.entries(apartados).forEach(([apartado, respuestas]) => {
      console.log(`📊 ${apartado}: ${Array.isArray(respuestas) ? respuestas.length : 0} respuestas`)
    })

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Leer la plantilla Excel
    const templatePath = path.join(process.cwd(), 'public', 'document', 'lista-chequeo.xlsx')
    const workbook = new ExcelJS.Workbook()
    await workbook.xlsx.readFile(templatePath)

    // Mapeo de apartados a hojas
    const hojasApartados = {
      'SAMC': 'SAMC',
      'MINIMA CUANTÍA': 'MINIMA CUANTÍA', 
      'CONTRATO INTERADMINISTRATIVO': 'CONTRATO INTERADMINISTRATIVO',
      'PRESTACIÓN DE SERVICIOS': 'PRESTACIÓN DE SERVICIOS'
    }

    // Procesar cada apartado
    for (const [apartadoId, nombreHoja] of Object.entries(hojasApartados)) {
      const worksheet = workbook.getWorksheet(nombreHoja)
      if (!worksheet) continue

      // Llenar datos básicos del contrato en cada hoja
      // Buscar celdas para datos del contrato (ajustar según plantilla real)
      const datosContrato = [
        { texto: 'contrato', valor: contrato },
        { texto: 'contratista', valor: contratista },
        { texto: 'valor', valor: valor }
      ]

      // Buscar y llenar celdas de datos básicos
      for (let row = 1; row <= 20; row++) {
        for (let col = 1; col <= 10; col++) {
          const cell = worksheet.getCell(row, col)
          if (cell.value && typeof cell.value === 'string') {
            const cellValue = cell.value.toLowerCase()
            
            datosContrato.forEach(dato => {
              if (cellValue.includes(dato.texto)) {
                // Llenar la celda adyacente o específica según la plantilla
                if (col < 10) {
                  const targetCell = worksheet.getCell(row, col + 1)
                  targetCell.value = dato.valor
                }
              }
            })
          }
        }
      }

      // Obtener items del apartado
      const { data: categoria } = await supabase
        .from('lista_chequeo_categorias')
        .select('id')
        .eq('nombre', apartadoId)
        .single()

      console.log(`🏷️ Categoría para ${apartadoId}:`, categoria?.id || 'NO ENCONTRADA')

      if (!categoria) continue

      const { data: items } = await supabase
        .from('lista_chequeo_items_maestros')
        .select(`
          id,
          numero_item,
          titulo,
          descripcion,
          fila_excel,
          lista_chequeo_etapas!inner(nombre, orden)
        `)
        .eq('categoria_id', categoria.id)
        .order('numero_item')

      console.log(`📝 Items encontrados para ${apartadoId}:`, items?.length || 0)

      if (!items) continue

      // Obtener respuestas del apartado
      const respuestasApartado = apartados[apartadoId] || []
      console.log(`💭 Respuestas para ${apartadoId}:`, respuestasApartado.length)
      
      const respuestasMap = new Map(
        respuestasApartado.map((resp: {
          item_id: string
          respuesta: string | null
          observaciones: string | null
        }) => [resp.item_id, resp])
      )

      console.log(`🗺️ Mapa de respuestas para ${apartadoId}:`, respuestasMap.size)

      // Llenar respuestas en la hoja
      items.forEach((item) => {
        const respuesta = respuestasMap.get(item.id) as {
          item_id: string
          respuesta: string | null
          observaciones: string | null
        } | undefined
        
        // Determinar fila en Excel (usar fila_excel si está disponible, sino calcular)
        const filaExcel = item.fila_excel || (10 + item.numero_item) // Ajustar según plantilla
        
        if (respuesta) {
          // Columna de respuesta (ajustar según plantilla)
          const colRespuesta = 3 // Columna C por ejemplo
          const colObservaciones = 4 // Columna D por ejemplo
          
          // Llenar respuesta
          const cellRespuesta = worksheet.getCell(filaExcel, colRespuesta)
          const valorRespuesta = respuesta.respuesta === 'SI' ? 'SÍ' : 
                               respuesta.respuesta === 'NO' ? 'NO' : 
                               respuesta.respuesta === 'NO_APLICA' ? 'NO APLICA' : ''
          cellRespuesta.value = valorRespuesta
          
          // Llenar observaciones
          if (respuesta.observaciones) {
            const cellObservaciones = worksheet.getCell(filaExcel, colObservaciones)
            cellObservaciones.value = respuesta.observaciones
          }
        }
      })
    }

    // Generar el archivo Excel
    const buffer = await workbook.xlsx.writeBuffer()

    // Configurar headers para descarga
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', `attachment; filename="Lista-Chequeo-${contrato}.xlsx"`)

    return new NextResponse(buffer, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error en exportación múltiple:', error)
    return NextResponse.json(
      { error: 'Error al generar archivo Excel' },
      { status: 500 }
    )
  }
}
