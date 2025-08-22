"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn, User, Lock } from "lucide-react"
import { motion } from "framer-motion"

// Utilidad para detectar rate limiting
const isRateLimitError = (error: any): boolean => {
  if (!error || !error.message) return false
  const message = error.message.toLowerCase()
  return message.includes('rate limit') || 
         message.includes('too many requests') ||
         message.includes('too many') ||
         (error as any).status === 429
}

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [rateLimited, setRateLimited] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [backoffCountdown, setBackoffCountdown] = useState(0)
  const { login } = useAuth()
  const router = useRouter()

  // Effect para manejar el countdown del rate limit
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setRateLimited(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [countdown])

  // Effect para manejar el countdown del backoff de Supabase
  useEffect(() => {
    const checkBackoff = () => {
      const backoffUntil = localStorage.getItem('supabase_backoff_until')
      if (backoffUntil) {
        const now = Date.now()
        const remaining = parseInt(backoffUntil) - now
        if (remaining > 0) {
          setBackoffCountdown(Math.ceil(remaining / 1000))
        } else {
          setBackoffCountdown(0)
          localStorage.removeItem('supabase_backoff_until')
        }
      }
    }

    // Verificar inmediatamente
    checkBackoff()

    // Verificar cada segundo
    const interval = setInterval(checkBackoff, 1000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log("🔑 [STEP 1] Iniciando proceso de login...")
    console.log("📧 [STEP 2] Email ingresado:", username)
    console.log("🔐 [STEP 3] Password longitud:", password.length)
    console.log("🌐 [STEP 4] URL actual:", window.location.href)

    try {
      console.log("🚀 [STEP 5] Llamando función login del contexto...")
      const result = await login(username, password)
      
      console.log("📊 [STEP 6] Resultado del login:", result)

      if (result && result.success) {
        console.log("✅ [STEP 7] Login exitoso, redirigiendo al dashboard...")
        router.push("/dashboard")
      } else {
        console.log("❌ [STEP 7] Login falló, resultado:", result)
        setError(result?.error || "Error al iniciar sesión")
      }
    } catch (err) {
      console.error("❌ [ERROR] Error en el login:", err)
      console.error("🔍 [DEBUG] Tipo de error:", typeof err)
      console.error("🔍 [DEBUG] Error message:", err instanceof Error ? err.message : 'Error desconocido')
      
      // Simplificar el manejo de errores
      let errorMessage = "Credenciales inválidas. Por favor intente de nuevo."

      if (err instanceof Error) {
        const message = err.message.toLowerCase()
        console.log("🔍 [DEBUG] Mensaje en minúsculas:", message)

        if (message.includes("invalid login credentials") || message.includes("invalid credentials")) {
          errorMessage = "Credenciales inválidas. Verifique su correo y contraseña."
        } else if (message.includes("email not confirmed")) {
          errorMessage = "Debe confirmar su correo electrónico antes de iniciar sesión."
        } else if (isRateLimitError(err)) {
          errorMessage = "Demasiados intentos. Espere antes de intentar nuevamente."
          setRateLimited(true)
          setCountdown(30) // 30 segundos de espera
        } else if (message.includes("network")) {
          errorMessage = "Error de conexión. Verifique su conexión a internet."
        } else if (message.includes("user not found")) {
          errorMessage = "Usuario no encontrado. Verifique su correo electrónico."
        } else {
          errorMessage = `Error: ${err.message}`
        }
      }

      console.log("🚨 [ERROR] Mensaje mostrado al usuario:", errorMessage)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full shadow-lg border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">Ingrese sus credenciales para acceder al sistema</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
        
        {backoffCountdown > 0 && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Rate limit activo. Podrás intentar nuevamente en {backoffCountdown} segundos.
            </AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username">Correo electrónico</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="username"
                type="email"
                placeholder="Ingrese su correo electrónico"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="pl-10"
                autoComplete="email"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="Ingrese su contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                autoComplete="current-password"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-poppins"
            disabled={loading || rateLimited || backoffCountdown > 0}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2"></div>
                <span>Verificando credenciales...</span>
              </div>
            ) : rateLimited ? (
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span>Espere {countdown}s</span>
              </div>
            ) : (
              <div className="flex items-center">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Iniciar Sesión</span>
              </div>
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          ¿Olvidó su contraseña? Contacte al administrador del sistema
        </p>
      </CardFooter>
    </Card>
  )
}
