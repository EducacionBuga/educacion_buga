# Documentación del Formulario Plan de Acción

## Descripción General

El formulario del Plan de Acción es un componente complejo que permite la creación y edición de planes de acción educativos, integrando información del Plan Decenal de Educación y el Plan de Desarrollo Municipal (PDM) 2024-2027.

## Estructura del Formulario

### Secciones Principales

El formulario está organizado en 5 secciones principales desplegables:

1. **Información Básica**
2. **Información Demográfica**
3. **Información Específica**
4. **Plan Decenal de Educación**
5. **Plan de Desarrollo Municipal (PDM) 2024-2027**

## Sección 1: Información Básica

### Campos:
- **Nombre del Plan de Acción** (obligatorio)
- **Descripción** (obligatorio)
- **Fecha de Inicio** (obligatorio)
- **Fecha de Fin** (obligatorio)
- **Estado**: Dropdown con opciones (Planificado, En Progreso, Completado, Cancelado)
- **Prioridad**: Dropdown con opciones (Baja, Media, Alta, Crítica)

### Validaciones:
- Todos los campos marcados como obligatorios deben completarse
- La fecha de fin debe ser posterior a la fecha de inicio

## Sección 2: Información Demográfica

### Campos:
- **Grupo Etáreo**: Dropdown con opciones predefinidas
- **Grupo de Población**: Dropdown con opciones específicas
- **Zona**: Dropdown (Urbana, Rural, Mixta)
- **Grupo Étnico**: Dropdown con opciones étnicas
- **Cantidad**: Campo numérico

### Lógica:
- Todos los campos son opcionales
- La cantidad debe ser un número positivo si se especifica

## Sección 3: Información Específica

### Campos:
- **Objetivo General** (obligatorio)
- **Objetivos Específicos** (obligatorio)
- **Metodología** (obligatorio)
- **Recursos Necesarios** (obligatorio)
- **Indicadores de Éxito** (obligatorio)
- **Responsables** (obligatorio)

### Validaciones:
- Todos los campos son obligatorios para completar esta sección

## Sección 4: Plan Decenal de Educación

### Funcionalidades:

#### Checkbox de Inclusión:
- **Pregunta**: "¿Desea agregar plan decenal?"
- **Comportamiento**: 
  - Al marcar: Muestra los campos del Plan Decenal
  - Al desmarcar: Oculta y limpia todos los campos relacionados

#### Campos en Cascada:
1. **Meta Decenal** (dropdown)
   - Opciones predefinidas del Plan Decenal
   - Al seleccionar, habilita el siguiente dropdown

2. **Macroobjetivo Decenal** (dropdown)
   - Filtrado según la Meta seleccionada
   - Al seleccionar, habilita el siguiente dropdown

3. **Objetivo Decenal** (dropdown)
   - Filtrado según el Macroobjetivo seleccionado

#### Funcionalidad de Descarga:
- **Botón "Descargar"**: Disponible cuando el checkbox está marcado
- **Función**: Exporta la información seleccionada como archivo JSON
- **Nombre del archivo**: `plan-decenal-info.json`
- **Contenido**: Meta, Macroobjetivo y Objetivo seleccionados

#### Indicador Visual:
- **Badge de completitud**: Se muestra cuando todos los campos están llenos
- **Estilo**: Badge secundario con ícono de verificación

### Estructura de Datos:
```json
{
  "meta": "Meta seleccionada",
  "macroobjetivo": "Macroobjetivo seleccionado",
  "objetivo": "Objetivo seleccionado"
}
```

## Sección 5: Plan de Desarrollo Municipal (PDM) 2024-2027

### Funcionalidades:

#### Checkbox de Inclusión:
- **Pregunta**: "¿Desea agregar información del Plan de Desarrollo Municipal (PDM) 2024-2027?"
- **Comportamiento**: 
  - Al marcar: Muestra los campos del PDM
  - Al desmarcar: Oculta y limpia todos los campos relacionados

#### Campos en Cascada:
1. **Programa PDM** (dropdown)
   - Opciones predefinidas del PDM
   - Al seleccionar, habilita el siguiente dropdown

2. **Subprograma PDM** (dropdown)
   - Filtrado según el Programa seleccionado
   - Al seleccionar, habilita el siguiente dropdown

3. **Proyecto/Actividad PDM** (dropdown)
   - Filtrado según el Subprograma seleccionado

#### Funcionalidad de Descarga:
- **Botón "Descargar"**: Disponible cuando el checkbox está marcado
- **Función**: Exporta la información seleccionada como archivo JSON
- **Nombre del archivo**: `pdm-info.json`
- **Contenido**: Programa, Subprograma y Proyecto seleccionados

#### Indicador Visual:
- **Badge de completitud**: Se muestra cuando todos los campos están llenos
- **Estilo**: Badge secundario con ícono de verificación

### Estructura de Datos:
```json
{
  "programa": "Programa seleccionado",
  "subprograma": "Subprograma seleccionado",
  "proyecto": "Proyecto seleccionado"
}
```

## Estados del Formulario

### Estados de las Secciones:
- **Abierta/Cerrada**: Cada sección puede expandirse o contraerse
- **Completa/Incompleta**: Indicador visual de completitud
- **Válida/Inválida**: Estado de validación de campos obligatorios

