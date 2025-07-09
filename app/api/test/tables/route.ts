import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-client'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    console.log('🔍 Verificando estructura de tablas de lista de chequeo...')
    
    // Verificar tabla lista_chequeo_respuestas
    const { data: respuestas, error: respuestasError } = await supabase
      .from('lista_chequeo_respuestas')
      .select('*')
      .limit(1)

    console.log('Tabla lista_chequeo_respuestas:', { 
      exists: !respuestasError, 
      error: respuestasError?.message,
      sampleData: respuestas?.[0] 
    })

    // Verificar tabla lista_chequeo_items
    const { data: items, error: itemsError } = await supabase
      .from('lista_chequeo_items')
      .select('*')
      .limit(1)

    console.log('Tabla lista_chequeo_items:', { 
      exists: !itemsError, 
      error: itemsError?.message,
      sampleData: items?.[0] 
    })

    // Verificar tabla lista_chequeo_categorias
    const { data: categorias, error: categoriasError } = await supabase
      .from('lista_chequeo_categorias')
      .select('*')
      .limit(5)

    console.log('Tabla lista_chequeo_categorias:', { 
      exists: !categoriasError, 
      error: categoriasError?.message,
      data: categorias 
    })

    // Verificar tabla areas
    const { data: areas, error: areasError } = await supabase
      .from('areas')
      .select('id, nombre, codigo')
      .limit(5)

    console.log('Tabla areas:', { 
      exists: !areasError, 
      error: areasError?.message,
      data: areas 
    })

    return NextResponse.json({ 
      success: true,
      tables: {
        lista_chequeo_respuestas: { exists: !respuestasError, error: respuestasError?.message },
        lista_chequeo_items: { exists: !itemsError, error: itemsError?.message },
        lista_chequeo_categorias: { exists: !categoriasError, error: categoriasError?.message },
        areas: { exists: !areasError, error: areasError?.message }
      }
    })

  } catch (error) {
    console.error('🔍 Error verificando tablas:', error)
    return NextResponse.json(
      { error: 'Error checking tables', details: String(error) },
      { status: 500 }
    )
  }
}
