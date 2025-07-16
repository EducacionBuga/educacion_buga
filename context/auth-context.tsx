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

// Función para normalizar roles
const normalizeRole = (role: string | undefined | null): string => {
  if (!role) return 'ADMIN'
  
  const normalizedRole = role.toUpperCase().trim()
  
  const roleMapping: { [key: string]: string } = {
    'ADMIN': 'ADMIN',
    'ADMINISTRATOR': 'ADMIN',
    'ADMINISTRADOR': 'ADMIN',
    'DESPACHO': 'DESPACHO',
    'PLANEACION': 'PLANEACION',
    'SUPERVISOR': 'SUPERVISOR',
    'USER': 'USER',
    'USUARIO': 'USER'
  }
  
  return roleMapping[normalizedRole] || 'ADMIN'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  // Función simplificada para obtener datos del usuario
  const fetchUserData = useCallback(async (userId: string, email: string): Promise<AuthUser> => {
    try {
      // Intentar obtener datos del usuario de la tabla usuarios
      const { data: userData } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (userData) {
        return {
          id: userId,
          email: email,
          name: userData.name || userData.full_name || email.split('@')[0],
          role: normalizeRole(userData.role || userData.tipo_usuario),
          area_id: userData.area_id,
          dependencia: userData.dependencia,
          created_at: userData.created_at,
          avatar_url: userData.avatar_url
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    }

    // Si no se encuentra, crear usuario básico
    return {
      id: userId,
      email: email,
      name: email.split('@')[0],
      role: 'ADMIN'
    }
  }, [supabase])

  // Función de login simplificada
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('🔑 Intentando login con:', email)
      
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
        
        // Obtener datos del usuario
        const userData = await fetchUserData(data.user.id, data.user.email!)
        
        setUser(userData)
        setSession(data.session)
        
        // Guardar en localStorage para persistencia
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
        localStorage.setItem('user_data', JSON.stringify(userData))
        
        return { success: true }
      }

      return { success: false, error: 'No se pudo iniciar sesión' }
    } catch (error) {
      console.error('❌ Error inesperado en login:', error)
      return { success: false, error: 'Error inesperado al iniciar sesión' }
    } finally {
      setLoading(false)
    }
  }, [supabase, fetchUserData])

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
      
      router.push('/login-test')
    } catch (error) {
      console.error('Error en logout:', error)
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
      console.error('Error refreshing session:', error)
    }
  }, [supabase])

  // Efecto para inicializar la autenticación
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Intentar obtener sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession && mounted) {
          console.log('📱 Sesión encontrada')
          setSession(currentSession)
          
          // Obtener datos del usuario
          const userData = await fetchUserData(currentSession.user.id, currentSession.user.email!)
          
          if (mounted) {
            setUser(userData)
            localStorage.setItem('supabase_session', JSON.stringify(currentSession))
            localStorage.setItem('user_data', JSON.stringify(userData))
          }
        } else if (mounted) {
          // Intentar cargar desde localStorage
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
                setSession(parsedSession)
                setUser(parsedUser)
              } else {
                clearSession()
              }
            } catch (error) {
              console.error('Error parsing saved session:', error)
              clearSession()
            }
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
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

      console.log('🔄 Auth state change:', event)

      if (event === 'SIGNED_IN' && session) {
        const userData = await fetchUserData(session.user.id, session.user.email!)
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
  }, [supabase, fetchUserData, clearSession])

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
