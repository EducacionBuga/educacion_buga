// lib/supabase-client-production.ts
import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase optimizado para producción
 * Maneja automáticamente las diferencias entre entornos
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
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    process.env.SUPABASE_ANON_KEY,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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

  console.log('✅ Supabase configurado:', {
    url: `${url.substring(0, 30)}...`,
    keyType: key.startsWith('eyJ') ? 'JWT' : 'STRING',
    keyLength: key.length,
    environment: process.env.NODE_ENV
  });

  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'sistema-educativo-production'
      }
    }
  });
}
