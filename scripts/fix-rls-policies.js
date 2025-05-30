const { createClient } = require('@supabase/supabase-js')

// Cargar variables de entorno
require('dotenv').config({ path: '.env.local' })

async function fixRLSPolicies() {
  console.log('🔧 Iniciando corrección de políticas RLS...')
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Variables de entorno faltantes')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  try {
    console.log('👤 Verificando usuario actual...')
    
    // Obtener el usuario actual
    const { data: userData, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Error al obtener usuario:', userError)
      return
    }

    if (!userData.user) {
      console.log('⚠️ No hay usuario autenticado. Vamos a verificar las políticas RLS...')
    } else {
      console.log('✅ Usuario autenticado:', userData.user.id, userData.user.email)
      
      // Verificar si el usuario existe en la tabla usuarios
      const { data: dbUser, error: dbUserError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('uuid', userData.user.id)
        .single()
      
      if (dbUserError || !dbUser) {
        console.log('⚠️ Usuario no encontrado en tabla usuarios. Creando...')
        
        // Crear usuario en la tabla usuarios
        const { error: insertError } = await supabase
          .from('usuarios')
          .insert({
            uuid: userData.user.id,
            nombre: userData.user.email?.split('@')[0] || 'Usuario',
            rol: 'ADMIN',
            area_id: 1, // Área por defecto
            cargo: 'Administrador'
          })
        
        if (insertError) {
          console.error('❌ Error al crear usuario en BD:', insertError)
        } else {
          console.log('✅ Usuario creado en BD')
        }
      } else {
        console.log('✅ Usuario encontrado en BD:', dbUser.nombre, dbUser.rol)
      }
    }

    console.log('🔍 Verificando políticas RLS existentes...')
    
    // Intentar hacer un insert de prueba para ver qué política está bloqueando
    const testData = {
      area_id: 1,
      programa: 'Programa de Prueba',
      objetivo: 'Objetivo de Prueba',
      meta: 'Meta de Prueba',
      presupuesto: 100000,
      acciones: 'Acciones de Prueba',
      indicadores: 'Indicadores de Prueba',
      porcentaje_avance: 0,
      fecha_inicio: new Date().toISOString().split('T')[0],
      fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      responsable: 'Responsable de Prueba',
      estado: 'Pendiente',
      prioridad: 'Media',
      comentarios: 'Comentarios de Prueba',
      usuario_id: userData.user?.id
    }

    console.log('🧪 Probando inserción con datos:', {
      area_id: testData.area_id,
      usuario_id: testData.usuario_id,
      programa: testData.programa
    })

    const { data: insertData, error: insertError } = await supabase
      .from('plan_accion')
      .insert(testData)
      .select()
      .single()

    if (insertError) {
      console.error('❌ Error en insert de prueba:', insertError.message)
      
      if (insertError.message.includes('row-level security policy')) {
        console.log('🔧 Detectado problema de RLS. Intentando solucionarlo...')
        
        // Desactivar RLS temporalmente para verificar si ese es el problema
        console.log('⚠️ NOTA: Para solucionar el problema de RLS, ejecuta estos comandos en tu dashboard de Supabase:')
        console.log('')
        console.log('-- Política para permitir INSERT en plan_accion')
        console.log(`CREATE POLICY "plan_accion_insert_policy" ON public.plan_accion FOR INSERT WITH CHECK (true);`)
        console.log('')
        console.log('-- Política para permitir SELECT en plan_accion')
        console.log(`CREATE POLICY "plan_accion_select_policy" ON public.plan_accion FOR SELECT USING (true);`)
        console.log('')
        console.log('-- Política para permitir UPDATE en plan_accion')
        console.log(`CREATE POLICY "plan_accion_update_policy" ON public.plan_accion FOR UPDATE USING (true);`)
        console.log('')
        console.log('-- Política para permitir DELETE en plan_accion')
        console.log(`CREATE POLICY "plan_accion_delete_policy" ON public.plan_accion FOR DELETE USING (true);`)
        console.log('')
        console.log('-- Habilitar RLS en la tabla')
        console.log(`ALTER TABLE public.plan_accion ENABLE ROW LEVEL SECURITY;`)
        console.log('')
      }
    } else {
      console.log('✅ Insert de prueba exitoso:', insertData.id)
      
      // Limpiar el registro de prueba
      await supabase
        .from('plan_accion')
        .delete()
        .eq('id', insertData.id)
      
      console.log('🧹 Registro de prueba eliminado')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

fixRLSPolicies()
