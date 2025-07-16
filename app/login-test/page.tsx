"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/auth-context'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, LogIn } from 'lucide-react'

export default function LoginTestPage() {
  const [email, setEmail] = useState('secretariaeducacionbuga@gmail.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Iniciando sesión...')
  
  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    setLoadingMessage('Conectando al servidor...')

    let loginResult = null

    try {
      console.log('🔐 Iniciando login con:', { email, password: '***' })
      
      // Actualizar mensaje de progreso
      setTimeout(() => setLoadingMessage('Verificando credenciales...'), 500)
      
      loginResult = await login(email, password)
      
      if (loginResult.success) {
        setLoadingMessage('¡Login exitoso! Redirigiendo...')
        console.log('✅ Login exitoso, redirigiendo...')
        
        // Pequeña pausa para mostrar mensaje de éxito
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000)
      } else {
        console.error('❌ Error en login:', loginResult.error)
        setError(loginResult.error || 'Error de autenticación')
      }
    } catch (error) {
      console.error('❌ Error inesperado:', error)
      setError('Error inesperado al iniciar sesión. Verifique su conexión.')
    } finally {
      setTimeout(() => {
        setIsLoading(false)
        setLoadingMessage('Iniciando sesión...')
      }, loginResult?.success ? 1000 : 0)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo y Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Sistema Educativo
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Secretaría de Educación - Guadalajara de Buga
          </p>
        </div>

        {/* Formulario de Login */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="usuario@ejemplo.com"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingMessage}
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Información de credenciales */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-sm font-medium text-blue-900 mb-2">
                Información de Acceso
              </h3>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Email:</strong> secretariaeducacionbuga@gmail.com</div>
                <div><strong>Nota:</strong> Ingrese su contraseña configurada</div>
                <div className="mt-2 text-green-700">
                  <strong>✓ Optimizado para producción</strong>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}