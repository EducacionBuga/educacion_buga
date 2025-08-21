#!/usr/bin/env node

/**
 * Script para cambiar al contexto de autenticación optimizado para producción
 * Uso: node scripts/switch-to-production-auth.js
 */

const fs = require('fs')
const path = require('path')

const contextDir = path.join(__dirname, '..', 'context')
const indexFile = path.join(contextDir, 'index.ts')

// Contenido para usar el contexto de producción
const productionContent = `export { AuthProviderProduction as AuthProvider, useAuth } from './auth-context-production'
export type { AuthUser, AuthContextType } from './auth-context-production'
`

// Contenido para usar el contexto normal
const normalContent = `export { AuthProvider, useAuth } from './auth-context'
export type { AuthUser, AuthContextType } from './auth-context'
`

try {
  // Leer el contenido actual
  const currentContent = fs.readFileSync(indexFile, 'utf8')
  
  if (currentContent.includes('auth-context-production')) {
    console.log('🔄 Cambiando a contexto de autenticación normal...')
    fs.writeFileSync(indexFile, normalContent)
    console.log('✅ Ahora usando contexto de autenticación normal')
  } else {
    console.log('🔄 Cambiando a contexto de autenticación de producción...')
    fs.writeFileSync(indexFile, productionContent)
    console.log('✅ Ahora usando contexto de autenticación de producción')
    console.log('📋 Características del contexto de producción:')
    console.log('   - Timeouts extendidos (90 segundos para login)')
    console.log('   - Manejo robusto de errores de red')
    console.log('   - Fallback automático si la función RPC falla')
    console.log('   - Logs detallados para debugging')
    console.log('   - Configuración optimizada para servidores lentos')
  }
  
  console.log('\n🚀 Reinicia el servidor de desarrollo para aplicar los cambios:')
  console.log('   npm run dev')
  
} catch (error) {
  console.error('❌ Error al cambiar el contexto:', error.message)
  process.exit(1)
}