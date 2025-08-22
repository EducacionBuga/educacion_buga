"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { Session } from '@supabase/supabase-js'

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

// Normalizar roles
const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return 'USER'
  
  const upperRole = role.toUpperCase().trim()
  
  switch (upperRole) {
    case 'ADMIN':
    case 'ADMINISTRADOR':
      return 'ADMIN'
    case 'TALENTO_HUMANO':
    case 'TALENTO HUMANO':
    case 'RECURSOS_HUMANOS':
    case 'RECURSOS HUMANOS':
      return 'TALENTO_HUMANO'
    case 'CALIDAD_EDUCATIVA':
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  
  const supabase = createClientComponentClient()

  // Login simple y directo
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('🔑 Iniciando login para:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        console.error('❌ Error en login:', error.message)
        setLoading(false)
        return { success: false, error: error.message }
      }
      
      if (data.user && data.session) {
        console.log('✅ Login exitoso')
        
        // Intentar obtener datos del usuario con función RPC
        let userData: AuthUser
        
        try {
          console.log('🔍 Consultando rol con función RPC get_user_role')
          const { data: userProfile, error: profileError } = await supabase
            .rpc('get_user_role', { user_id: data.user.id })
            .single()
          
          if (userProfile && !profileError) {
            console.log('✅ Datos obtenidos de tabla profiles:', userProfile)
            userData = {
              id: data.user.id,
              email: userProfile.email || data.user.email!,
              name: userProfile.full_name || data.user.email!.split('@')[0],
              role: normalizeRole(userProfile.role || 'USER'),
              area_id: userProfile.area_id,
              dependencia: userProfile.dependencia
            }
          } else {
            console.warn('⚠️ RPC falló, usando user_metadata:', profileError?.message)
            userData = {
              id: data.user.id,
              email: data.user.email!,
              name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
              role: normalizeRole(data.user.user_metadata?.role || 'USER'),
              area_id: data.user.user_metadata?.area,
              dependencia: data.user.user_metadata?.dependencia
            }
          }
        } catch (rpcError: any) {
          console.warn('⚠️ Error en RPC, usando fallback:', rpcError.message)
          userData = {
            id: data.user.id,
            email: data.user.email!,
            name: data.user.user_metadata?.full_name || data.user.email!.split('@')[0],
            role: normalizeRole(data.user.user_metadata?.role || 'USER'),
            area_id: data.user.user_metadata?.area,
            dependencia: data.user.user_metadata?.dependencia
          }
        }
        
        console.log('👤 Usuario creado:', {
          email: userData.email,
          role: userData.role
        })
        
        setUser(userData)
        setSession(data.session)
        
        // Guardar en localStorage
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        setLoading(false)
        return { success: true }
      }
      
      setLoading(false)
      return { success: false, error: 'No se pudo obtener datos del usuario' }
      
    } catch (error: any) {
      console.error('❌ Error inesperado:', error)
      setLoading(false)
      return { success: false, error: 'Error inesperado al iniciar sesión' }
    }
  }, [supabase])

  // Logout
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      localStorage.removeItem('supabase_session')
      localStorage.removeItem('user_data')
      console.log('👋 Logout exitoso')
    } catch (error) {
      console.error('❌ Error en logout:', error)
    }
  }, [supabase])

  // Limpiar sesión
  const clearSession = useCallback(() => {
    setUser(null)
    setSession(null)
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('user_data')
    console.log('🧹 Sesión limpiada')
  }, [])

  // Refrescar sesión
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (data.session) {
        setSession(data.session)
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
      }
    } catch (error) {
      console.error('❌ Error refrescando sesión:', error)
    }
  }, [supabase])

  // Inicialización
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        console.log('🚀 Inicializando autenticación...')
        
        // Verificar localStorage primero
        const savedSession = localStorage.getItem('supabase_session')
        const savedUser = localStorage.getItem('user_data')
        
        if (savedSession && savedUser && mounted) {
          try {
            const parsedSession = JSON.parse(savedSession)
            const parsedUser = JSON.parse(savedUser)
            
            // Verificar si no ha expirado
            const now = new Date()
            const expiresAt = new Date(parsedSession.expires_at * 1000)
            
            if (expiresAt > now) {
              console.log('✅ Sesión válida en localStorage')
              setSession(parsedSession)
              setUser(parsedUser)
              if (mounted) setLoading(false)
              return
            } else {
              console.log('⚠️ Sesión expirada')
              clearSession()
            }
          } catch (error) {
            console.error('❌ Error parsing localStorage:', error)
            clearSession()
          }
        }

        // Consultar Supabase
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession && mounted) {
          console.log('✅ Sesión encontrada en Supabase')
          
          // Intentar obtener datos del usuario con función RPC
          let userData: AuthUser
          
          try {
            console.log('🔍 Restaurando sesión - consultando rol con RPC')
            const { data: userProfile, error: profileError } = await supabase
              .rpc('get_user_role', { user_id: currentSession.user.id })
              .single()
            
            if (userProfile && !profileError) {
              console.log('✅ Datos de sesión obtenidos de tabla profiles:', userProfile)
              userData = {
                id: currentSession.user.id,
                email: userProfile.email || currentSession.user.email!,
                name: userProfile.full_name || currentSession.user.email!.split('@')[0],
                role: normalizeRole(userProfile.role || 'USER'),
                area_id: userProfile.area_id,
                dependencia: userProfile.dependencia
              }
            } else {
              console.warn('⚠️ RPC falló en restauración, usando user_metadata:', profileError?.message)
              userData = {
                id: currentSession.user.id,
                email: currentSession.user.email!,
                name: currentSession.user.user_metadata?.full_name || currentSession.user.email!.split('@')[0],
                role: normalizeRole(currentSession.user.user_metadata?.role || 'USER'),
                area_id: currentSession.user.user_metadata?.area,
                dependencia: currentSession.user.user_metadata?.dependencia
              }
            }
          } catch (rpcError: any) {
            console.warn('⚠️ Error en RPC durante restauración:', rpcError.message)
            userData = {
              id: currentSession.user.id,
              email: currentSession.user.email!,
              name: currentSession.user.user_metadata?.full_name || currentSession.user.email!.split('@')[0],
              role: normalizeRole(currentSession.user.user_metadata?.role || 'USER'),
              area_id: currentSession.user.user_metadata?.area,
              dependencia: currentSession.user.user_metadata?.dependencia
            }
          }
          
          setUser(userData)
          setSession(currentSession)
          localStorage.setItem('supabase_session', JSON.stringify(currentSession))
          localStorage.setItem('user_data', JSON.stringify(userData))
        } else {
          console.log('ℹ️ No hay sesión activa')
        }
      } catch (error) {
        console.error('❌ Error inicializando:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔄 Auth state change:', event)

      if (event === 'SIGNED_IN' && session) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email!.split('@')[0],
          role: normalizeRole(session.user.user_metadata?.role || 'USER'),
          area_id: session.user.user_metadata?.area,
          dependencia: session.user.user_metadata?.dependencia
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

    // Escuchar cuando la página se vuelve visible (cambio de pestaña)
    const handleVisibilityChange = async () => {
      if (!document.hidden && mounted) {
        console.log('👁️ Página visible - verificando sesión y rol...')
        
        // Verificar sesión en Supabase primero
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          
          if (currentSession && (!user || !session)) {
            console.log('🔄 Sesión encontrada, consultando rol actualizado...')
            
            // Consultar rol actualizado con RPC
            try {
              const { data: userProfile, error: profileError } = await supabase
                .rpc('get_user_role', { user_id: currentSession.user.id })
                .single()
              
              let userData: AuthUser
              
              if (userProfile && !profileError) {
                console.log('✅ Rol actualizado obtenido de tabla profiles:', userProfile)
                userData = {
                  id: currentSession.user.id,
                  email: userProfile.email || currentSession.user.email!,
                  name: userProfile.full_name || currentSession.user.email!.split('@')[0],
                  role: normalizeRole(userProfile.role || 'USER'),
                  area_id: userProfile.area_id,
                  dependencia: userProfile.dependencia
                }
              } else {
                console.warn('⚠️ RPC falló en visibilidad, usando user_metadata:', profileError?.message)
                userData = {
                  id: currentSession.user.id,
                  email: currentSession.user.email!,
                  name: currentSession.user.user_metadata?.full_name || currentSession.user.email!.split('@')[0],
                  role: normalizeRole(currentSession.user.user_metadata?.role || 'USER'),
                  area_id: currentSession.user.user_metadata?.area,
                  dependencia: currentSession.user.user_metadata?.dependencia
                }
              }
              
              console.log('✅ Restaurando sesión con rol:', userData.role)
              setSession(currentSession)
              setUser(userData)
              localStorage.setItem('supabase_session', JSON.stringify(currentSession))
              localStorage.setItem('user_data', JSON.stringify(userData))
              
            } catch (rpcError: any) {
              console.warn('⚠️ Error en RPC durante visibilidad:', rpcError.message)
              // Fallback a localStorage si RPC falla
              const savedSession = localStorage.getItem('supabase_session')
              const savedUser = localStorage.getItem('user_data')
              
              if (savedSession && savedUser) {
                try {
                  const parsedSession = JSON.parse(savedSession)
                  const parsedUser = JSON.parse(savedUser)
                  
                  const now = new Date()
                  const expiresAt = new Date(parsedSession.expires_at * 1000)
                  
                  if (expiresAt > now) {
                    console.log('✅ Fallback: Restaurando desde localStorage')
                    setSession(parsedSession)
                    setUser(parsedUser)
                  } else {
                    console.log('⚠️ Sesión expirada, limpiando')
                    clearSession()
                  }
                } catch (error) {
                  console.error('❌ Error en fallback:', error)
                  clearSession()
                }
              }
            }
          } else if (!currentSession) {
            console.log('ℹ️ No hay sesión en Supabase, limpiando estado')
            clearSession()
          }
        } catch (error) {
          console.error('❌ Error verificando sesión en visibilidad:', error)
        }
      }
    }

    // Agregar listeners para visibilidad y focus
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
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