### Estados de los Checkboxes:
- **incluirPlanDecenal**: Boolean que controla la visibilidad del Plan Decenal
- **incluirPDM**: Boolean que controla la visibilidad del PDM

## Lógica de Inicialización

### Modo Edición:
```javascript
if (editingItem) {
  // Inicializar checkboxes basado en datos existentes
  setIncluirPlanDecenal(!!(
    editingItem.meta_decenal || 
    editingItem.macroobjetivo_decenal || 
    editingItem.objetivo_decenal
  ))
  
  setIncluirPDM(!!(
    editingItem.programa_pdm || 
    editingItem.subprograma_pdm || 
    editingItem.proyecto_pdm
  ))
  
  // Cargar datos existentes en los campos correspondientes
}
```

### Modo Creación:
```javascript
else {
  // Reset para nuevo item
  setIncluirPlanDecenal(false)
  setIncluirPDM(false)
  // Limpiar todos los campos
}
```

## Validaciones del Formulario

### Validaciones por Sección:

1. **Información Básica**: Campos obligatorios + validación de fechas
2. **Información Demográfica**: Validación de números positivos
3. **Información Específica**: Todos los campos obligatorios
4. **Plan Decenal**: Opcional, pero si se incluye, debe completarse la cascada
5. **PDM**: Opcional, pero si se incluye, debe completarse la cascada

### Lógica de Validación:
```javascript
const isSeccionBasicaCompleta = nombre && descripcion && fechaInicio && fechaFin && estado && prioridad
const isSeccionEspecificaCompleta = objetivoGeneral && objetivosEspecificos && metodologia && recursos && indicadores && responsables
const isSeccionDecenalCompleta = !incluirPlanDecenal || (selectedMetaDecenal && selectedMacroobjetivoDecenal && selectedObjetivoDecenal)
const isSeccionPDMCompleta = !incluirPDM || (selectedProgramaPDM && selectedSubprogramaPDM && selectedProyectoPDM)
```

## Componentes UI Utilizados

### Componentes Principales:
- **Collapsible**: Para secciones desplegables
- **CollapsibleTrigger**: Encabezados de sección
- **CollapsibleContent**: Contenido de cada sección
- **Badge**: Indicadores de completitud
- **Button**: Botones de descarga y acciones
- **Input**: Campos de texto
- **Select**: Dropdowns
- **Checkbox**: Checkboxes de inclusión

### Iconos Utilizados:
- **ChevronDown/ChevronRight**: Indicadores de expansión
- **CheckCircle**: Indicador de completitud
- **Download**: Botón de descarga

## Estilos y Diseño

### Esquema de Colores:
- **Plan Decenal**: Azul (`bg-blue-50`, `border-blue-200`, `text-blue-900`)
- **PDM**: Púrpura (`bg-purple-50`, `border-purple-200`, `text-purple-900`)
- **Completitud**: Verde para badges de sección completa

### Layout:
- **Grid responsivo**: `grid-cols-1 md:grid-cols-2`
- **Espaciado consistente**: `space-y-4`, `gap-4`
- **Bordes redondeados**: `rounded-lg`

## Integración con Base de Datos

### Campos de la Tabla `plan_accion`:

#### Información Básica:
- `nombre`, `descripcion`, `fecha_inicio`, `fecha_fin`, `estado`, `prioridad`

#### Información Demográfica:
- `grupo_etareo`, `grupo_poblacion`, `zona`, `grupo_etnico`, `cantidad`

#### Información Específica:
- `objetivo_general`, `objetivos_especificos`, `metodologia`, `recursos_necesarios`, `indicadores_exito`, `responsables`

#### Plan Decenal:
- `meta_decenal`, `macroobjetivo_decenal`, `objetivo_decenal`

#### PDM:
- `programa_pdm`, `subprograma_pdm`, `proyecto_pdm`

## Funcionalidades Adicionales

### Exportación de Datos:
- **Plan Decenal**: Descarga JSON con estructura específica
- **PDM**: Descarga JSON con estructura específica
- **Formato**: JSON legible con indentación

### Limpieza Automática:
- Al desmarcar checkboxes, se limpian automáticamente los campos relacionados
- Previene datos inconsistentes en el formulario

### Experiencia de Usuario:
- **Navegación intuitiva**: Secciones desplegables
- **Feedback visual**: Indicadores de completitud
- **Validación en tiempo real**: Estados de validación
- **Accesibilidad**: Labels apropiados y estructura semántica

## Consideraciones Técnicas

### Performance:
- **Renderizado condicional**: Solo se renderizan campos cuando son necesarios
- **Memoización**: Uso de useCallback para funciones de manejo de eventos
- **Optimización de re-renders**: Estados locales para evitar renders innecesarios

### Mantenibilidad:
- **Separación de responsabilidades**: Lógica separada por secciones
- **Código reutilizable**: Componentes UI consistentes
- **Documentación**: Comentarios en código para funcionalidades complejas

### Escalabilidad:
- **Estructura modular**: Fácil agregar nuevas secciones
- **Configuración externa**: Datos de dropdowns desde constantes
- **Tipado fuerte**: TypeScript para prevenir errores

## Archivos Relacionados

- **Componente principal**: `components/plan-accion/plan-accion-form-sections.tsx`
- **Tipos**: `types/plan-accion.ts`
- **Constantes**: `constants/areas.ts`
- **Hooks**: `hooks/use-plan-accion.ts`
- **Esquema DB**: `docs/database-schema.md`