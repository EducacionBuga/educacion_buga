# Guía de Validaciones Anti-Duplicación

## 🎯 **Objetivo**

Evitar duplicaciones en los registros de base de datos implementando validaciones robustas en todos los endpoints que crean o modifican datos.

## ✅ **Patrones de Validación Implementados**

### **1. Validación en Lista de Chequeo - Registros**

**Archivo:** `app/api/lista-chequeo/registros/route.ts`

```typescript
// ✅ PATRÓN CORRECTO - Verificar antes de insertar
export async function POST(request: NextRequest) {
  const { area_id, numero_contrato, contratista } = await request.json()

  // 1. Validar campos requeridos
  if (!area_id || !numero_contrato || !contratista) {
    return NextResponse.json(
      { error: 'Se requieren área, número de contrato y contratista' },
      { status: 400 }
    )
  }

  // 2. Verificar duplicados ANTES de insertar
  const { data: existing, error: checkError } = await supabase
    .from('lista_chequeo_registros')
    .select('id')
    .eq('dependencia', area_id)
    .eq('numero_contrato', numero_contrato)
    .single()

  // 3. Manejar errores de verificación
  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json(
      { error: 'Error al verificar registro existente' },
      { status: 500 }
    )
  }

  // 4. Rechazar si ya existe
  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe un registro con este número de contrato en esta área' },
      { status: 409 } // Conflict
    )
  }

  // 5. Solo entonces crear el registro
  const { data, error } = await supabase
    .from('lista_chequeo_registros')
    .insert({ /* datos */ })
    .select()
    .single()
}
```

### **2. Validación en Checklist - Respuestas**

**Archivo:** `app/api/checklist/save-data/route.ts`

```typescript
// ✅ PATRÓN UPSERT - Actualizar si existe, crear si no
for (const item of items) {
  // 1. Verificar si ya existe
  const { data: existingResponse, error: checkError } = await supabase
    .from("lista_chequeo_respuestas")
    .select("id")
    .eq("area_id", areaId)
    .eq("item_id", item.id)
    .maybeSingle()

  if (existingResponse) {
    // 2. Actualizar existente
    const { error: updateError } = await supabase
      .from("lista_chequeo_respuestas")
      .update({
        respuesta: respuesta,
        observaciones: item.observaciones || '',
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingResponse.id)
  } else {
    // 3. Crear nuevo
    const { error: insertError } = await supabase
      .from("lista_chequeo_respuestas")
      .insert({
        id: uuidv4(),
        area_id: areaId,
        item_id: item.id,
        respuesta: respuesta,
        observaciones: item.observaciones || '',
      })
  }
}
```

## 🔧 **Implementación en Otros Endpoints**

### **Plan de Acción - Upload**

**Archivo:** `app/api/plan-accion/upload/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const activityId = formData.get("activityId") as string
  const name = formData.get("name") as string

  // ✅ AGREGAR: Verificar duplicados por actividad y nombre
  const { data: existing, error: checkError } = await supabase
    .from("plan_accion_adjuntos")
    .select("id")
    .eq("actividad_id", activityId)
    .eq("nombre", name)
    .eq("estado", "activo")
    .single()

  if (checkError && checkError.code !== 'PGRST116') {
    return NextResponse.json(
      { error: 'Error al verificar adjunto existente' },
      { status: 500 }
    )
  }

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe un adjunto con este nombre para esta actividad' },
      { status: 409 }
    )
  }

  // Continuar con la inserción...
}
```

### **Informes - Upload**

**Archivo:** `app/api/informes/upload/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const { areaId, periodo, tipoInforme } = await request.json()

  // ✅ AGREGAR: Verificar duplicados por área, período y tipo
  const { data: existing, error: checkError } = await supabase
    .from("informes_ejecucion")
    .select("id")
    .eq("area_id", areaId)
    .eq("periodo", periodo)
    .eq("tipo_informe", tipoInforme)
    .eq("status", "active")
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe un informe de este tipo para este período en esta área' },
      { status: 409 }
    )
  }

  // Continuar con la inserción...
}
```

### **Registros Fotográficos**

**Archivo:** `app/api/registros/upload/route.ts`

```typescript
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const areaId = formData.get("areaId") as string
  const titulo = formData.get("titulo") as string
  const fecha = formData.get("fecha") as string

  // ✅ AGREGAR: Verificar duplicados por área, título y fecha
  const { data: existing, error: checkError } = await supabase
    .from("registros_fotograficos")
    .select("id")
    .eq("area_id", areaId)
    .eq("titulo", titulo)
    .eq("fecha", fecha)
    .single()

  if (existing) {
    return NextResponse.json(
      { error: 'Ya existe un registro fotográfico con este título para esta fecha en esta área' },
      { status: 409 }
    )
  }

  // Continuar con la inserción...
}
```

