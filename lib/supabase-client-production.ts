// lib/supabase-client-production.ts
import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase optimizado para producción
 * Maneja automáticamente las diferencias entre entornos y problemas de timeout
 */
export function createSupabaseClientForProduction() {
  // En producción, las variables pueden tener nombres diferentes
  const possibleUrls = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_URL,
    process.env.PUBLIC_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_URL
  ];

  const possibleKeys = [
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.PUBLIC_SUPABASE_ANON_KEY,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  ];

  const url = possibleUrls.find(u => u && u.length > 10);
  const key = possibleKeys.find(k => k && k.length > 10);

  if (!url || !key) {
    console.error('🚨 Variables de entorno de Supabase no encontradas');
    console.error('📋 URLs disponibles:', possibleUrls.map(u => u ? `${u.substring(0, 20)}...` : 'undefined'));
    console.error('📋 Keys disponibles:', possibleKeys.map(k => k ? `${k.substring(0, 10)}...` : 'undefined'));
    console.error('🌍 Entorno:', process.env.NODE_ENV);
    console.error('🔍 Todas las variables SUPABASE:', 
      Object.keys(process.env)
        .filter(key => key.toLowerCase().includes('supabase'))
        .map(key => `${key}: ${process.env[key] ? 'SET' : 'NOT_SET'}`)
    );
    
    throw new Error(`Variables de Supabase no configuradas. Entorno: ${process.env.NODE_ENV}`);
  }

  console.log('✅ Supabase configurado para producción:', {
    url: `${url.substring(0, 30)}...`,
    keyType: key.startsWith('eyJ') ? 'JWT' : 'STRING',
    keyLength: key.length,
    environment: process.env.NODE_ENV
  });

  return createClient(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storageKey: 'sb-auth-token',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'sistema-educativo-production',
        'X-Client-Version': '1.0.0'
      },
      // Fetch optimizado para producción con timeouts más largos y reintentos
       fetch: (url: string, options: any = {}) => {
         const controller = new AbortController();
         const timeoutId = setTimeout(() => {
           console.warn('⚠️ [PROD] Timeout en fetch después de 90s, abortando...');
           controller.abort();
         }, 90000); // 90 segundos para producción
         
         return fetch(url, {
           ...options,
           signal: controller.signal
         }).catch((error) => {
           console.error('❌ [PROD] Error en fetch:', error.message);
           // Re-lanzar el error para que Supabase lo maneje
           throw error;
         }).finally(() => {
           clearTimeout(timeoutId);
         });
       }
    },
    realtime: {
      timeout: 30000,
      heartbeatIntervalMs: 30000,
      reconnectAfterMs: (tries: number) => Math.min(tries * 2000, 30000)
    }
  });
}

/**
 * Función de login optimizada para producción que maneja timeouts y errores
 */
export async function productionSafeLogin(
  client: SupabaseClient,
  email: string,
  password: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    console.log('🔑 [PROD] Iniciando login seguro para:', email);
    
    // Crear promesa de login con timeout extendido
    const loginPromise = client.auth.signInWithPassword({ email, password });
    
    // Timeout de 90 segundos para servidores lentos en producción
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Login timeout - el servidor está tardando demasiado'));
      }, 90000);
    });
    
    console.log('⏱️ [PROD] Timeout configurado a 90 segundos');
    
    const result = await Promise.race([loginPromise, timeoutPromise]) as any;
    
    if (result.error) {
      console.error('❌ [PROD] Error en login:', result.error.message);
      return { success: false, error: result.error.message };
    }
    
    if (!result.data?.user || !result.data?.session) {
      console.error('❌ [PROD] Login sin datos válidos');
      return { success: false, error: 'No se recibieron datos de usuario válidos' };
    }
    
    console.log('✅ [PROD] Login exitoso');
    
    // Intentar obtener datos del usuario con función RPC (con fallback)
    try {
      console.log('🔍 [PROD] Intentando obtener datos con función RPC...');
      
      const rpcPromise = client
        .rpc('get_user_role', { user_id: result.data.user.id })
        .single();
      
      const rpcTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('RPC timeout'));
        }, 15000); // 15 segundos para RPC
      });
      
      const rpcResult = await Promise.race([rpcPromise, rpcTimeoutPromise]) as any;
      
      if (rpcResult.data && !rpcResult.error) {
        console.log('✅ [PROD] Datos obtenidos con función RPC');
        return {
          success: true,
          data: {
            ...result.data,
            userProfile: rpcResult.data
          }
        };
      }
    } catch (rpcError: any) {
      console.warn('⚠️ [PROD] RPC falló, usando fallback:', rpcError.message);
    }
    
    // Fallback: usar solo datos de auth
    console.log('📋 [PROD] Usando datos de auth como fallback');
    return {
      success: true,
      data: result.data
    };
    
  } catch (error: any) {
    console.error('❌ [PROD] Error inesperado en login:', error.message);
    
    let errorMessage = 'Error de conexión en producción';
    
    if (error.message.includes('timeout')) {
      errorMessage = 'El servidor está tardando más de lo normal. Intenta nuevamente en unos minutos.';
    } else if (error.message.includes('network') || error.message.includes('fetch')) {
      errorMessage = 'Error de red. Verifica tu conexión a internet.';
    } else if (error.message.includes('Invalid login credentials')) {
      errorMessage = 'Email o contraseña incorrectos.';
    } else if (error.message.includes('Email not confirmed')) {
      errorMessage = 'Debes confirmar tu email antes de iniciar sesión.';
    }
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Verificar si la función get_user_role existe en la base de datos
 */
export async function checkGetUserRoleFunction(client: SupabaseClient): Promise<boolean> {
  try {
    console.log('🧪 [PROD] Verificando función get_user_role...');
    
    // Intentar llamar la función con un UUID dummy
    const { error } = await client
      .rpc('get_user_role', { user_id: '00000000-0000-0000-0000-000000000000' })
      .single();
    
    // Si no hay error de "función no existe", la función está disponible
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      console.error('❌ [PROD] Función get_user_role no existe en la base de datos');
      return false;
    }
    
    console.log('✅ [PROD] Función get_user_role está disponible');
    return true;
  } catch (error: any) {
    console.error('❌ [PROD] Error verificando función get_user_role:', error.message);
    return false;
  }
}
