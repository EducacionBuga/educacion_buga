# 🔧 Solución: Cache de Paginación Bloqueando Datos Actualizados

## 🎯 Problema Identificado

Los datos de **Plan Decenal** y **PDM 2024-2027** aparecían como `undefined` en la UI a pesar de:
- ✅ Datos correctos guardados en la base de datos (verificado con `test-plan-accion-query.js`)
- ✅ Campos corregidos de `meta_decenal` → `meta_docenal` en todas las queries
- ✅ Types actualizados en `supabase-types.ts`
- ✅ Mapeos correctos en `use-plan-accion-service.ts` y `use-plan-accion-store.ts`

### 📊 Diagnóstico

El log de consola mostraba:
```
📦 Página 2 obtenida del cache
📊 PlanCard - Item data: {metaDecenal: undefined, programaPDM: undefined, ...}
```

**Causa raíz**: El sistema de paginación (`use-pagination.ts`) guardaba los datos en **localStorage** con la estructura antigua (sin campos docenal). Cada vez que se cargaba la página, el cache interceptaba la solicitud y servía datos obsoletos antes de que la query corregida pudiera ejecutarse.

## ✅ Soluciones Implementadas

### 1. **Versionado Automático de Cache**

**Archivo**: `hooks/use-pagination.ts`

**Cambios**:
```typescript
// 🔄 VERSIÓN DEL CACHE - Incrementa cuando cambies el esquema de BD
const CACHE_VERSION = 2

// Generar clave de cache con versión
const getCacheKey = useCallback((page: number, size: number) => {
  return `v${CACHE_VERSION}_${table}_${page}_${size}_${JSON.stringify(queryOptions)}`
}, [table, queryOptions])

// 🔄 Limpiar cache antiguo al montar el componente si la versión cambió
useEffect(() => {
  const storedVersion = localStorage.getItem('pagination_cache_version')
  if (storedVersion !== String(CACHE_VERSION)) {
    console.log('🧹 Limpiando cache antiguo - versión actualizada de', storedVersion, 'a', CACHE_VERSION)
    // Limpiar todas las claves de paginación en localStorage
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('_page_') || key.includes('pagination_'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    localStorage.setItem('pagination_cache_version', String(CACHE_VERSION))
    console.log('✅ Cache limpiado -', keysToRemove.length, 'claves eliminadas')
  }
}, [])
```

**Beneficios**:
- Invalidación automática de cache cuando cambias `CACHE_VERSION`
- Previene conflictos de esquema en futuras actualizaciones
- Transparente para el usuario final

### 2. **Botón de Limpieza Manual**

**Archivo**: `components/modules/plan-accion-area-mejorado.tsx`

**Cambios**:
```typescript
// Importar ícono
import { RefreshCw } from "lucide-react"

// Función de limpieza
const handleClearCacheAndReload = useCallback(() => {
  console.log('🧹 Limpiando cache de paginación...')
  
  const keysToRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key && (key.includes('_page_') || key.includes('pagination_') || key.startsWith('v'))) {
      keysToRemove.push(key)
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key))
  console.log(`✅ Cache limpiado - ${keysToRemove.length} claves eliminadas`)
  
  const CACHE_VERSION = 2
  localStorage.setItem('pagination_cache_version', String(CACHE_VERSION))
  
  window.location.reload()
}, [])

// Botón en el UI
<Button
  variant="outline"
  onClick={handleClearCacheAndReload}
  size="sm"
  className="flex items-center gap-2 text-orange-600 border-orange-300 hover:bg-orange-50"
  title="Limpiar caché y recargar datos frescos desde la base de datos"
>
  <RefreshCw className="h-4 w-4" />
  Limpiar Caché
</Button>
```

**Ubicación**: En la esquina superior derecha del componente, junto a los botones "Tarjetas" y "Tabla"

**Beneficios**:
- Permite a usuarios forzar recarga de datos frescos
- Útil para debugging y cuando se sospechan datos obsoletos
- Feedback visual claro del proceso de limpieza

### 3. **Script de Consola para Limpieza Rápida**

**Archivo**: `scripts/clear-pagination-cache.js`

Puedes copiar y pegar este script en la consola del navegador:

```javascript
// Limpiar cache
const keysToRemove = []
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i)
  if (key && (key.includes('_page_') || key.includes('pagination_') || key.startsWith('v'))) {
    keysToRemove.push(key)
  }
}
keysToRemove.forEach(key => localStorage.removeItem(key))
localStorage.setItem('pagination_cache_version', '2')
console.log(`✅ Cache limpiado - ${keysToRemove.length} claves`)
location.reload()
```

## 🚀 Pasos para Aplicar la Solución

### Opción 1: Automática (Recomendada)

1. Actualiza la página (`F5` o `Ctrl+R`)
2. El sistema detectará que `CACHE_VERSION = 2` es diferente de la versión almacenada
3. Limpiará automáticamente todo el cache antiguo
4. Cargará datos frescos con los campos `meta_docenal`, `programa_pdm`, etc.

### Opción 2: Manual con Botón

1. En la página de Plan de Acción, busca el botón **"Limpiar Caché"** (naranja, con ícono ♻️)
2. Haz clic en el botón
3. La página se recargará automáticamente con datos frescos

### Opción 3: Script de Consola

1. Abre DevTools (`F12`)
2. Ve a la pestaña "Console"
3. Copia y pega el contenido de `scripts/clear-pagination-cache.js`
4. Presiona `Enter`

## 🔍 Verificación de la Solución

Después de aplicar cualquiera de las opciones, deberías ver en la consola:

```
🧹 Limpiando cache antiguo - versión actualizada de 1 a 2
✅ Cache limpiado - X claves eliminadas
🔍 DATOS CRUDOS DE SUPABASE - Total de items: 3
🔥 ITEMS TRANSFORMADOS - Primer item:
  {
    metaDecenal: "MODELO EDUCATIVO DE ALTA CALIDAD",
    macroobjetivoDecenal: "...",
    objetivoDecenal: "...",
    programaPDM: "Calidad y fomento de la educación superior",
    subprogramaPDM: "...",
    proyectoPDM: "..."
  }
```

Y en las tarjetas de Plan de Acción verás los campos poblados:
- 🎯 **Plan Decenal**: MODELO EDUCATIVO DE ALTA CALIDAD
- 📊 **PDM 2024-2027**: Calidad y fomento de la educación superior

## 📝 Notas Importantes

### Para Futuros Cambios de Esquema

Cuando actualices la estructura de la base de datos:

1. **Incrementa `CACHE_VERSION`** en `hooks/use-pagination.ts`:
   ```typescript
   const CACHE_VERSION = 3 // Incrementado de 2 a 3
   ```

2. El cache se invalidará automáticamente para todos los usuarios en su próxima visita

### Prevención

Para evitar problemas similares en el futuro:

- ✅ Usa nombres de campos consistentes (evita typos como decenal/docenal)
- ✅ Genera types desde Supabase con `npx supabase gen types typescript`
- ✅ Incrementa `CACHE_VERSION` después de cambios de esquema
- ✅ Incluye logs de debug para facilitar diagnóstico

## 🎉 Resultado

Los datos de Plan Decenal y PDM 2024-2027 ahora se muestran correctamente en la UI, sincronizados con la base de datos.

---

**Fecha de Implementación**: 27 de Octubre, 2025  
**Archivos Modificados**:
- `hooks/use-pagination.ts`
- `components/modules/plan-accion-area-mejorado.tsx`
- `scripts/clear-pagination-cache.js` (nuevo)
