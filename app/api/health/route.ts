// app/api/health/route.ts
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint de salud súper simple para verificar que la API funciona
 */
export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      message: 'API funcionando correctamente'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 });
  }
}
