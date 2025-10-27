# 🔧 SOLUCIÓN: Los datos del Plan Decenal y PDM no se ven en /plan-accion

**Fecha:** 27 de Octubre, 2025  
**Problema:** Los datos están guardados en la BD pero no se muestran en la interfaz

---

## 📊 **ANÁLISIS DEL PROBLEMA**

### ✅ **Lo que SÍ funciona:**
- Los datos **SE ESTÁN GUARDANDO** correctamente en Supabase
- Todos los campos están presentes: `meta_docenal`, `macroobjetivo_docenal`, `objetivo_docenal`, `programa_pdm`, `subprograma_pdm`, `proyecto_pdm`
- El JSON exportado muestra todos los datos correctos

### ❌ **Lo que NO funciona:**
- Los datos **NO SE ESTÁN CARGANDO** en la interfaz
- Mensaje: "No se ha asignado información del Plan Decenal"
- Mensaje: "No se ha asignado información del PDM 2024-2027"

---

## 🔍 **CAUSA RAÍZ**

El problema tiene **2 causas**:

### 1️⃣ **Error de Login (Problema Principal)**
```
Error: ❌ Error en login: "Invalid login credentials"
```

**Razón:** No puedes acceder a los datos porque **no estás autenticado**. Supabase requiere autenticación para cargar datos de la tabla `plan_accion`.

### 2️⃣ **Componente usaba estado local desconectado (YA RESUELTO)**
- El componente `plan-accion-area-mejorado.tsx` tenía estado local que no se sincronizaba
- ✅ **SOLUCIONADO:** Ahora usa directamente los items del servicio que se actualizan en tiempo real

---

## ✅ **SOLUCIÓN PASO A PASO**

### **PASO 1: Verificar/Crear Credenciales de Usuario**

#### Opción A: Usar credenciales existentes
Si ya tienes un usuario creado en Supabase, usa esas credenciales.

#### Opción B: Crear nuevo usuario en Supabase

1. **Ir al Dashboard de Supabase:**
   - URL: https://supabase.com/dashboard
   - Ir a tu proyecto

2. **Ir a Authentication → Users:**
   - Click en "Add user" → "Create new user"

3. **Crear usuario con estos datos:**
   ```
   Email: admin@educacionbuga.gov.co
   Password: Admin123!
   Auto Confirm User: ✅ (marcado)
   ```

4. **Agregar rol en la tabla `usuarios`:**
   - Ir a "Table Editor" → tabla `usuarios`
   - Click en "Insert" → "Insert row"
   - Campos:
     ```
     id: [copiar el UUID del usuario creado]
     email: admin@educacionbuga.gov.co
     nombre: Administrador
     rol: ADMIN
     area_id: [ID de Calidad Educativa]
     activo: true
     ```

### **PASO 2: Iniciar Sesión**

1. **Abrir en navegador:**
   ```
   http://localhost:3000
   ```

2. **Iniciar sesión con las credenciales:**
   ```
   Email: admin@educacionbuga.gov.co
   Password: Admin123!
   ```

3. **Verificar que el login sea exitoso:**
   - Deberías ser redirigido al dashboard
   - No debería haber errores en la consola

### **PASO 3: Verificar Carga de Datos**

1. **Ir a Plan de Acción:**
   ```
   http://localhost:3000/dashboard/calidad-educativa/plan-accion
   ```

2. **Abrir Consola del Navegador:**
   - Presiona `F12`
   - Ve a la pestaña "Console"

3. **Buscar estos logs:**
   ```
   🔍 DATOS CRUDOS DE SUPABASE: {...}
   🔍 DATOS DESPUÉS DEL MAPEO: {...}
   🔄 planAccionItems actualizados: {...}
   📊 PlanCard - Item data: {...}
   ```

4. **Verificar los datos en los logs:**
   - `meta_docenal` debe aparecer
   - `macroobjetivo_docenal` debe aparecer
   - `objetivo_docenal` debe aparecer
   - `programa_pdm` debe aparecer
   - `subprograma_pdm` debe aparecer
   - `proyecto_pdm` debe aparecer

### **PASO 4: Si los datos NO aparecen en los logs**

Si después de hacer login los logs muestran que los campos están vacíos o `undefined`, el problema puede ser:

#### A. Política RLS (Row Level Security) en Supabase

Verifica las políticas RLS en la tabla `plan_accion`:

1. **Ir a Supabase Dashboard**
2. **Table Editor → plan_accion → RLS**
3. **Debe tener una política SELECT como:**
   ```sql
   -- Permitir SELECT si el usuario está autenticado
   CREATE POLICY "Usuarios autenticados pueden ver plan_accion"
   ON plan_accion FOR SELECT
   TO authenticated
   USING (true);
   ```

