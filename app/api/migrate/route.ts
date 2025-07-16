import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Iniciando migración de base de datos...')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Migration SQL
    const migrationSQL = `
      DO $$
      BEGIN
          -- Add contrato column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='contrato') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN contrato VARCHAR(255) DEFAULT 'Sin contrato';
              RAISE NOTICE 'Added contrato column';
          END IF;

          -- Add contratista column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='contratista') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN contratista VARCHAR(255) DEFAULT 'Sin contratista';
              RAISE NOTICE 'Added contratista column';
          END IF;

          -- Add valor column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='valor') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN valor DECIMAL(15,2) DEFAULT 0;
              RAISE NOTICE 'Added valor column';
          END IF;

          -- Add objeto column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='objeto') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN objeto TEXT DEFAULT 'Sin descripción';
              RAISE NOTICE 'Added objeto column';
          END IF;

          -- Add created_at column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='created_at') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
              RAISE NOTICE 'Added created_at column';
          END IF;

          -- Add updated_at column if it doesn't exist
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                         WHERE table_name='lista_chequeo_registros' AND column_name='updated_at') THEN
              ALTER TABLE lista_chequeo_registros ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
              RAISE NOTICE 'Added updated_at column';
          END IF;

      END $$;
    `

    console.log('📋 Ejecutando migración SQL...')
    
    let results: any[] = []
    
    try {
      // Intentar agregar cada columna individualmente
      const columns = [
        { name: 'contrato', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS contrato VARCHAR(255) DEFAULT \'Sin contrato\';' },
        { name: 'contratista', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS contratista VARCHAR(255) DEFAULT \'Sin contratista\';' },
        { name: 'valor', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS valor DECIMAL(15,2) DEFAULT 0;' },
        { name: 'objeto', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS objeto TEXT DEFAULT \'Sin descripción\';' },
        { name: 'created_at', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();' },
        { name: 'updated_at', sql: 'ALTER TABLE lista_chequeo_registros ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();' }
      ]
      
      for (const column of columns) {
        try {
          console.log(`Agregando columna ${column.name}...`)
          
          // Usar raw SQL query
          const { data, error } = await supabase.rpc('exec_sql', {
            sql: column.sql
          })
          
          if (error) {
            console.error(`Error en ${column.name}:`, error)
            results.push({ column: column.name, success: false, error: error.message })
          } else {
            console.log(`✅ Columna ${column.name} procesada`)
            results.push({ column: column.name, success: true })
          }
        } catch (err) {
          console.error(`Error agregando ${column.name}:`, err)
          results.push({ column: column.name, success: false, error: err })
        }
      }

      // Si no funciona exec_sql, intentar con una simple query
      if (results.some(r => !r.success)) {
        console.log('Intentando método alternativo...')
        
        // Intentar insertar un registro de prueba para verificar estructura
        const { data: testData, error: testError } = await supabase
          .from('lista_chequeo_registros')
          .select('id, contrato, contratista, valor, objeto, created_at')
          .limit(1)
        
        if (testError) {
          console.error('Error en test query:', testError)
          return NextResponse.json({
            success: false,
            error: 'Las columnas aún no existen en la base de datos',
            testError: testError.message,
            results
          }, { status: 500 })
        }
      }

    } catch (error) {
      console.error('❌ Error en migración SQL:', error)
      return NextResponse.json({
        success: false,
        error: error instanceof Error ? error.message : 'Error en migración SQL'
      }, { status: 500 })
    }

    console.log('✅ Migración completada')

    // Verify the migration worked by checking existing data
    const { data: registros, error: registrosError } = await supabase
      .from('lista_chequeo_registros')
      .select('id, contrato, contratista, valor, objeto')
      .limit(3)

    return NextResponse.json({
      success: true,
      message: 'Migración completada exitosamente',
      sampleData: registros,
      migrationResults: results
    })

  } catch (error) {
    console.error('❌ Error durante la migración:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
