"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase-types"

// Tipos
interface User {
  id: string
  name: string
  role: string
  email: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient<Database>()

  // Cache para evitar consultas duplicadas
  const [userCache, setUserCache] = useState<{ [userId: string]: User }>({})

  // Función optimizada para obtener datos del usuario
  const fetchUserData = async (userId: string, email: string): Promise<User> => {
    console.log("👤 [AUTH-CONTEXT] fetchUserData llamada para:", { userId, email })
    
    // Verificar cache primero
    if (userCache[userId]) {
      console.log("📋 [AUTH-CONTEXT] Usuario encontrado en cache")
      return userCache[userId]
    }

    const authUser: User = {
      id: userId,
      email,
      name: email.split("@")[0] || "Usuario",
      role: "USER", // Rol por defecto
    }

    console.log("👤 [AUTH-CONTEXT] Usuario base creado:", authUser)

    try {
      console.log("🔍 [AUTH-CONTEXT] Buscando datos adicionales en BD...")
      // Consulta optimizada con menos logs
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select("nombre, rol")
        .eq("uuid", userId)
        .single()

      console.log("📊 [AUTH-CONTEXT] Respuesta de BD:", { userData, error: userError?.message })

      if (!userError && userData) {
        authUser.name = userData.nombre || authUser.name
        if (userData.rol) {
          authUser.role = userData.rol
        }
        console.log("✅ [AUTH-CONTEXT] Datos del usuario actualizados:", authUser)
      } else {
        console.warn("⚠️ [AUTH-CONTEXT] No se encontraron datos adicionales o error:", userError?.message)
      }
    } catch (error) {
      console.warn("❌ [AUTH-CONTEXT] Error al obtener datos del usuario, usando datos básicos:", error)
    }

    // Guardar en cache
    setUserCache(prev => ({ ...prev, [userId]: authUser }))
    console.log("💾 [AUTH-CONTEXT] Usuario guardado en cache")
    return authUser
  }

  // Verificar si hay un usuario en la sesión de Supabase al cargar
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🚀 [AUTH-CONTEXT] Inicializando autenticación...")
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error("❌ [AUTH-CONTEXT] Error al obtener la sesión:", error)
          setLoading(false)
          return
        }

        console.log("📊 [AUTH-CONTEXT] Sesión obtenida:", session ? 'Sesión activa' : 'Sin sesión')

        if (session?.user) {
          console.log("👤 [AUTH-CONTEXT] Usuario en sesión, obteniendo datos...")
          const userData = await fetchUserData(session.user.id, session.user.email || "")
          setUser(userData)
        } else {
          console.log("👻 [AUTH-CONTEXT] No hay usuario en la sesión")
        }

        setLoading(false)
      } catch (error) {
        console.error("❌ [AUTH-CONTEXT] Error al inicializar la autenticación:", error)
        setLoading(false)
      }
    }

    // Suscribirse a cambios en la autenticación con optimización
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 [AUTH-CONTEXT] Estado de auth cambió:", event, session ? 'Con sesión' : 'Sin sesión')
      
      if (event === 'SIGNED_IN' && session?.user) {
        console.log("✅ [AUTH-CONTEXT] Usuario logueado, obteniendo datos...")
        const userData = await fetchUserData(session.user.id, session.user.email || "")
        console.log("👤 [AUTH-CONTEXT] Datos del usuario obtenidos:", userData)
        setUser(userData)
      } else if (event === 'SIGNED_OUT') {
        console.log("👋 [AUTH-CONTEXT] Usuario deslogueado")
        setUser(null)
        setUserCache({}) // Limpiar cache al cerrar sesión
      }
      
      setLoading(false)
    })

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  // Función de login con Supabase
  const login = async (email: string, password: string) => {
    console.log("🔐 [AUTH-CONTEXT] AuthContext: Iniciando login para:", email)
    
    try {
      console.log("📡 [AUTH-CONTEXT] Llamando a supabase.auth.signInWithPassword...")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log("📊 [AUTH-CONTEXT] Respuesta de Supabase:", { 
        user: data?.user ? 'Usuario encontrado' : 'No user', 
        session: data?.session ? 'Sesión creada' : 'No session',
        error: error ? error.message : 'Sin error'
      })

      if (error) {
        console.error("❌ [AUTH-CONTEXT] Error en login:", error)
        throw error
      }

      if (!data?.user) {
        console.error("❌ [AUTH-CONTEXT] No se recibió usuario de Supabase")
        throw new Error("No se pudo autenticar el usuario")
      }

      console.log("✅ [AUTH-CONTEXT] Login exitoso para usuario ID:", data.user.id)
      
    } catch (error) {
      console.error("❌ [AUTH-CONTEXT] Error capturado en login:", error)
      throw error
    }
  }

  // Función de logout con Supabase
  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error al cerrar sesión:", error)
    }
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook personalizado para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}
