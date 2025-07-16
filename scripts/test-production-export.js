// scripts/test-production-export.js
/**
 * Script para probar la exportación Excel simulando condiciones de producción
 */

const { execSync } = require('child_process');

console.log('🧪 SIMULANDO CONDICIONES DE PRODUCCIÓN');
console.log('=====================================');

// 1. Probar sin variables de entorno (simular error de producción)
console.log('\n1️⃣ Probando sin variables de entorno de Supabase...');

// Backup de las variables originales
const originalUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Eliminar variables para simular error de producción
delete process.env.NEXT_PUBLIC_SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;

try {
  const result = execSync('curl -X GET "http://localhost:3000/api/lista-chequeo/export/debug"', { 
    encoding: 'utf8',
    timeout: 30000
  });
  
  const data = JSON.parse(result);
  console.log('📊 Resultado del diagnóstico:', {
    supabaseUrl: data.envVars?.SUPABASE_URL,
    supabaseKey: data.envVars?.SUPABASE_ANON_KEY,
    connection: data.diagnostics?.supabaseConnection,
    error: data.diagnostics?.error
  });
  
} catch (error) {
  console.log('❌ Error esperado (simulando producción):', error.message);
}

// Restaurar variables
process.env.NEXT_PUBLIC_SUPABASE_URL = originalUrl;
process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;

console.log('\n2️⃣ Probando con variables restauradas...');

try {
  const result = execSync('curl -X GET "http://localhost:3000/api/lista-chequeo/export/debug"', { 
    encoding: 'utf8',
    timeout: 30000
  });
  
  const data = JSON.parse(result);
  console.log('✅ Variables restauradas:', {
    connection: data.diagnostics?.supabaseConnection,
    excelJS: data.diagnostics?.excelJSVersion,
    templateExists: Object.values(data.diagnostics?.templateExists || {}).some(Boolean)
  });
  
} catch (error) {
  console.log('❌ Error:', error.message);
}

console.log('\n=====================================');
console.log('💡 INSTRUCCIONES PARA PRODUCCIÓN:');
console.log('1. Verifique que estas variables estén configuradas en su servidor:');
console.log('   - NEXT_PUBLIC_SUPABASE_URL');
console.log('   - SUPABASE_SERVICE_ROLE_KEY');
console.log('2. Ejecute el diagnóstico en producción: /api/lista-chequeo/export/debug');
console.log('3. Verifique que la plantilla Excel esté disponible en: /public/document/lista-chequeo.xlsx');
