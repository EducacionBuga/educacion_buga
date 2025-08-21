import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

// Función para verificar la conectividad de Supabase
export const testSupabaseConnection = async (client: SupabaseClient): Promise<boolean> => {
  try {
    const { data, error } = await client.from('usuarios').select('count', { count: 'exact', head: true })
    return !error
  } catch (error) {
    console.error('Error testing Supabase connection:', error)
    return false
  }
}

// Función para esperar con timeout
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Función para conexión con reintentos
export const connectWithRetry = async (client: SupabaseClient, maxRetries = 3, delayMs = 1000): Promise<boolean> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`🔄 [SUPABASE] Intento de conexión ${attempt}/${maxRetries}`)
    
    const isConnected = await testSupabaseConnection(client)
    
    if (isConnected) {
      console.log('✅ [SUPABASE] Conexión exitosa')
      return true
    }
    
    if (attempt < maxRetries) {
      console.log(`⏳ [SUPABASE] Esperando ${delayMs}ms antes del siguiente intento...`)
      await delay(delayMs)
      delayMs *= 2 // Incremento exponencial del delay
    }
  }
  
  console.error('❌ [SUPABASE] No se pudo establecer conexión después de todos los intentos')
  return false
}

// Verificar que las variables de entorno estén definidas
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables. Check your .env file or environment configuration.", {
    supabaseUrl: !!supabaseUrl,
    supabaseAnonKey: !!supabaseAnonKey,
    supabaseServiceKey: !!supabaseServiceKey,
  })
}

// Crear una única instancia del cliente para reutilizarla
let supabaseInstance: SupabaseClient | null = null

// Crear cliente con clave anónima (para uso en el cliente) - Optimizado
export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "", {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Optimizaciones de timeout para producción
        storageKey: 'sb-auth-token',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined
      },
      db: {
        schema: 'public'
      },
      global: {
        headers: {
          'X-Client-Info': 'sistema-educativo-web',
          'X-Client-Version': '1.0.0'
        },
        // Configuración de fetch optimizada
        fetch: (url, options = {}) => {
          return fetch(url, {
            ...options,
            // Timeout de 15 segundos para consultas
            signal: AbortSignal.timeout(15000)
          })
        }
      },
      realtime: {
        timeout: 15000,
        heartbeatIntervalMs: 25000,
        // Reducir reconexiones automáticas para mejor rendimiento
        reconnectAfterMs: (tries) => Math.min(tries * 1000, 10000)
      }
    })
  }
  return supabaseInstance
}

// Crear cliente con clave de servicio (para uso en el servidor)
export const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Some operations may fail.")
  }
  return createSupabaseClient(supabaseUrl || "", supabaseServiceKey || "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-admin'
      }
    }
  })
}

// Crear cliente para API routes (mantiene cookies del usuario)
export const createApiClient = () => {
  return createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "", {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-api'
      }
    }
  })
}

// Exportar cliente por defecto (para compatibilidad con código existente)
export default createClient()
