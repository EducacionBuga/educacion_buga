# 🗃️ GUÍA COMPLETA DE EJECUCIÓN SQL EN SUPABASE

## 📋 **LISTA DE ARCHIVOS A EJECUTAR EN ORDEN**

### **Paso 1: Estructura Base**
```sql
-- Archivo: paso1-estructura-base.sql
-- Descripción: Crear tablas principales
-- ⏱️ Tiempo estimado: 2-3 minutos
```

### **Paso 2: Categorías y Etapas**
```sql
-- Archivo: paso2-categorias-etapas.sql
-- Descripción: Insertar 4 categorías de contratos y 4 etapas
-- ⏱️ Tiempo estimado: 1 minuto
```

### **Paso 3: Ítems SAMC**
```sql
-- Archivo: paso3-items-samc.sql
-- Descripción: Insertar 51 ítems para Selección Abreviada de Menor Cuantía
-- ⏱️ Tiempo estimado: 2 minutos
```

### **Paso 4: Ítems Mínima Cuantía**
```sql
-- Archivo: paso4-items-minima-cuantia.sql
-- Descripción: Insertar 51 ítems para Invitación Pública de Mínima Cuantía
-- ⏱️ Tiempo estimado: 2 minutos
```

### **Paso 5: Ítems Contrato Interadministrativo**
```sql
-- Archivo: paso5-items-interadministrativo.sql
-- Descripción: Insertar 29 ítems para Contrato Interadministrativo
-- ⏱️ Tiempo estimado: 1 minuto
```

### **Paso 6: Ítems Prestación de Servicios**
```sql
-- Archivo: paso6-items-prestacion-servicios.sql
-- Descripción: Insertar 51 ítems para Contrato de Prestación de Servicios
-- ⏱️ Tiempo estimado: 2 minutos
```

### **Paso 7: Verificación y RLS**
```sql
-- Archivo: paso7-verificacion-rls.sql
-- Descripción: Activar seguridad RLS y crear políticas
-- ⏱️ Tiempo estimado: 2 minutos
```

---

## 🚀 **INSTRUCCIONES DE EJECUCIÓN EN SUPABASE**

### **1. Acceder al Editor SQL**
1. Ir a tu proyecto en [supabase.com](https://supabase.com)
2. En el menú lateral, clic en **"SQL Editor"**
3. Clic en **"New query"**

### **2. Ejecutar los Scripts en Orden**

#### **PASO 1: Estructura Base**
1. Abrir el archivo `paso1-estructura-base.sql`
2. Copiar todo el contenido
3. Pegarlo en el editor SQL de Supabase
4. Clic en **"Run"** (▶️)
5. ✅ **Verificar:** Debes ver el mensaje "PASO 1 COMPLETADO"

#### **PASO 2: Categorías y Etapas**
1. Abrir el archivo `paso2-categorias-etapas.sql`
2. Copiar y pegar en una nueva query
3. Ejecutar
4. ✅ **Verificar:** Debe mostrar 4 categorías y 4 etapas insertadas

#### **PASO 3-6: Ítems por Categoría**
1. Ejecutar cada archivo de ítems **uno por uno**
2. Esperar a que termine cada ejecución antes del siguiente
3. ✅ **Verificar:** Cada script debe mostrar "PASO X COMPLETADO"

#### **PASO 7: Verificación Final**
1. Ejecutar `paso7-verificacion-rls.sql`
2. ✅ **Verificar:** Debe mostrar resumen completo y "BASE DE DATOS LISTA"

---

## 📊 **RESULTADOS ESPERADOS**

Al finalizar, debes tener:

### **📁 Tablas Creadas (5)**
- ✅ `lista_chequeo_categorias` (4 registros)
- ✅ `lista_chequeo_etapas` (4 registros)  
- ✅ `lista_chequeo_items_maestros` (182 registros total)
- ✅ `lista_chequeo_registros` (vacía, para producción)
- ✅ `lista_chequeo_respuestas` (vacía, para producción)

### **📋 Ítems por Categoría**
- 🔸 **SAMC:** 51 ítems (15 precontractual + 18 contractual + 18 ejecución)
- 🔸 **MÍNIMA CUANTÍA:** 51 ítems (15 precontractual + 18 contractual + 18 ejecución)  
- 🔸 **INTERADMINISTRATIVO:** 29 ítems (5 precontractual + 12 contractual + 12 ejecución)
- 🔸 **PRESTACIÓN SERVICIOS:** 51 ítems (5 precontractual + 16 contractual + 18 ejecución + 12 adición)

### **🔒 Seguridad RLS**
- ✅ Row Level Security activado en todas las tablas
- ✅ Políticas por dependencia configuradas
- ✅ Acceso administrativo configurado

---

## ⚠️ **PROBLEMAS COMUNES Y SOLUCIONES**

### **Error: "relation already exists"**
**Solución:** Las tablas ya existen. Puedes continuar con el siguiente paso.

### **Error: "permission denied"**
**Solución:** Asegúrate de estar conectado como propietario del proyecto.

### **Error: "syntax error"**
**Solución:** Verifica que copiaste el script completo sin cortarlo.

### **Error de timeout**
**Solución:** Los scripts grandes pueden tardar. Espera hasta 5 minutos.

---

## 🎯 **VERIFICACIÓN FINAL**

Ejecuta esta consulta para verificar todo:

```sql
-- Consulta de verificación final
SELECT 'Resumen de Base de Datos Lista de Chequeo' as titulo;

SELECT 
    'Categorías' as tipo,
    COUNT(*) as cantidad,
    STRING_AGG(nombre, ', ' ORDER BY orden) as listado
FROM lista_chequeo_categorias
UNION ALL
SELECT 
    'Etapas' as tipo,
    COUNT(*) as cantidad,
    STRING_AGG(nombre, ', ' ORDER BY orden) as listado
FROM lista_chequeo_etapas;

SELECT 
    c.nombre as categoria,
    COUNT(im.id) as total_items
FROM lista_chequeo_categorias c
LEFT JOIN lista_chequeo_items_maestros im ON c.id = im.categoria_id
GROUP BY c.nombre, c.orden
ORDER BY c.orden;
```

**Resultado esperado:**
- 4 categorías: SAMC, MINIMA CUANTÍA, CONTRATO INTERADMINISTRATIVO, PRESTACIÓN DE SERVICIOS
- 4 etapas: PRECONTRACTUAL, CONTRACTUAL, EJECUCION, ADICION
- Total ítems: 182

---

## 🎉 **¡LISTO PARA PRODUCCIÓN!**

Una vez completados todos los pasos, tu sistema estará listo para:

1. ✅ **Crear registros de contratos** por dependencia
2. ✅ **Guardar respuestas** de listas de chequeo
3. ✅ **Exportar a Excel** con todos los datos oficiales
4. ✅ **Seguridad multi-tenant** por dependencia
5. ✅ **182 ítems oficiales** según documentos gubernamentales

**¡Tu sistema de listas de chequeo está completamente configurado!** 🚀
