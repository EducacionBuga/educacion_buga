// Script de emergencia para forzar rol ADMIN
console.log('🚨 SCRIPT DE EMERGENCIA - FORZANDO ROL ADMIN')

// Función para forzar rol admin en localStorage
const forceAdminRole = () => {
  const savedUser = localStorage.getItem('auth_user')
  if (savedUser) {
    try {
      const userData = JSON.parse(savedUser)
      console.log('👤 Usuario actual:', userData)
      
      // Forzar rol ADMIN
      userData.role = 'ADMIN'
      
      // Guardar cambios
      localStorage.setItem('auth_user', JSON.stringify(userData))
      
      console.log('✅ Rol forzado a ADMIN:', userData)
      console.log('🔄 Recarga la página para aplicar cambios')
      
      return userData
    } catch (error) {
      console.error('❌ Error al modificar usuario:', error)
    }
  } else {
    console.log('👻 No hay usuario en localStorage')
  }
}

// Función para verificar estado actual
const checkCurrentState = () => {
  console.log('=== ESTADO ACTUAL ===')
  const savedUser = localStorage.getItem('auth_user')
  const lastActivity = localStorage.getItem('auth_last_activity')
  
  if (savedUser) {
    const userData = JSON.parse(savedUser)
    console.log('Usuario:', userData)
    console.log('Rol actual:', userData.role)
    console.log('Última actividad:', lastActivity)
  } else {
    console.log('No hay datos de usuario')
  }
}

// Exportar funciones
window.forceAdminRole = forceAdminRole
window.checkCurrentState = checkCurrentState

console.log('📋 Funciones disponibles:')
console.log('- forceAdminRole(): Fuerza el rol a ADMIN')
console.log('- checkCurrentState(): Verifica el estado actual')

// Verificar estado automáticamente
checkCurrentState()
