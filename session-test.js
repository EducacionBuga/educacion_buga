// Test script para verificar persistencia de sesión y timeout

const testSessionPersistence = () => {
  console.log('=== TEST SESSION PERSISTENCE ===')
  
  // Verificar localStorage
  const authUser = localStorage.getItem('authUser')
  const sessionExpiry = localStorage.getItem('sessionExpiry')
  const lastActivity = localStorage.getItem('lastActivity')
  
  console.log('AuthUser:', authUser ? JSON.parse(authUser) : 'No user')
  console.log('Session Expiry:', sessionExpiry ? new Date(sessionExpiry) : 'No expiry')
  console.log('Last Activity:', lastActivity ? new Date(lastActivity) : 'No activity')
  
  if (sessionExpiry) {
    const now = new Date()
    const expiry = new Date(sessionExpiry)
    const timeRemaining = expiry.getTime() - now.getTime()
    const minutesRemaining = Math.floor(timeRemaining / (1000 * 60))
    
    console.log('Minutos restantes:', minutesRemaining)
    console.log('Sesión válida:', timeRemaining > 0 ? 'SÍ' : 'NO')
  }
}

const simulateActivity = () => {
  console.log('=== SIMULATING ACTIVITY ===')
  // Simular evento de actividad
  document.dispatchEvent(new Event('mousedown'))
  console.log('Actividad simulada - timer reiniciado')
}

const clearSession = () => {
  console.log('=== CLEARING SESSION ===')
  localStorage.removeItem('authUser')
  localStorage.removeItem('sessionExpiry')
  localStorage.removeItem('lastActivity')
  console.log('Sesión limpiada')
}

// Exportar funciones para testing en consola
window.testSessionPersistence = testSessionPersistence
window.simulateActivity = simulateActivity
window.clearSession = clearSession

console.log('Functions available:')
console.log('- testSessionPersistence(): Verifica estado de la sesión')
console.log('- simulateActivity(): Simula actividad del usuario')
console.log('- clearSession(): Limpia datos de sesión')

// Test automático cada 30 segundos
setInterval(() => {
  if (localStorage.getItem('authUser')) {
    testSessionPersistence()
  }
}, 30000)
