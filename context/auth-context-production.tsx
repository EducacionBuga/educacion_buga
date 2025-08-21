"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'
import { createSupabaseClientForProduction, productionSafeLogin, checkGetUserRoleFunction } from '@/lib/supabase-client-production'

export interface AuthUser {
  id: string
  email: string
  name?: string
  role?: string
  area_id?: string
  dependencia?: string
  created_at?: string
  avatar_url?: string
}

export interface AuthContextType {
  user: AuthUser | null
  session: Session | null
  isAuthenticated: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  clearSession: () => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Función para normalizar roles
const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return 'USER'
  
  const roleUpper = role.toUpperCase().trim()
  
  switch (roleUpper) {
    case 'ADMIN':
    case 'ADMINISTRATOR':
    case 'SUPER_ADMIN':
      return 'ADMIN'
    case 'TALENTO_HUMANO':
    case 'TALENTO HUMANO':
    case 'RECURSOS_HUMANOS':
      return 'TALENTO_HUMANO'
    case 'CALIDAD_EDUCATIVA':
    case 'CALIDAD EDUCATIVA':
    case 'CALIDAD':
      return 'CALIDAD_EDUCATIVA'
    case 'COBERTURA_INFRAESTRUCTURA':
    case 'COBERTURA E INFRAESTRUCTURA':
    case 'COBERTURA':
      return 'COBERTURA_INFRAESTRUCTURA'
    case 'INSPECCION_VIGILANCIA':
    case 'INSPECCIÓN Y VIGILANCIA':
    case 'INSPECCION':
      return 'INSPECCION_VIGILANCIA'
    case 'PLANEACION':
    case 'PLANEACIÓN':
      return 'PLANEACION'
    case 'DESPACHO':
      return 'DESPACHO'
    default:
      return 'USER'
  }
}

