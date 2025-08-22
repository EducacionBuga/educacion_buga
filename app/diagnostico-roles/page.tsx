"use client"

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useAuth } from '@/context'

export default function DiagnosticoRolesPage() {
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClientComponentClient()

  const probarRPC = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !currentUser) {
        setError('No hay usuario autenticado')
        return
      }

      console.log('👤 Usuario actual:', currentUser)
      
      // Probar RPC con el usuario actual
      const { data, error: rpcError } = await supabase
        .rpc('get_user_role', { user_id: currentUser.id })
        .single()

      if (rpcError) {
        console.error('❌ Error en RPC:', rpcError)
        setError(`Error RPC: ${rpcError.message}`)
      } else {
        console.log('✅ Resultado RPC:', data)
        setResult({
          usuario_auth: {
            id: currentUser.id,
            email: currentUser.email,
            user_metadata: currentUser.user_metadata
          },
          resultado_rpc: data,
          usuario_contexto: user
        })
      }
    } catch (err: any) {
      console.error('❌ Error:', err)
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const consultarProfiles = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('email')

      if (profilesError) {
        setError(`Error consultando profiles: ${profilesError.message}`)
      } else {
        setResult({ tabla_profiles: data })
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>🔍 Diagnóstico de Validación de Roles</h1>
        <p style={{ color: '#666' }}>Herramienta para diagnosticar problemas con la validación de roles de usuario</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <button 
          onClick={probarRPC} 
          disabled={loading}
          style={{ 
            padding: '15px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Probando...' : '🧪 Probar Función RPC'}
        </button>
        
        <button 
          onClick={consultarProfiles} 
          disabled={loading}
          style={{ 
            padding: '15px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Consultando...' : '📋 Ver Tabla Profiles'}
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: '15px', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '8px', 
          color: '#721c24',
          marginBottom: '20px'
        }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '8px', 
          color: '#155724',
          marginBottom: '20px'
        }}>
          <strong>✅ Resultado:</strong>
          <pre style={{ 
            marginTop: '15px', 
            fontSize: '12px', 
            overflow: 'auto',
            backgroundColor: 'white',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #ddd',
            maxHeight: '400px'
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px' 
      }}>
        <h2 style={{ color: '#495057', marginBottom: '15px' }}>📋 Instrucciones</h2>
        <ol style={{ lineHeight: '1.8', color: '#6c757d' }}>
          <li><strong>Ejecutar Script SQL:</strong> Primero ejecuta <code>scripts/fix-user-role-validation.sql</code> en Supabase Dashboard</li>
          <li><strong>Probar RPC:</strong> Haz click en "🧪 Probar Función RPC" para verificar si la función funciona</li>
          <li><strong>Ver Datos:</strong> Haz click en "📋 Ver Tabla Profiles" para ver los usuarios y roles</li>
          <li><strong>Verificar Logs:</strong> Revisa la consola del navegador para logs detallados</li>
        </ol>
        
        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
          <strong>💡 Tip:</strong> Si la función RPC falla, verifica que se ejecutó correctamente el script SQL en Supabase.
        </div>
      </div>
    </div>
  )
}