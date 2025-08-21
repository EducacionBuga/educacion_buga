# Plan de Acción - Componentes Refactorizados

Este directorio contiene la versión refactorizada y optimizada de los componentes del formulario de Plan de Acción, aplicando las mejores prácticas de arquitectura y rendimiento.

## 🏗️ Arquitectura y Organización

### Separación por Responsabilidades

- **`/hooks`**: Lógica de negocio separada por responsabilidad
- **`/sections`**: Componentes de presentación especializados
- **`/types`**: Tipos explícitos y contratos de datos

### Componentes Principales

#### 1. `plan-accion-form-sections-refactored.tsx`
**Componente contenedor principal** que aplica separación de presentación vs contenedores.

**Características:**
- ✅ Separación clara de responsabilidades
- ✅ Uso de hooks especializados
- ✅ Componentes memoizados
- ✅ Manejo optimizado de estado

#### 2. `optimized-form-container.tsx`
**Contenedor altamente optimizado** que demuestra las mejores prácticas de rendimiento.

**Optimizaciones implementadas:**
- ✅ `React.memo` para evitar re-renders innecesarios
- ✅ `useMemo` para cálculos costosos
- ✅ `useCallback` para handlers estables
- ✅ Normalización de datos con patrón `byId/allIds`
- ✅ Validación memoizada

## 🎯 Hooks Especializados

### `useCollapsibleSections`
Maneja el estado de secciones colapsables usando `useReducer` para mejor rendimiento.

```typescript
const { sectionsState, toggleSection, setSection, resetSections } = useCollapsibleSections();
```

### `usePlanDecenal`
Encapsula toda la lógica del Plan Decenal con limpieza automática de campos.

```typescript
const planDecenalHook = usePlanDecenal({
  incluir: incluirPlanDecenal,
  onIncluirChange: setIncluirPlanDecenal,
  // ... otros props
});
```

### `usePDM`
Maneja la lógica del Plan de Desarrollo Municipal con descarga de documentos.

```typescript
const pdmHook = usePDM({
  incluir: incluirPDM,
  onIncluirChange: setIncluirPDM,
  // ... otros props
});
```

### `useFormValidation`
Validación centralizada con mensajes específicos y detallados.

```typescript
const { isValid, errors, getValidationMessage } = useFormValidation(item);
```

### `useNormalizedData`
Normalización de datos usando el patrón `byId/allIds` para mejor rendimiento.

```typescript
const { normalizedProgramas, availableMetas } = useNormalizedData({
  programas,
  metas,
  selectedPrograma
});
```

## 🧩 Componentes de Sección

### `BasicInfoSection`
Sección de información básica con validación integrada y accesibilidad.

### `DemographicSelector`
Selector demográfico con tipos explícitos y labels constantes.

### `SpecificInfoSection`
Información específica con formateo de moneda y validación de rangos.

### `CollapsibleSection`
Componente base reutilizable para secciones colapsables con esquemas de color.

### `PlanDecenalSelector`
Selector especializado para Plan Decenal con accesibilidad completa.

### `PDMSelector`
Selector para PDM con descarga de documentos y validación encadenada.

### `FieldError`
Componente reutilizable para mostrar errores de validación.

## 📋 Tipos y Contratos

### Tipos Explícitos
```typescript
// Enums para catálogos
enum GrupoEtareo {
  PRIMERA_INFANCIA = "primera_infancia",
  INFANCIA = "infancia",
  // ...
}

// Interfaces estructuradas
interface Programa {
  id: string;
  nombre: string;
}

interface Meta {
  id: string;
  programaId: string;
  nombre: string;
}
```

### Normalización de Datos
```typescript
interface ProgramasMetasNormalized<T> {
  byId: Record<string, T>;
  allIds: string[];
}
```

## 🚀 Optimizaciones de Rendimiento

### 1. Memoización Estratégica
- **Componentes**: `React.memo` en componentes que reciben props complejas
- **Cálculos**: `useMemo` para transformaciones de datos costosas
- **Handlers**: `useCallback` para funciones pasadas como props

### 2. Normalización de Datos
- Patrón `byId/allIds` para acceso O(1)
- Evita comparaciones por `label`
- Reduce re-renders por cambios de referencia

### 3. Validación Optimizada
- Validación memoizada que solo recalcula cuando cambian los datos
- Mensajes de error específicos y útiles
- Validación por secciones para feedback granular

### 4. Estado Optimizado
- `useReducer` para estado complejo (secciones colapsables)
- Single source of truth para evitar duplicación
- Limpieza automática de campos dependientes

## 🎨 UI/UX Mejorado

### Accesibilidad
- ✅ `aria-invalid`, `aria-describedby` en campos con errores
- ✅ Labels asociados correctamente
- ✅ Navegación por teclado
- ✅ Texto de ayuda para lectores de pantalla

### Consistencia Visual
- ✅ Esquemas de color predefinidos para secciones
- ✅ Componentes de error reutilizables
- ✅ Feedback visual claro para estados de carga
- ✅ Formateo automático de moneda

### Experiencia de Usuario
- ✅ Validación en tiempo real
- ✅ Mensajes de error específicos
- ✅ Limpieza automática de campos dependientes
- ✅ Estados de carga y deshabilitado

## 📊 Comparación de Rendimiento

| Aspecto | Versión Original | Versión Refactorizada |
|---------|------------------|----------------------|
| Re-renders | Frecuentes | Minimizados con memo |
| Validación | En cada render | Memoizada |
| Datos | Arrays simples | Normalizados (byId) |
| Estado | useState múltiple | useReducer optimizado |
| Accesibilidad | Básica | Completa (WCAG) |
| Mantenibilidad | Monolítico | Modular y tipado |

## 🔧 Uso Recomendado

### Para Nuevos Desarrollos
Usa `OptimizedFormContainer` como base:

```tsx
import { OptimizedFormContainer } from './optimized-form-container';

<OptimizedFormContainer
  initialItem={planAccionItem}
  onSave={handleSave}
  onCancel={handleCancel}
  disabled={isLoading}
/>
```

### Para Migración Gradual
Usa `PlanAccionFormSections` refactorizado:

```tsx
import { PlanAccionFormSections } from './plan-accion-form-sections-refactored';

// Mantiene la misma interfaz que el original
<PlanAccionFormSections
  item={item}
  errors={errors}
  updateField={updateField}
  // ... resto de props
/>
```

## 🧪 Testing

Los componentes están diseñados para ser fácilmente testeable:

- **Hooks aislados**: Cada hook puede testearse independientemente
- **Componentes puros**: Los componentes de presentación son funciones puras
- **Props explícitas**: Interfaces claras facilitan el mocking
- **Separación de responsabilidades**: Lógica de negocio separada de UI

## 🔮 Próximos Pasos

1. **Implementar react-hook-form + Zod** para validación más robusta
2. **Agregar Storybook** para documentación visual
3. **Implementar tests unitarios** con Vitest/RTL
4. **Agregar internacionalización** (i18n)
5. **Implementar cache con TanStack Query** para catálogos
6. **Agregar lazy loading** para secciones opcionales