export function AuthProviderProduction({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  // Cliente optimizado para producción
  const supabase = createSupabaseClientForProduction()

  // Función de login optimizada para producción
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    // Limpiar datos anteriores
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('user_data')
    setUser(null)
    setSession(null)
    
    try {
      console.log('🔑 [PROD] Iniciando login para:', email)
      
      // Usar función de login optimizada para producción
      const result = await productionSafeLogin(supabase, email, password)
      
      if (!result.success) {
        console.error('❌ [PROD] Login falló:', result.error)
        return { success: false, error: result.error }
      }
      
      const { data } = result
      
      if (!data?.user || !data?.session) {
        console.error('❌ [PROD] Datos de login inválidos')
        return { success: false, error: 'Datos de login inválidos' }
      }
      
      console.log('✅ [PROD] Login exitoso')
      
      // Procesar datos del usuario
      let userRole = 'USER'
      let userName = data.user.email!.split('@')[0]
      let userArea = null
      let userDependencia = null
      
      if (data.userProfile) {
        // Usar datos de la función RPC
        userRole = data.userProfile.role || 'USER'
        userName = data.userProfile.full_name || userName
        userArea = data.userProfile.area_id
        userDependencia = data.userProfile.dependencia
        
        console.log('✅ [PROD] Datos obtenidos de función RPC:', {
          email: data.user.email,
          role: userRole,
          full_name: data.userProfile.full_name,
          source: 'RPC_FUNCTION'
        })
      } else {
        // Fallback a user_metadata
        userRole = data.user.user_metadata?.role || data.user.app_metadata?.role || 'USER'
        userName = data.user.user_metadata?.full_name || userName
        userArea = data.user.user_metadata?.area
        userDependencia = data.user.user_metadata?.area
        
        console.log('⚠️ [PROD] Usando fallback a user_metadata:', {
          email: data.user.email,
          fallbackRole: userRole,
          userMetadata: data.user.user_metadata
        })
      }
      
      const normalizedRole = normalizeRole(userRole)
      
      // Crear usuario
      const userData: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        name: userName,
        role: normalizedRole,
        area_id: userArea,
        dependencia: userDependencia
      }
      
      console.log('👤 [PROD] Usuario creado:', {
        email: userData.email,
        role: userData.role,
        normalizedRole: normalizedRole,
        originalRole: userRole
      })
      
      setUser(userData)
      setSession(data.session)
      
      // Guardar en localStorage
      localStorage.setItem('supabase_session', JSON.stringify(data.session))
      localStorage.setItem('user_data', JSON.stringify(userData))
      
      return { success: true }
      
    } catch (error: any) {
      console.error('❌ [PROD] Error inesperado en login:', error)
      
      let errorMessage = 'Error inesperado en producción'
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'El servidor está tardando más de lo normal. Intenta nuevamente.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = 'Error de conexión. Verifica tu internet.'
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos.'
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
      
      // Limpiar localStorage
      localStorage.removeItem('supabase_session')
      localStorage.removeItem('user_data')
      
      router.push('/')
    } catch (error) {
      console.error('❌ [PROD] Error en logout:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase, router])

  // Función para limpiar sesión
  const clearSession = useCallback(() => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('user_data')
  }, [])

  // Función para refrescar sesión
  const refreshSession = useCallback(async () => {
    try {
      const { data } = await supabase.auth.refreshSession()
      if (data.session) {
        setSession(data.session)
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
      }
    } catch (error) {
      console.error('❌ [PROD] Error refreshing session:', error)
    }
  }, [supabase])

  // Efecto para inicializar la autenticación
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🚀 [PROD] Inicializando autenticación...')
        
        // Verificar función RPC solo una vez al inicializar
        try {
          const rpcExists = await checkGetUserRoleFunction(supabase)
          if (!rpcExists) {
            console.warn('⚠️ [PROD] Función get_user_role no disponible, usando fallback para toda la sesión')
          }
        } catch (error: any) {
          console.warn('⚠️ [PROD] No se pudo verificar función RPC, continuando con fallback:', error.message)
        }
        
        // Intentar cargar desde localStorage primero
        const savedSession = localStorage.getItem('supabase_session')
        const savedUser = localStorage.getItem('user_data')
        
        if (savedSession && savedUser && mounted) {
          try {
            const parsedSession = JSON.parse(savedSession)
            const parsedUser = JSON.parse(savedUser)
            
            // Verificar si la sesión no ha expirado
            const now = new Date()
            const expiresAt = new Date(parsedSession.expires_at * 1000)
            
            if (expiresAt > now) {
              console.log('✅ [PROD] Sesión válida encontrada en localStorage')
              setSession(parsedSession)
              setUser(parsedUser)
              setLoading(false)
              return
            } else {
              console.log('⚠️ [PROD] Sesión expirada, limpiando...')
              clearSession()
            }
          } catch (error) {
            console.error('❌ [PROD] Error parsing saved session:', error)
            clearSession()
          }
        }

        // Si no hay sesión guardada válida, consultar Supabase
        console.log('🔍 [PROD] Consultando sesión en Supabase...')
        
        const sessionPromise = supabase.auth.getSession()
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Session check timeout')), 45000) // Aumentado a 45 segundos
        })
        
        let currentSession = null
        try {
          const { data: { session } } = await Promise.race([
            sessionPromise,
            timeoutPromise
          ]) as any
          currentSession = session
        } catch (error: any) {
          console.warn('⚠️ [PROD] Session check failed, continuando sin sesión:', error.message)
          // Continuar sin sesión en lugar de fallar
        }
        
        if (currentSession && mounted) {
          console.log('📱 [PROD] Sesión encontrada en Supabase')
          setSession(currentSession)
          
          // Crear usuario básico (sin RPC para evitar problemas)
          const userData: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.email!.split('@')[0],
            role: normalizeRole(currentSession.user.user_metadata?.role || 'USER')
          }
          
          setUser(userData)
          localStorage.setItem('supabase_session', JSON.stringify(currentSession))
          localStorage.setItem('user_data', JSON.stringify(userData))
        }
      } catch (error) {
        console.error('❌ [PROD] Error initializing auth:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔄 [PROD] Auth state change:', event)

      if (event === 'SIGNED_IN' && session) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split('@')[0],
          role: normalizeRole(session.user.user_metadata?.role || 'USER')
        }
        
        setUser(userData)
        setSession(session)
        localStorage.setItem('supabase_session', JSON.stringify(session))
        localStorage.setItem('user_data', JSON.stringify(userData))
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
        localStorage.removeItem('supabase_session')
        localStorage.removeItem('user_data')
      }
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [supabase, clearSession])

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    loading,
    login,
    logout,
    clearSession,
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