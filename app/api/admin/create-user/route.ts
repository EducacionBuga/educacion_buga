import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Configuración del cliente admin de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

// Cliente con permisos de administrador
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

interface CreateUserRequest {
  email: string
  password: string
  fullName: string
  role: string
  area: string
}

export async function POST(request: NextRequest) {
  try {
    // Obtener datos del cuerpo de la petición
    const userData: CreateUserRequest = await request.json()
    
    // Validar datos requeridos
    if (!userData.email || !userData.password || !userData.fullName || !userData.role || !userData.area) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { error: 'Formato de email inválido' },
        { status: 400 }
      )
    }

    console.log('🔄 Creando usuario:', userData.email)

    // Crear usuario usando Supabase Auth Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true, // Confirmar email automáticamente
      user_metadata: {
        full_name: userData.fullName,
        role: userData.role,
        area: userData.area
      }
    })

    if (error) {
      console.error('❌ Error creando usuario:', error)
      
      // Manejar errores específicos
      if (error.message.includes('already registered')) {
        return NextResponse.json(
          { error: 'El email ya está registrado' },
          { status: 409 }
        )
      }
      
      if (error.message.includes('password')) {
        return NextResponse.json(
          { error: 'La contraseña no cumple los requisitos mínimos' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: error.message || 'Error al crear usuario' },
        { status: 500 }
      )
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'No se pudo crear el usuario' },
        { status: 500 }
      )
    }

    console.log('✅ Usuario creado exitosamente:', data.user.email)

    // Sincronizar usuario a tabla profiles manualmente (por si el trigger falla)
    try {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: userData.fullName,
          role: userData.role,
          is_admin: userData.role === 'ADMIN',
          created_at: data.user.created_at,
          updated_at: new Date().toISOString()
        })
      
      if (profileError) {
        console.warn('⚠️ Error sincronizando a profiles (trigger puede manejar):', profileError)
      } else {
        console.log('✅ Usuario sincronizado a profiles exitosamente')
      }
    } catch (syncError) {
      console.warn('⚠️ Error en sincronización manual a profiles:', syncError)
      // No fallar la creación por esto, el trigger puede manejar la sincronización
    }

    // Respuesta exitosa
    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        created_at: data.user.created_at,
        user_metadata: data.user.user_metadata
      },
      message: 'Usuario creado exitosamente'
    })

  } catch (error: any) {
    console.error('❌ Error inesperado:', error)
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

// Método GET para verificar el estado de la API
export async function GET() {
  try {
    // Verificar conexión con Supabase
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    })

    if (error) {
      return NextResponse.json(
        { 
          status: 'error',
          message: 'Error conectando con Supabase Auth',
          error: error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'ok',
      message: 'API de creación de usuarios funcionando',
      supabase_connected: true,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Error interno',
        error: error.message
      },
      { status: 500 }
    )
  }
}