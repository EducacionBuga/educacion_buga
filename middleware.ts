import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Permitir APIs de checklist sin autenticación
  if (req.nextUrl.pathname.startsWith('/api/checklist/') || 
      req.nextUrl.pathname.startsWith('/api/test/')) {
    return res
  }
  
  try {
    // Crear cliente de Supabase con timeout optimizado
    const supabase = createMiddlewareClient({ req, res })
    
    // Verificar sesión con timeout
    const sessionPromise = supabase.auth.getSession()
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timeout')), 3000) // 3 segundos
    })

    const { data: { session } } = await Promise.race([
      sessionPromise,
      timeoutPromise
    ]) as any
    
    // Si está en una ruta protegida y no hay sesión, redirigir al login
    if (req.nextUrl.pathname.startsWith('/dashboard') && !session) {
      return NextResponse.redirect(new URL('/auth/login', req.url))
    }
    
    // Si está en login y ya tiene sesión, redirigir al dashboard
    if (req.nextUrl.pathname.startsWith('/auth/login') && session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    return res
  } catch (error) {
    console.error('Middleware error:', error)
    
    // En caso de error de timeout, permitir que continúe para que el auth-context maneje la autenticación
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      // Solo redirigir si definitivamente no hay forma de verificar la sesión
      console.warn('Cannot verify session due to timeout, allowing client-side auth handling')
    }
    
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
