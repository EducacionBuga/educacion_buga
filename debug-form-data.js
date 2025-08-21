// Script de depuración para verificar el envío de datos del formulario
// Este archivo ayuda a identificar problemas en el mapeo de campos

console.log('=== DEPURACIÓN DE DATOS DEL FORMULARIO ===');

// Simular datos del formulario como se envían desde el componente
const formDataExample = {
  // Campos básicos
  programa: "Programa de prueba",
  objetivo: "Objetivo de prueba",
  meta: "Meta de prueba",
  
  // Campos del Plan Decenal (estos son los problemáticos)
  metaDecenal: "Meta decenal seleccionada",
  macroobjetivoDecenal: "Macroobjetivo decenal seleccionado", 
  objetivoDecenal: "Objetivo decenal seleccionado",
  
  // Campos PDM
  programaPDM: "Programa PDM seleccionado",
  subprogramaPDM: "Subprograma PDM seleccionado",
  proyectoPDM: "Proyecto PDM seleccionado",
  
  // Campos demográficos
  grupoEtareo: "21-25",
  grupoPoblacion: "victima-conflicto",
  zona: "urbana",
  grupoEtnico: "na",
  cantidad: "100"
};

console.log('📋 Datos del formulario (camelCase):', formDataExample);

// Mapeo que se hace en el store (snake_case para Supabase)
const supabaseData = {
  // Campos básicos
  programa: formDataExample.programa,
  objetivo: formDataExample.objetivo,
  meta: formDataExample.meta,
  
  // Campos del Plan Decenal - MAPEO CORRECTO
  meta_decenal: formDataExample.metaDecenal,
  macroobjetivo_decenal: formDataExample.macroobjetivoDecenal,
  objetivo_decenal: formDataExample.objetivoDecenal,
  
  // Campos PDM - MAPEO CORRECTO
  programa_pdm: formDataExample.programaPDM,
  subprograma_pdm: formDataExample.subprogramaPDM,
  proyecto_pdm: formDataExample.proyectoPDM,
  
  // Campos demográficos - MAPEO CORRECTO
  grupo_etareo: formDataExample.grupoEtareo,
  grupo_poblacion: formDataExample.grupoPoblacion,
  zona: formDataExample.zona,
  grupo_etnico: formDataExample.grupoEtnico,
  cantidad: Number(formDataExample.cantidad)
};

console.log('🗄️ Datos para Supabase (snake_case):', supabaseData);

// Verificar que no hay campos undefined o null
const missingFields = [];
Object.entries(supabaseData).forEach(([key, value]) => {
  if (value === undefined || value === null || value === '') {
    missingFields.push(key);
  }
});

if (missingFields.length > 0) {
  console.warn('⚠️ Campos faltantes o vacíos:', missingFields);
} else {
  console.log('✅ Todos los campos tienen valores');
}

// Verificar estructura de columnas esperada en Supabase
const expectedColumns = [
  'meta_decenal',
  'macroobjetivo_decenal', 
  'objetivo_decenal',
  'programa_pdm',
  'subprograma_pdm',
  'proyecto_pdm',
  'grupo_etareo',
  'grupo_poblacion',
  'zona',
  'grupo_etnico',
  'cantidad'
];

console.log('📊 Columnas esperadas en Supabase:', expectedColumns);
console.log('📊 Columnas que se están enviando:', Object.keys(supabaseData));

const missingColumns = expectedColumns.filter(col => !(col in supabaseData));
if (missingColumns.length > 0) {
  console.error('❌ Columnas faltantes en el mapeo:', missingColumns);
} else {
  console.log('✅ Todas las columnas están mapeadas correctamente');
}

export { formDataExample, supabaseData, expectedColumns };