## 🛡️ **Validaciones a Nivel de Base de Datos**

### **Constraints UNIQUE**

```sql
-- Lista de chequeo registros
ALTER TABLE lista_chequeo_registros 
ADD CONSTRAINT unique_contrato_por_area 
UNIQUE (dependencia, numero_contrato);

-- Plan de acción adjuntos
ALTER TABLE plan_accion_adjuntos 
ADD CONSTRAINT unique_adjunto_por_actividad 
UNIQUE (actividad_id, nombre) 
WHERE estado = 'activo';

-- Informes de ejecución
ALTER TABLE informes_ejecucion 
ADD CONSTRAINT unique_informe_por_periodo 
UNIQUE (area_id, periodo, tipo_informe) 
WHERE status = 'active';

-- Registros fotográficos
ALTER TABLE registros_fotograficos 
ADD CONSTRAINT unique_registro_por_fecha 
UNIQUE (area_id, titulo, fecha);
```

### **Triggers de Validación**

```sql
-- Función para validar duplicados
CREATE OR REPLACE FUNCTION validate_no_duplicates()
RETURNS TRIGGER AS $$
BEGIN
  -- Validaciones específicas por tabla
  IF TG_TABLE_NAME = 'lista_chequeo_registros' THEN
    IF EXISTS (
      SELECT 1 FROM lista_chequeo_registros 
      WHERE dependencia = NEW.dependencia 
      AND numero_contrato = NEW.numero_contrato 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    ) THEN
      RAISE EXCEPTION 'Ya existe un registro con este número de contrato en esta área';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger
CREATE TRIGGER validate_duplicates_before_insert_update
  BEFORE INSERT OR UPDATE ON lista_chequeo_registros
  FOR EACH ROW EXECUTE FUNCTION validate_no_duplicates();
```

## 📋 **Checklist de Implementación**

### **Para cada endpoint POST/PUT:**

- [ ] **Validar campos requeridos** antes de cualquier operación
- [ ] **Verificar duplicados** con consulta SELECT específica
- [ ] **Manejar errores** de verificación apropiadamente
- [ ] **Retornar 409 Conflict** si ya existe
- [ ] **Usar transacciones** para operaciones complejas
- [ ] **Logs detallados** para debugging
- [ ] **Mensajes de error claros** para el usuario

### **Campos típicos para validar duplicados:**

- **Lista de chequeo:** `area_id + numero_contrato`
- **Plan de acción:** `actividad_id + nombre_adjunto`
- **Informes:** `area_id + periodo + tipo_informe`
- **Registros fotográficos:** `area_id + titulo + fecha`
- **Usuarios:** `email`
- **Documentos:** `carpeta_id + nombre_archivo`

## 🚨 **Códigos de Error Estándar**

```typescript
// Validación de campos
if (!requiredField) {
  return NextResponse.json(
    { error: 'Campo requerido faltante' },
    { status: 400 } // Bad Request
  )
}

// Error en verificación
if (checkError && checkError.code !== 'PGRST116') {
  return NextResponse.json(
    { error: 'Error al verificar registro existente' },
    { status: 500 } // Internal Server Error
  )
}

// Duplicado encontrado
if (existing) {
  return NextResponse.json(
    { error: 'Ya existe un registro con estos datos' },
    { status: 409 } // Conflict
  )
}

// Error en inserción
if (insertError) {
  return NextResponse.json(
    { error: 'Error al crear el registro' },
    { status: 500 } // Internal Server Error
  )
}
```

## 🎯 **Beneficios de esta Implementación**

### **✅ Integridad de datos:**
- No hay registros duplicados
- Datos consistentes en toda la aplicación
- Validaciones tanto en frontend como backend

### **✅ Experiencia de usuario:**
- Mensajes de error claros y específicos
- Prevención de errores antes de que ocurran
- Feedback inmediato sobre duplicados

### **✅ Mantenimiento:**
- Código consistente en todos los endpoints
- Fácil debugging con logs detallados
- Validaciones centralizadas

### **✅ Seguridad:**
- Prevención de ataques de duplicación
- Validación a múltiples niveles
- Constraints de base de datos como última línea de defensa

## 🔧 **Próximos Pasos**

1. **Auditar todos los endpoints** que crean registros
2. **Implementar validaciones** según los patrones mostrados
3. **Agregar constraints** de base de datos
4. **Crear triggers** de validación
5. **Probar exhaustivamente** cada endpoint
6. **Documentar** las validaciones específicas de cada módulo

**¡Con estas validaciones, el sistema será robusto y libre de duplicaciones!** 🛡️✅