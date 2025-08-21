'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, UserPlus, CheckCircle, XCircle, Shield } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface UserData {
  email: string
  password: string
  fullName: string
  role: string
  area: string
}

const AREAS_CONFIG = {
  'CALIDAD_EDUCATIVA': 'Calidad Educativa',
  'INSPECCION_VIGILANCIA': 'Inspección y Vigilancia',
  'COBERTURA_INFRAESTRUCTURA': 'Cobertura e Infraestructura',
  'TALENTO_HUMANO': 'Talento Humano',
  'PLANEACION': 'Planeación',
  'DESPACHO': 'Despacho'
}

const PREDEFINED_USERS = [
  {
    email: 'calidadeducativa@educacionbuga.gov.co',
    password: 'calidad2025',
    fullName: 'Usuario Calidad Educativa',
    role: 'CALIDAD_EDUCATIVA',
    area: 'Calidad Educativa'
  },
  {
    email: 'inspeccionvigilancia3@educacionbuga.gov.co',
    password: 'inspeccion2025',
    fullName: 'Usuario Inspección y Vigilancia',
    role: 'INSPECCION_VIGILANCIA',
    area: 'Inspección y Vigilancia'
  },
  {
    email: 'coberturainfraestructura2@educacionbuga.gov.co',
    password: 'cobertura2025',
    fullName: 'Usuario Cobertura e Infraestructura',
    role: 'COBERTURA_INFRAESTRUCTURA',
    area: 'Cobertura e Infraestructura'
  },
  {
    email: 'talentohumano2@educacionbuga.gov.co',
    password: 'talento2025',
    fullName: 'Usuario Talento Humano',
    role: 'TALENTO_HUMANO',
    area: 'Talento Humano'
  }
]

export default function RegistrosPage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [createdUsers, setCreatedUsers] = useState<string[]>([])
  const supabase = createClientComponentClient()

  const [userData, setUserData] = useState<UserData>({
    email: '',
    password: '',
    fullName: '',
    role: '',
    area: ''
  })

  // Verificar acceso de administrador
  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.push('/')
      return
    }

    // Verificar si es administrador
    if (user && !loading) {
      const userEmail = user.email?.toLowerCase()
      const isAdmin = userEmail === 'secretariaeducacionbuga@gmail.com' || 
                     userEmail?.includes('admin') ||
                     user.role === 'admin'
      
      if (!isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, isAuthenticated, loading, router])

  const createUser = async (userData: UserData) => {
    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Error al crear usuario' }
      }

      return { success: true, user: result.user }
    } catch (error: any) {
      console.error('Error creating user:', error)
      return { success: false, error: error.message || 'Error inesperado' }
    }
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    setMessage(null)

    const result = await createUser(userData)
    
    if (result.success) {
      setMessage({ type: 'success', text: `Usuario ${userData.email} creado exitosamente` })
      setCreatedUsers(prev => [...prev, userData.email])
      setUserData({ email: '', password: '', fullName: '', role: '', area: '' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Error al crear usuario' })
    }
    
    setIsCreating(false)
  }

  const handleCreatePredefinedUsers = async () => {
    setIsCreating(true)
    setMessage(null)
    const results = []

    for (const user of PREDEFINED_USERS) {
      const result = await createUser(user)
      results.push({ email: user.email, success: result.success, error: result.error })
      
      if (result.success) {
        setCreatedUsers(prev => [...prev, user.email])
      }
      
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const successful = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length
    
    setMessage({ 
      type: successful > 0 ? 'success' : 'error', 
      text: `Creados: ${successful}, Fallidos: ${failed}` 
    })
    
    setIsCreating(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Registro de Usuarios
        </h1>
        <p className="text-gray-600 mt-2">
          Panel administrativo para crear usuarios del sistema
        </p>
        <div className="mt-2 text-sm text-blue-600">
          Administrador: <strong>{user.email}</strong>
        </div>
      </div>

      {message && (
        <Alert className={`mb-6 ${message.type === 'success' ? 'border-green-500' : 'border-red-500'}`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 text-red-500" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario de creación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Crear Usuario
            </CardTitle>
            <CardDescription>
              Registrar nuevo usuario en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="usuario@educacionbuga.gov.co"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={userData.password}
                  onChange={(e) => setUserData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Contraseña temporal"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="fullName">Nombre Completo</Label>
                <Input
                  id="fullName"
                  value={userData.fullName}
                  onChange={(e) => setUserData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Nombre del usuario"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="role">Dependencia</Label>
                <Select value={userData.role} onValueChange={(value) => {
                  setUserData(prev => ({ ...prev, role: value, area: AREAS_CONFIG[value as keyof typeof AREAS_CONFIG] || '' }))
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar dependencia" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AREAS_CONFIG).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button type="submit" disabled={isCreating} className="w-full">
                {isCreating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                ) : (
                  <>Crear Usuario</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Usuarios predefinidos */}
        <Card>
          <CardHeader>
            <CardTitle>Usuarios por Dependencia</CardTitle>
            <CardDescription>
              Crear usuarios principales del sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button 
                onClick={handleCreatePredefinedUsers} 
                disabled={isCreating}
                className="w-full"
              >
                {isCreating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creando...</>
                ) : (
                  <>Crear Usuarios por Dependencia</>
                )}
              </Button>
              
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {PREDEFINED_USERS.map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{user.fullName}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                      <div className="text-xs text-blue-600">{user.area}</div>
                    </div>
                    {createdUsers.includes(user.email) && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usuarios creados */}
      {createdUsers.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usuarios Creados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {createdUsers.map((email, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-green-50 rounded">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{email}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}