4. **Si no existe, créala:**
   ```sql
   -- En SQL Editor
   ALTER TABLE plan_accion ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Usuarios autenticados pueden ver plan_accion"
   ON plan_accion FOR SELECT
   TO authenticated
   USING (true);

   CREATE POLICY "Usuarios autenticados pueden insertar plan_accion"
   ON plan_accion FOR INSERT
   TO authenticated
   WITH CHECK (true);

   CREATE POLICY "Usuarios autenticados pueden actualizar plan_accion"
   ON plan_accion FOR UPDATE
   TO authenticated
   USING (true);

   CREATE POLICY "Usuarios autenticados pueden eliminar plan_accion"
   ON plan_accion FOR DELETE
   TO authenticated
   USING (true);
   ```

#### B. Verificar que los campos existen en la tabla

1. **Ir a Table Editor → plan_accion**
2. **Verificar que existan estas columnas:**
   - `meta_docenal` (tipo: text)
   - `macroobjetivo_docenal` (tipo: text)
   - `objetivo_docenal` (tipo: text)
   - `programa_pdm` (tipo: text)
   - `subprograma_pdm` (tipo: text)
   - `proyecto_pdm` (tipo: text)

3. **Si faltan, agregarlas:**
   ```sql
   ALTER TABLE plan_accion 
   ADD COLUMN IF NOT EXISTS meta_docenal TEXT,
   ADD COLUMN IF NOT EXISTS macroobjetivo_docenal TEXT,
   ADD COLUMN IF NOT EXISTS objetivo_docenal TEXT,
   ADD COLUMN IF NOT EXISTS programa_pdm TEXT,
   ADD COLUMN IF NOT EXISTS subprograma_pdm TEXT,
   ADD COLUMN IF NOT EXISTS proyecto_pdm TEXT;
   ```

---

## 🧪 **VERIFICACIÓN FINAL**

Una vez que hayas hecho login correctamente:

### ✅ **Lo que DEBES ver:**

1. **En /plan-accion:**
   - Tarjetas con tus planes de acción
   - Pestaña "Plan Decenal" con datos
   - Pestaña "PDM 2024-2027" con datos

2. **En la Consola del navegador:**
   ```javascript
   🔍 DATOS CRUDOS DE SUPABASE: {
     count: 1,
     firstItem: { ... },
     campos_docenal: {
       meta_docenal: "MODELO EDUCATIVO DE ALTA CALIDAD",
       macroobjetivo_docenal: "1. Administración y gestión...",
       objetivo_docenal: "Objetivo2: Sistema de educación..."
     },
     campos_pdm: {
       programa_pdm: "Calidad y fomento de la educación superior",
       subprograma_pdm: "Avanzando en educación superior...",
       proyecto_pdm: "Subsidiar estudiantes..."
     }
   }
   ```

3. **En las tarjetas individuales:**
   - Click en una tarjeta
   - Ve a la pestaña "🎯 Plan Decenal"
   - Deberías ver:
     - Plan Decenal: "MODELO EDUCATIVO DE ALTA CALIDAD"
     - Macroobjetivo: "1. Administración y gestión..."
     - Objetivo Decenal: "Objetivo2: Sistema de educación..."
   - Ve a la pestaña "📊 PDM 2024-2027"
   - Deberías ver:
     - Programa PDM: "Calidad y fomento de la educación superior"
     - Subprograma PDM: "Avanzando en educación superior..."
     - Proyecto PDM: "Subsidiar estudiantes..."

---

## 🆘 **SI AÚN NO FUNCIONA**

Si después de seguir todos los pasos los datos aún no aparecen:

1. **Copia los logs de la consola** (todo lo que empiece con 🔍, 🔄, 📊)
2. **Toma screenshot** de la interfaz mostrando "No se ha asignado información"
3. **Verifica en Supabase Table Editor** que los datos estén guardados
4. **Comparte** esa información para diagnosticar más a fondo

---

## 📝 **RESUMEN**

| Paso | Descripción | Estado |
|------|-------------|--------|
| 1 | Servidor corriendo | ✅ http://localhost:3000 |
| 2 | Datos guardados en BD | ✅ Confirmado en JSON |
| 3 | Componente actualizado | ✅ Usa items reactivos |
| 4 | Login funcional | ❌ **PENDIENTE** |
| 5 | Políticas RLS | ⚠️ **VERIFICAR** |
| 6 | Datos cargando en UI | ⏳ **Después del login** |

---

## 🎯 **PRÓXIMOS PASOS**

1. **AHORA MISMO:** Crear usuario o usar credenciales existentes
2. **HACER LOGIN:** Iniciar sesión en http://localhost:3000
3. **VERIFICAR:** Ir a /dashboard/calidad-educativa/plan-accion
4. **REVISAR LOGS:** Abrir consola (F12) y verificar datos
5. **CONFIRMAR:** Los datos deben aparecer correctamente

---

**El servidor ya está corriendo en:** http://localhost:3000

**¡Prueba hacer login ahora y revisa si los datos aparecen!**
