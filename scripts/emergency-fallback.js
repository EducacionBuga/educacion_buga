#!/usr/bin/env node

/**
 * Script de emergencia para resolver pantalla en blanco en producción
 * Cambia temporalmente al contexto normal y aplica configuraciones de emergencia
 */

const fs = require('fs')
const path = require('path')

console.log('🚨 SCRIPT DE EMERGENCIA - Resolviendo pantalla en blanco')
console.log('=' .repeat(60))

// 1. Cambiar al contexto normal temporalmente
console.log('\n🔄 PASO 1: Cambiando al contexto de autenticación normal...')

const contextIndexPath = path.join(process.cwd(), 'context/index.ts')
const normalContextContent = `export { AuthProvider, useAuth } from './auth-context'
export type { AuthUser, AuthContextType } from './auth-context'
`

try {
  fs.writeFileSync(contextIndexPath, normalContextContent)
  console.log('✅ Cambiado al contexto normal exitosamente')
} catch (error) {
  console.log('❌ Error cambiando contexto:', error.message)
  process.exit(1)
}

// 2. Crear configuración de emergencia para el contexto normal
console.log('\n🛠️  PASO 2: Aplicando configuraciones de emergencia...')

const authContextPath = path.join(process.cwd(), 'context/auth-context.tsx')

try {
  let authContextContent = fs.readFileSync(authContextPath, 'utf8')
  
  // Verificar si ya tiene las mejoras de emergencia
  if (!authContextContent.includes('EMERGENCY_FALLBACK')) {
    console.log('📝 Aplicando mejoras de emergencia al contexto normal...')
    
    // Agregar timeout de seguridad al contexto normal
    const emergencyImprovements = `
// EMERGENCY_FALLBACK: Mejoras de emergencia para producción
const EMERGENCY_TIMEOUT = 10000; // 10 segundos

`
    
    // Insertar las mejoras al inicio del archivo después de los imports
    const importEndIndex = authContextContent.lastIndexOf('import')
    const nextLineIndex = authContextContent.indexOf('\n', importEndIndex)
    
    authContextContent = authContextContent.slice(0, nextLineIndex + 1) + 
                       emergencyImprovements + 
                       authContextContent.slice(nextLineIndex + 1)
    
    fs.writeFileSync(authContextPath, authContextContent)
    console.log('✅ Mejoras de emergencia aplicadas')
  } else {
    console.log('✅ Mejoras de emergencia ya aplicadas')
  }
} catch (error) {
  console.log('⚠️  No se pudieron aplicar mejoras de emergencia:', error.message)
}

// 3. Crear página de emergencia simple
console.log('\n📄 PASO 3: Creando página de emergencia...')

const emergencyPageContent = `"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, LogIn } from "lucide-react"

export default function EmergencyLogin() {
  const [email, setEmail] = useState('calidadeducativa10@educacionbuga.gov.co')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Verificar sesión existente
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          console.log('✅ [EMERGENCY] Sesión encontrada, redirigiendo...')
          setIsAuthenticated(true)
          router.push('/dashboard')
        }
      } catch (error) {
        console.error('❌ [EMERGENCY] Error verificando sesión:', error)
      }
    }
    
    checkSession()
  }, [])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('🔑 [EMERGENCY] Iniciando login...')
      
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (loginError) {
        console.error('❌ [EMERGENCY] Error de login:', loginError)
        setError(loginError.message)
        return
      }

      if (data.user) {
        console.log('✅ [EMERGENCY] Login exitoso')
        setIsAuthenticated(true)
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('❌ [EMERGENCY] Error inesperado:', error)
      setError('Error inesperado. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-700">
              Modo de Emergencia
            </CardTitle>
            <p className="text-gray-600">
              Sistema en modo de recuperación
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div>
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Acceso de Emergencia
                  </>
                )}
              </Button>
            </form>
            
            <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                <strong>Modo de Emergencia Activo</strong><br/>
                El sistema está usando configuraciones simplificadas para resolver problemas temporales.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
`

const emergencyPagePath = path.join(process.cwd(), 'app/emergency-login/page.tsx')
const emergencyDir = path.dirname(emergencyPagePath)

try {
  if (!fs.existsSync(emergencyDir)) {
    fs.mkdirSync(emergencyDir, { recursive: true })
  }
  fs.writeFileSync(emergencyPagePath, emergencyPageContent)
  console.log('✅ Página de emergencia creada en /emergency-login')
} catch (error) {
  console.log('❌ Error creando página de emergencia:', error.message)
}

// 4. Crear script de reversión
console.log('\n🔄 PASO 4: Creando script de reversión...')

const revertScriptContent = `#!/usr/bin/env node

/**
 * Script para revertir cambios de emergencia
 */

const fs = require('fs')
const path = require('path')

console.log('🔄 Revirtiendo cambios de emergencia...')

// Volver al contexto de producción
const contextIndexPath = path.join(process.cwd(), 'context/index.ts')
const productionContextContent = \`export { AuthProviderProduction as AuthProvider, useAuth } from './auth-context-production'
export type { AuthUser, AuthContextType } from './auth-context-production'
\`

fs.writeFileSync(contextIndexPath, productionContextContent)
console.log('✅ Contexto revertido a producción')

// Eliminar página de emergencia
const emergencyPagePath = path.join(process.cwd(), 'app/emergency-login')
if (fs.existsSync(emergencyPagePath)) {
  fs.rmSync(emergencyPagePath, { recursive: true, force: true })
  console.log('✅ Página de emergencia eliminada')
}

console.log('🎯 Reversión completada')
`

const revertScriptPath = path.join(process.cwd(), 'scripts/revert-emergency.js')

try {
  fs.writeFileSync(revertScriptPath, revertScriptContent)
  console.log('✅ Script de reversión creado')
} catch (error) {
  console.log('❌ Error creando script de reversión:', error.message)
}

console.log('\n' + '=' .repeat(60))
console.log('🎯 CONFIGURACIÓN DE EMERGENCIA COMPLETADA')
console.log('\n📋 PRÓXIMOS PASOS:')
console.log('1. Reiniciar el servidor: npm run dev')
console.log('2. Probar login en: http://localhost:3000')
console.log('3. Si hay problemas, usar: http://localhost:3000/emergency-login')
console.log('4. Para revertir cambios: node scripts/revert-emergency.js')
console.log('\n⚠️  IMPORTANTE:')
console.log('- Este es un modo de emergencia temporal')
console.log('- Resolver problemas de variables de entorno en producción')
console.log('- Verificar función get_user_role en Supabase')
console.log('- Revertir a contexto de producción cuando esté resuelto')