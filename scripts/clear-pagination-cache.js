/**
 * Script para limpiar el cache de paginación en el navegador
 * Ejecutar en la consola del navegador para forzar carga fresca de datos
 */

console.log('🧹 Iniciando limpieza de cache de paginación...')

// Limpiar todas las claves relacionadas con paginación
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (key.includes('_page_') || key.includes('pagination_') || key.startsWith('v'))) {
    keysToRemove.push(key)
  }
}

console.log(`📋 Encontradas ${keysToRemove.length} claves de cache:`, keysToRemove)

keysToRemove.forEach(key => {
  localStorage.removeItem(key)
  console.log(`  ❌ Eliminada: ${key}`)
})

// Actualizar versión de cache
const CACHE_VERSION = 2
localStorage.setItem('pagination_cache_version', String(CACHE_VERSION))
console.log(`✅ Versión de cache actualizada a: ${CACHE_VERSION}`)

console.log('✅ Cache limpiado completamente')
console.log('🔄 Recargando página para obtener datos frescos...')

// Recargar la página
location.reload()
