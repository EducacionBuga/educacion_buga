import { createClient as createSupabaseClient, SupabaseClient } from "@supabase/supabase-js"

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

// Crear cliente con clave anónima (para uso en el cliente)
export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createSupabaseClient(supabaseUrl || "", supabaseAnonKey || "")
  }
  return supabaseInstance
}

// Crear cliente con clave de servicio (para uso en el servidor)
export const createAdminClient = () => {
  if (!supabaseServiceKey) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY. Some operations may fail.")
  }
  return createSupabaseClient(supabaseUrl || "", supabaseServiceKey || "")
}

// Exportar cliente por defecto (para compatibilidad con código existente)
export default createClient()
