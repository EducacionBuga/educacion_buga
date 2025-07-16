// scripts/verify-env.js
/**
 * Script para verificar que todas las variables de entorno necesarias estén configuradas
 */

const fs = require('fs');
const path = require('path');

// Cargar variables desde .env.local si existe
const envLocalPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value && !process.env[key.trim()]) {
        process.env[key.trim()] = value.trim();
      }
    }
  });
  console.log('📄 Cargadas variables desde .env.local');
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY'
];

const optionalEnvVars = [
  'NODE_ENV',
  'SUPABASE_ANON_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL'
];

console.log('🔍 VERIFICACIÓN DE VARIABLES DE ENTORNO');
console.log('=====================================');

let allRequired = true;

console.log('\n📋 VARIABLES REQUERIDAS:');
requiredEnvVars.forEach(varName => {
  const value = process.env[varName];
  const exists = !!value;
  const maskedValue = exists ? value.substring(0, 10) + '...' : 'NO CONFIGURADA';
  
  console.log(`${exists ? '✅' : '❌'} ${varName}: ${maskedValue}`);
  
  if (!exists) {
    allRequired = false;
  }
});

console.log('\n📋 VARIABLES OPCIONALES:');
optionalEnvVars.forEach(varName => {
  const value = process.env[varName];
  const exists = !!value;
  const maskedValue = exists ? value.substring(0, 10) + '...' : 'NO CONFIGURADA';
  
  console.log(`${exists ? '✅' : '⚠️'} ${varName}: ${maskedValue}`);
});

console.log('\n📊 INFORMACIÓN DEL ENTORNO:');
console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'NO CONFIGURADO'}`);
console.log(`🏢 VERCEL: ${process.env.VERCEL ? 'Sí' : 'No'}`);
console.log(`🌐 NETLIFY: ${process.env.NETLIFY ? 'Sí' : 'No'}`);
console.log(`📁 PWD: ${process.cwd()}`);

console.log('\n=====================================');

if (allRequired) {
  console.log('✅ TODAS LAS VARIABLES REQUERIDAS ESTÁN CONFIGURADAS');
  process.exit(0);
} else {
  console.log('❌ FALTAN VARIABLES DE ENTORNO REQUERIDAS');
  console.log('\n💡 Para configurarlas:');
  console.log('1. Crea un archivo .env.local en la raíz del proyecto');
  console.log('2. Agrega las variables faltantes:');
  console.log('   SUPABASE_URL=tu_url_de_supabase');
  console.log('   SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase');
  console.log('3. En producción, configura estas variables en tu proveedor de hosting');
  process.exit(1);
}
