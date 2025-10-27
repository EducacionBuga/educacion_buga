# Solución: Datos de Plan Decenal y PDM no se mostraban en UI

## 🐛 Problema
Los datos de **Plan Decenal** y **PDM 2024-2027** se guardaban correctamente en la base de datos pero NO se mostraban en la interfaz.

**Síntoma**: Las pestañas mostraban "No se ha asignado información del Plan Decenal" aunque los datos existían en la BD.

## ✅ Causa Raíz
**Error tipográfico (typo) en nombres de campos** en `use-plan-accion-store.ts`:

- **Base de datos**: usa `meta_docenal`, `macroobjetivo_docenal`, `objetivo_docenal` (con "o")
- **Al escribir en BD**: usaba `meta_docenal` ✅ CORRECTO
- **Al leer desde BD**: usaba `meta_decenal` ❌ INCORRECTO (con "e")

Por eso **guardaba** pero **no leía** los datos.

## 🔍 Cómo se Descubrió
El usuario notó que:
1. ✅ **General** y **Demográfica** SÍ cargaban
2. ❌ **Plan Decenal** y **PDM** NO cargaban

Al comparar ambos casos, se identificó que los campos demográficos usaban el nombre correcto desde la BD, pero los campos del Plan Decenal tenían el typo "decenal" vs "docenal".

## 🔧 Solución Aplicada

### Archivo: `hooks/use-plan-accion-store.ts`

**Cambio 1: SELECT query (líneas 140-142)**
```typescript
// ❌ ANTES (incorrecto - con "e")
meta_decenal,
macroobjetivo_decenal,
objetivo_decenal,

// ✅ DESPUÉS (correcto - con "o")
meta_docenal,
macroobjetivo_docenal,
objetivo_docenal,
```

**Cambio 2: Mapeo de datos (líneas 184-186)**
```typescript
// ❌ ANTES (incorrecto)
metaDecenal: item.meta_decenal || undefined,
macroobjetivoDecenal: item.macroobjetivo_decenal || undefined,
objetivoDecenal: item.objetivo_decenal || undefined,

// ✅ DESPUÉS (correcto)
metaDecenal: item.meta_docenal || undefined,
macroobjetivoDecenal: item.macroobjetivo_docenal || undefined,
objetivoDecenal: item.objetivo_docenal || undefined,
```

## 📊 Esquema de Nombres
| Nivel | Base de Datos | TypeScript | UI Display |
|-------|---------------|------------|------------|
| BD → App | `meta_docenal` | `metaDecenal` | Meta del Plan Decenal |
| BD → App | `macroobjetivo_docenal` | `macroobjetivoDecenal` | Macroobjetivo |
| BD → App | `objetivo_docenal` | `objetivoDecenal` | Objetivo Decenal |

**Nota**: La BD usa "docenal" (12 años) pero en el código TypeScript se usa "decenal" (10 años) por convención educativa.

## 📝 Archivos Verificados
- ✅ `use-plan-accion-service.ts` - **Ya estaba correcto** con `meta_docenal`
- ✅ `use-plan-accion-store.ts` - **Corregido** de `meta_decenal` a `meta_docenal`
- ✅ Campos demográficos - **Ya funcionaban** correctamente

## 🎯 Resultado
Ahora los datos guardados en la base de datos se **leen y muestran correctamente** en las pestañas:
- 🎯 Plan Decenal
- 📊 PDM 2024-2027

## 💡 Prevención
- Usar constantes para nombres de campos de BD
- Implementar tests de integración que verifiquen lectura/escritura
- Validar que los nombres de campos coincidan con el schema de Supabase
