"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

// Tipos
interface User {
  id: string
  name: string
  role: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

// Crear contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Proveedor de autenticación
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setLoading(false)
  }, [])

  // Modificar la función de login para incluir cuentas específicas por área con restricciones de acceso

  // Función de login (simulada)
  const login = async (username: string, password: string) => {
    // Simulación de API
    return new Promise<void>((resolve, reject) => {
      setTimeout(() => {
        // Credenciales actualizadas con mayor seguridad
        if (username === "admin_buga" && password === "P@$$w0rd_Adm1n2024!") {
          const userData = {
            id: "1",
            name: "Administrador",
            role: "ADMIN",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "calidad_buga" && password === "C4l1d@d_Educ#2024") {
          const userData = {
            id: "2",
            name: "Usuario Calidad Educativa",
            role: "CALIDAD_EDUCATIVA",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "inspeccion_buga" && password === "1nsp3cc!0n_V1g#2024") {
          const userData = {
            id: "3",
            name: "Usuario Inspección y Vigilancia",
            role: "INSPECCION_VIGILANCIA",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "cobertura_buga" && password === "C0b3rtur@_1nfr4#2024") {
          const userData = {
            id: "4",
            name: "Usuario Cobertura e Infraestructura",
            role: "COBERTURA_INFRAESTRUCTURA",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "talento_buga" && password === "T@l3nt0_Hum@n0#2024") {
          const userData = {
            id: "5",
            name: "Usuario Talento Humano",
            role: "TALENTO_HUMANO",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "planeacion" && password === "planeacion") {
          const userData = {
            id: "6",
            name: "Usuario Planeación",
            role: "PLANEACION",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else if (username === "despacho" && password === "despacho") {
          const userData = {
            id: "7",
            name: "Usuario Despacho",
            role: "DESPACHO",
          }
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
          resolve()
        } else {
          reject(new Error("Credenciales inválidas"))
        }
      }, 1000)
    })
  }

  // Función de logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
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
