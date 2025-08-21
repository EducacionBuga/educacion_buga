// Script para verificar el envío de datos demográficos al formulario Plan de Acción
// Este script ayuda a debuggear si los campos demográficos se están enviando correctamente

console.log('🔍 SCRIPT DE DEBUG - DATOS DEMOGRÁFICOS');
console.log('=====================================');

// Función para interceptar y mostrar datos demográficos
function debugDemographicData() {
  // Interceptar llamadas a console.log que contengan datos demográficos
  const originalLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    
    // Buscar logs relacionados con datos demográficos
    if (message.includes('📊 Datos demográficos') || 
        message.includes('grupoEtareo') ||
        message.includes('grupoPoblacion') ||
        message.includes('zona') ||
        message.includes('grupoEtnico') ||
        message.includes('cantidad')) {
      
      console.group('🎯 DATOS DEMOGRÁFICOS DETECTADOS:');
      originalLog.apply(console, args);
      console.groupEnd();
    } else {
      originalLog.apply(console, args);
    }
  };
}

// Función para verificar estructura de datos antes del envío
function verifyDemographicFields(data) {
  console.group('✅ VERIFICACIÓN DE CAMPOS DEMOGRÁFICOS:');
  
  const demographicFields = {
    'grupoEtareo': data.grupoEtareo,
    'grupoPoblacion': data.grupoPoblacion, 
    'zona': data.zona,
    'grupoEtnico': data.grupoEtnico,
    'cantidad': data.cantidad
  };
  
  console.log('📋 Campos demográficos encontrados:');
  Object.entries(demographicFields).forEach(([field, value]) => {
    const status = value ? '✅' : '❌';
    console.log(`${status} ${field}: ${value || 'VACÍO'}`);
  });
  
  // Verificar conversión a snake_case
  console.log('\n🔄 Conversión esperada a snake_case:');
  console.log('grupoEtareo → grupo_etareo:', data.grupoEtareo);
  console.log('grupoPoblacion → grupo_poblacion:', data.grupoPoblacion);
  console.log('zona → zona:', data.zona);
  console.log('grupoEtnico → grupo_etnico:', data.grupoEtnico);
  console.log('cantidad → cantidad:', data.cantidad);
  
  console.groupEnd();
  
  return demographicFields;
}

// Función para simular datos de prueba
function createTestDemographicData() {
  return {
    // Campos básicos del plan
    programa: 'Programa de Prueba',
    objetivo: 'Objetivo de Prueba',
    meta: 'Meta de Prueba',
    presupuesto: '1000000',
    acciones: 'Acciones de Prueba',
    indicadores: 'Indicadores de Prueba',
    responsable: 'Responsable de Prueba',
    
    // Campos demográficos de prueba
    grupoEtareo: 'PRIMERA_INFANCIA',
    grupoPoblacion: 'VICTIMA_CONFLICTO',
    zona: 'URBANA',
    grupoEtnico: 'AFRODESCENDIENTE',
    cantidad: '150'
  };
}

// Función principal de debug
function runDemographicDebug() {
  console.log('🚀 Iniciando debug de datos demográficos...');
  
  // Activar interceptor de logs
  debugDemographicData();
  
  // Crear datos de prueba
  const testData = createTestDemographicData();
  console.log('📝 Datos de prueba creados:', testData);
  
  // Verificar campos
  verifyDemographicFields(testData);
  
  console.log('\n💡 INSTRUCCIONES:');
  console.log('1. Abra la consola del navegador');
  console.log('2. Vaya al formulario de Plan de Acción');
  console.log('3. Llene los campos demográficos');
  console.log('4. Observe los logs cuando haga clic en "Guardar"');
  console.log('5. Busque los mensajes marcados con 🎯');
}

// Ejecutar debug si estamos en el navegador
if (typeof window !== 'undefined') {
  runDemographicDebug();
}

// Exportar funciones para uso manual
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    debugDemographicData,
    verifyDemographicFields,
    createTestDemographicData,
    runDemographicDebug
  };
}

console.log('✅ Script de debug cargado. Use runDemographicDebug() para iniciar.');