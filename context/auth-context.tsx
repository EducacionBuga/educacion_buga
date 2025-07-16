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
  
  // Cliente optimizado para autenticación
  const supabase = createClientComponentClient()

  // Función de login optimizada con timeout
  const login = useCallback(async (email: string, password: string) => {
    setLoading(true)
    
    try {
      console.log('🔑 Intentando login con:', email)
      
      // Crear una promesa con timeout de 10 segundos
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password
      })

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Login timeout - servidor demorado')), 10000)
      )

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]) as any

      if (error) {
        console.error('❌ Error en login:', error.message)
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        console.log('✅ Login exitoso')
        
        // Crear usuario básico sin consulta adicional a BD
        const userData: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: data.user.email!.split('@')[0],
          role: 'ADMIN' // Role por defecto
        }
        
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
      const errorMessage = error.message === 'Login timeout - servidor demorado' 
        ? 'El servidor está tardando demasiado. Intenta de nuevo.'
        : 'Error inesperado al iniciar sesión'
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

  // Efecto optimizado para inicializar la autenticación - sin consultas extras
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        // Primero intentar cargar desde localStorage (más rápido)
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
              setSession(parsedSession)
              setUser(parsedUser)
              setLoading(false)
              return // Salir temprano si encontramos sesión válida
            } else {
              clearSession()
            }
          } catch (error) {
            console.error('Error parsing saved session:', error)
            clearSession()
          }
        }

        // Solo si no hay sesión guardada, consultar Supabase
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession && mounted) {
          console.log('📱 Sesión encontrada en Supabase')
          setSession(currentSession)
          
          // Crear usuario básico sin consulta adicional
          const userData: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: currentSession.user.email!.split('@')[0],
            role: 'ADMIN'
          }
          
          setUser(userData)
          localStorage.setItem('supabase_session', JSON.stringify(currentSession))
          localStorage.setItem('user_data', JSON.stringify(userData))
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

    // Escuchar cambios de autenticación (simplificado)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      console.log('🔄 Auth state change:', event)

      if (event === 'SIGNED_IN' && session) {
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.email!.split('@')[0],
          role: 'ADMIN'
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
