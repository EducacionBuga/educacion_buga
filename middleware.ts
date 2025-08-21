import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Permitir APIs y rutas públicas sin autenticación
  if (req.nextUrl.pathname.startsWith('/api/checklist/') || 
      req.nextUrl.pathname.startsWith('/api/test/') ||
      req.nextUrl.pathname.startsWith('/login-test') ||
      req.nextUrl.pathname.startsWith('/_next/') ||
      req.nextUrl.pathname === '/') {
    return res
  }
  
  try {
    // Crear cliente de Supabase para middleware
    const supabase = createMiddlewareClient({ req, res })
    
    console.log('🔍 [MIDDLEWARE] Verificando sesión para:', req.nextUrl.pathname)
    
    // Verificar sesión con timeout optimizado para producción
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 5000) // 5 segundos para producción
    })

    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any
    
    console.log('📋 [MIDDLEWARE] Estado de sesión:', {
      hasSession: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      path: req.nextUrl.pathname
    })
    
    // Si está en una ruta protegida y no hay sesión, redirigir al login (página principal)
    if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
      console.log('🚫 [MIDDLEWARE] Sin sesión, redirigiendo a login')
      return NextResponse.redirect(new URL('/', req.url))
    }
    
    // Si está en la página principal y ya tiene sesión, redirigir al dashboard
    if (req.nextUrl.pathname === '/' && session) {
      console.log('✅ [MIDDLEWARE] Con sesión, redirigiendo a dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    console.log('➡️ [MIDDLEWARE] Permitiendo acceso a:', req.nextUrl.pathname)
    
    return res
  } catch (error) {
    console.error('❌ [MIDDLEWARE] Error verificando sesión:', error)
    
    // En caso de error, ser más permisivo y permitir que el auth-context maneje la autenticación
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      console.warn('⚠️ [MIDDLEWARE] Error en verificación, permitiendo acceso para que el cliente maneje la auth')
      // Permitir acceso y que el contexto de auth maneje la redirección si es necesario
      return res
    }
    
    // Para otras rutas, continuar normalmente
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
