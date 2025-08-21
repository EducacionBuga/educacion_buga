'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase-client'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

// Tipos optimizados
export interface AuthUser {
  id: string
  email: string
  name: string
  role: string
  area_id?: string | null
  dependencia?: string | null
  is_admin?: boolean
}

export interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Cache para datos de usuario
const userCache = new Map<string, { data: AuthUser; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Función para normalizar roles
const normalizeRole = (role: string): string => {
  const roleMap: Record<string, string> = {
    'ADMIN': 'ADMIN',
    'ADMINISTRATOR': 'ADMIN',
    'SUPER_ADMIN': 'ADMIN',
    'TALENTO_HUMANO': 'TALENTO_HUMANO',
    'TALENTO HUMANO': 'TALENTO_HUMANO',
    'RECURSOS_HUMANOS': 'TALENTO_HUMANO',
    'CALIDAD_EDUCATIVA': 'CALIDAD_EDUCATIVA',
    'CALIDAD EDUCATIVA': 'CALIDAD_EDUCATIVA',
    'CALIDAD': 'CALIDAD_EDUCATIVA',
    'COBERTURA_INFRAESTRUCTURA': 'COBERTURA_INFRAESTRUCTURA',
    'COBERTURA E INFRAESTRUCTURA': 'COBERTURA_INFRAESTRUCTURA',
    'COBERTURA': 'COBERTURA_INFRAESTRUCTURA',
    'INSPECCION_VIGILANCIA': 'INSPECCION_VIGILANCIA',
    'INSPECCIÓN Y VIGILANCIA': 'INSPECCION_VIGILANCIA',
    'INSPECCION': 'INSPECCION_VIGILANCIA',
    'PLANEACION': 'PLANEACION',
    'PLANEACIÓN': 'PLANEACION',
    'DESPACHO': 'DESPACHO'
  }
  
  return roleMap[role?.toUpperCase()] || 'USER'
}

// Función optimizada para obtener datos de usuario
const fetchUserDataOptimized = async (userId: string, email: string, supabase: any): Promise<AuthUser> => {
  // Verificar cache primero
  const cached = userCache.get(userId)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('📦 Usando datos de usuario desde cache')
    return cached.data
  }

  try {
    console.log('🔍 Obteniendo datos de usuario con RPC optimizada:', { userId, email })
    
    // Usar la función RPC optimizada
    const { data: userProfile, error: profileError } = await supabase
      .rpc('get_user_role', { user_id: userId })
      .single()

    if (userProfile && !profileError) {
      const userData: AuthUser = {
        id: userId,
        email: userProfile.email || email,
        name: userProfile.full_name || email.split('@')[0],
        role: normalizeRole(userProfile.role || 'USER'),
        area_id: userProfile.area_id,
        dependencia: userProfile.dependencia,
        is_admin: userProfile.is_admin || false
      }

      // Guardar en cache
      userCache.set(userId, { data: userData, timestamp: Date.now() })
      
      console.log('✅ Datos de usuario obtenidos exitosamente:', {
        email: userData.email,
        role: userData.role,
        is_admin: userData.is_admin,
        source: 'RPC_OPTIMIZED'
      })
      
      return userData
    }
  } catch (error) {
    console.warn('⚠️ Error en RPC get_user_role, usando fallback:', error)
  }

  // Fallback a datos básicos
  const fallbackData: AuthUser = {
    id: userId,
    email: email,
    name: email.split('@')[0],
    role: 'USER',
    is_admin: false
  }

  console.log('🔄 Usando datos de fallback para usuario:', fallbackData)
  return fallbackData
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()
  const initializingRef = useRef(false)

  // Función de login optimizada
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('🔑 Iniciando login optimizado:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Error en login:', error.message)
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        console.log('✅ Login exitoso')
        
        // Obtener datos del usuario de forma optimizada
        const userData = await fetchUserDataOptimized(data.user.id, data.user.email!, supabase)
        
        setUser(userData)
        setSession(data.session)
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        return { success: true }
      }

      return { success: false, error: 'No se pudo iniciar sesión' }
    } catch (error: any) {
      console.error('❌ Error inesperado en login:', error)
      
      let errorMessage = 'Error inesperado al iniciar sesión'
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '🔐 Email o contraseña incorrectos'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = '🌐 Problema de conexión. Verifica tu internet'
      } else if (error.message?.includes('timeout')) {
        errorMessage = '⏱️ El servidor está tardando más de lo normal'
      }
      
      return { success: false, error: errorMessage }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Función de logout
  const logout = useCallback(async () => {
    setLoading(true)
    
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      
      // Limpiar cache y localStorage
      userCache.clear()
      localStorage.removeItem('supabase_session')
      localStorage.removeItem('user_data')
      
      router.push('/')
    } catch (error) {
      console.error('Error en logout:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  // Función para refrescar sesión
  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        setSession(data.session)
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
      }
    } catch (error) {
      console.error('Error refreshing session:', error)
    }
  }, [supabase])

  // Inicialización optimizada de autenticación
  useEffect(() => {
    if (initializingRef.current) return
    initializingRef.current = true

    const initializeAuth = async () => {
      try {
        // Intentar cargar desde localStorage primero (más rápido)
        const savedSession = localStorage.getItem('supabase_session')
        const savedUser = localStorage.getItem('user_data')
        
        if (savedSession && savedUser) {
          try {
            const parsedSession = JSON.parse(savedSession)
            const parsedUser = JSON.parse(savedUser)
            
            // Verificar si la sesión no ha expirado
            const now = new Date()
            const expiresAt = new Date(parsedSession.expires_at * 1000)
            
            if (expiresAt > now) {
              console.log('📱 Sesión válida encontrada en localStorage')
              setSession(parsedSession)
              setUser(parsedUser)
              setLoading(false)
              return
            } else {
              console.log('⏰ Sesión expirada, limpiando localStorage')
              localStorage.removeItem('supabase_session')
              localStorage.removeItem('user_data')
              userCache.clear()
            }
          } catch (error) {
            console.error('Error parsing saved session:', error)
            localStorage.removeItem('supabase_session')
            localStorage.removeItem('user_data')
          }
        }

        // Solo si no hay sesión guardada válida, consultar Supabase
        console.log('🔍 Verificando sesión en Supabase')
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession) {
          console.log('📱 Sesión activa encontrada en Supabase')
          setSession(currentSession)
          
          // Obtener datos del usuario de forma optimizada
          const userData = await fetchUserDataOptimized(
            currentSession.user.id, 
            currentSession.user.email!, 
            supabase
          )
          
          setUser(userData)
          localStorage.setItem('supabase_session', JSON.stringify(currentSession))
          localStorage.setItem('user_data', JSON.stringify(userData))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
        initializingRef.current = false
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', event)

      if (event === 'SIGNED_IN' && session) {
        const userData = await fetchUserDataOptimized(session.user.id, session.user.email!, supabase)
        setUser(userData)
        setSession(session)
        localStorage.setItem('supabase_session', JSON.stringify(session))
        localStorage.setItem('user_data', JSON.stringify(userData))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        userCache.clear()
        localStorage.removeItem('supabase_session')
        localStorage.removeItem('user_data')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    login,
    logout,
    refreshSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}