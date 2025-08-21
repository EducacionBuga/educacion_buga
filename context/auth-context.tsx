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

// Función para mapear roles de BD a roles del sistema
const mapDatabaseRoleToSystemRole = (dbRole: string, email: string): string => {
  // Usar directamente el rol de la base de datos si ya está en formato correcto
  const upperRole = dbRole?.toUpperCase()
  
  // Mapeo directo de roles de BD
  const roleMapping: Record<string, string> = {
    'ADMIN': 'ADMIN',
    'ADMINISTRATOR': 'ADMIN',
    'INSPECCION_VIGILANCIA': 'INSPECCION_VIGILANCIA',
    'COBERTURA_INFRAESTRUCTURA': 'COBERTURA_INFRAESTRUCTURA', 
    'TALENTO_HUMANO': 'TALENTO_HUMANO',
    'CALIDAD_EDUCATIVA': 'CALIDAD_EDUCATIVA',
    'DESPACHO': 'DESPACHO',
    'PLANEACION': 'PLANEACION',
    'USER': 'USER'
  }
  
  // Si el rol existe en el mapeo, usarlo directamente
  if (roleMapping[upperRole]) {
    return roleMapping[upperRole]
  }
  
  // Mapeo para roles en minúsculas de la BD
  if (dbRole === 'admin' || dbRole === 'administrator') {
    return 'ADMIN'
  }
  
  // Para user genérico, determinar por email según dependencia
  if (dbRole === 'user') {
    if (email?.includes('talentohumano')) return 'TALENTO_HUMANO'
    if (email?.includes('cobertura')) return 'COBERTURA_INFRAESTRUCTURA'
    if (email?.includes('inspeccion')) return 'INSPECCION_VIGILANCIA'
    if (email?.includes('calidad')) return 'CALIDAD_EDUCATIVA'
  }
  
  return 'USER'
}

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
    'USUARIO': 'USER',
    'CALIDAD_EDUCATIVA': 'CALIDAD_EDUCATIVA',
    'INSPECCION_VIGILANCIA': 'INSPECCION_VIGILANCIA',
    'COBERTURA_INFRAESTRUCTURA': 'COBERTURA_INFRAESTRUCTURA',
    'TALENTO_HUMANO': 'TALENTO_HUMANO'
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
    
    // Limpiar datos anteriores para forzar nueva consulta
    localStorage.removeItem('supabase_session')
    localStorage.removeItem('user_data')
    setUser(null)
    setSession(null)
    
    try {
      console.log('🔑 Intentando login con:', email)
      console.log('🧹 localStorage limpiado para nueva consulta')
      
      // Intentar login con reintentos automáticos
      let attempts = 0
      const maxAttempts = 2
      let data: any, error: any
      
      while (attempts < maxAttempts) {
        attempts++
        console.log(`🔄 Intento ${attempts}/${maxAttempts} de login`)
        
        try {
          // Crear una promesa con timeout de 30 segundos (más tiempo para servidor lento)
          const loginPromise = supabase.auth.signInWithPassword({
            email,
            password
          })

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Login timeout - servidor demorado')), 30000)
          )
          
          console.log('⏱️ Timeout configurado a 30 segundos para servidor lento')
          
          const result = await Promise.race([loginPromise, timeoutPromise]) as any
           data = result.data
           error = result.error
           
           // Si llegamos aquí, el intento fue exitoso o tuvo un error específico
           if (error) {
             console.error('❌ Error en login:', error.message)
             return { success: false, error: error.message }
           }
           
           // Login exitoso, procesar datos
           if (data && data.user && data.session) {
             console.log('✅ Login exitoso en intento', attempts)
             break // Salir del bucle de reintentos
           }
           
           // Si no hay datos válidos, continuar con el siguiente intento
           if (attempts < maxAttempts) {
             console.log('⚠️ No se obtuvieron datos válidos, reintentando...')
             continue
           }
          
        } catch (attemptError: any) {
          console.warn(`⚠️ Intento ${attempts} falló:`, attemptError.message)
          
          // Si es el último intento o no es un error de timeout, lanzar el error
          if (attempts >= maxAttempts || !attemptError.message.includes('timeout')) {
            throw attemptError
          }
          
          // Esperar un poco antes del siguiente intento
          if (attempts < maxAttempts) {
            console.log('⏳ Esperando 2 segundos antes del siguiente intento...')
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }
      }

      if (error) {
        console.error('❌ Error en login:', error.message)
        return { success: false, error: error.message }
      }

      if (data.user && data.session) {
        console.log('✅ Login exitoso')
        
        // Usar función de BD para obtener datos del usuario (lógica centralizada)
        console.log('🔍 Consultando usuario con función BD get_user_role:', {
          userId: data.user.id,
          email: data.user.email
        })
        
        const { data: userProfile, error: profileError } = await supabase
          .rpc('get_user_role', { user_id: data.user.id })
          .single()
        
        console.log('📋 Resultado consulta profiles:', {
          userProfile,
          profileError: profileError?.message,
          hasProfile: !!userProfile
        })
        
        let userRole = 'USER'
        let userName = data.user.email!.split('@')[0]
        
        if (userProfile && !profileError) {
          // Usar directamente los datos de la función BD (ya normalizados)
          userRole = userProfile.role || 'USER'  // La función BD ya maneja la lógica
          userName = userProfile.full_name || userName
          
          console.log('✅ Usuario desde función BD get_user_role:', {
            email: data.user.email,
            role: userRole,
            is_admin: userProfile.is_admin,
            full_name: userProfile.full_name,
            source: 'BD_FUNCTION'
          })
        } else {
          // Fallback a user_metadata si no existe en tabla usuarios
          userRole = data.user.user_metadata?.role || data.user.app_metadata?.role || 'USER'
          userName = data.user.user_metadata?.full_name || userName
          userArea = data.user.user_metadata?.area
          userDependencia = data.user.user_metadata?.area
          
          console.log('❌ Usuario NO encontrado en profiles:', {
            email: data.user.email,
            userId: data.user.id,
            error: profileError?.message,
            fallbackRole: userRole,
            userMetadata: data.user.user_metadata
          })
        }
        
        const normalizedRole = normalizeRole(userRole)
        
        // Crear usuario con rol correcto (desde función BD)
        const userData: AuthUser = {
          id: data.user.id,
          email: data.user.email!,
          name: userName,
          role: normalizedRole
        }
        
        console.log('👤 Usuario logueado con función BD:', {
          email: userData.email,
          role: userData.role,
          normalizedRole: normalizedRole,
          originalRole: userRole,
          fromBDFunction: !!userProfile,
          profileError: profileError?.message
        })
        
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
      
      if (error.message === 'Login timeout - servidor demorado') {
        errorMessage = '⏱️ El servidor está tardando más de lo normal. Verifica tu conexión e intenta nuevamente.'
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        errorMessage = '🌐 Problema de conexión. Verifica tu internet e intenta nuevamente.'
      } else if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '🔐 Email o contraseña incorrectos. Verifica tus credenciales.'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '📧 Debes confirmar tu email antes de iniciar sesión.'
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = '⚠️ Demasiados intentos. Espera unos minutos antes de intentar nuevamente.'
      }
      
      console.log('📝 Mensaje de error para usuario:', errorMessage)
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
          
          // Consultar datos del usuario desde la tabla profiles
          const { data: userProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentSession.user.id)
            .single()
          
          let userRole = 'USER'
          let userName = currentSession.user.email!.split('@')[0]
          let userArea = null
          let userDependencia = null
          
          if (userProfile && !profileError) {
              // Mapear rol de BD a rol del sistema
              const dbRole = userProfile.role || 'user'
              userRole = mapDatabaseRoleToSystemRole(dbRole, currentSession.user.email!)
              userName = userProfile.full_name || userName
              userArea = userProfile.area || null
              userDependencia = userProfile.dependencia || null
            } else {
            // Fallback a user_metadata si no existe en tabla usuarios
            userRole = currentSession.user.user_metadata?.role || currentSession.user.app_metadata?.role || 'USER'
            userName = currentSession.user.user_metadata?.full_name || userName
            userArea = currentSession.user.user_metadata?.area
            userDependencia = currentSession.user.user_metadata?.area
          }
          
          const normalizedRole = normalizeRole(userRole)
          
          // Crear usuario con rol correcto
          const userData: AuthUser = {
            id: currentSession.user.id,
            email: currentSession.user.email!,
            name: userName,
            role: normalizedRole,
            area_id: userArea,
            dependencia: userDependencia
          }
          
          console.log('🔄 Sesión restaurada:', {
            email: userData.email,
            role: userData.role,
            area: userData.area_id,
            fromDatabase: !!userProfile
          })
          
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
        // Consultar datos del usuario desde la tabla profiles
         const { data: userProfile, error: profileError } = await supabase
           .from('profiles')
           .select('*')
           .eq('id', session.user.id)
           .single()
        
        let userRole = 'USER'
        let userName = session.user.email!.split('@')[0]
        let userArea = null
        let userDependencia = null
        
        if (userProfile && !profileError) {
             // Mapear rol de BD a rol del sistema
             const dbRole = userProfile.role || 'user'
             userRole = mapDatabaseRoleToSystemRole(dbRole, session.user.email!)
             userName = userProfile.full_name || userName
             userArea = userProfile.area || null
             userDependencia = userProfile.dependencia || null
           } else {
           // Fallback a user_metadata si no existe en tabla usuarios
           userRole = session.user.user_metadata?.role || session.user.app_metadata?.role || 'USER'
           userName = session.user.user_metadata?.full_name || userName
           userArea = session.user.user_metadata?.area
           userDependencia = session.user.user_metadata?.area
         }
        
        const normalizedRole = normalizeRole(userRole)
        
        const userData: AuthUser = {
          id: session.user.id,
          email: session.user.email!,
          name: userName,
          role: normalizedRole,
          area_id: userArea,
          dependencia: userDependencia
        }
        
        console.log('🔄 Estado de auth cambiado:', {
          event,
          email: userData.email,
          role: userData.role,
          area: userData.area_id,
          fromDatabase: !!userProfile
        })
        
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
