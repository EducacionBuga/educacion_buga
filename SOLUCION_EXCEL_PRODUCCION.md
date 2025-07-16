# 🚨 Solución para Error de Exportación Excel en Producción

## Problema Identificado

El error `500: Internal Server Error` al exportar Excel se debe a **variables de entorno faltantes** en el servidor de producción.

## Diagnóstico

Ejecuta este endpoint en tu servidor de producción para verificar la configuración:
```
GET /api/lista-chequeo/export/debug
```

## Variables de Entorno Requeridas

### ✅ Variables Críticas (OBLIGATORIAS)
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### ⚠️ Variables Adicionales (Recomendadas)
```env
NODE_ENV=production
SUPABASE_ANON_KEY=tu_anon_key_aqui
```

## Configuración por Plataforma

### 🔵 Vercel
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las variables requeridas
4. Redeploy tu aplicación

### 🟢 Netlify
1. Ve a tu sitio en Netlify Dashboard
2. Site settings → Environment variables
3. Agrega las variables requeridas
4. Redeploy tu aplicación

### 🐳 Docker
```dockerfile
ENV NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
ENV SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 🖥️ Servidor Propio
```bash
# En tu .env.production o .env.local
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

## Obtener las Claves de Supabase

1. Ve a tu [Panel de Supabase](https://app.supabase.com)
2. Selecciona tu proyecto
3. Settings → API
4. Copia:
   - **URL**: Tu `Project URL`
   - **anon key**: Tu `anon/public key`
   - **service_role key**: Tu `service_role/secret key` (⚠️ MANTÉN ESTO SECRETO)

## Verificación Post-Configuración

1. **Ejecuta el diagnóstico:**
   ```
   curl https://tu-dominio.com/api/lista-chequeo/export/debug
   ```

2. **Verifica la respuesta:**
   ```json
   {
     "diagnostics": {
       "supabaseConnection": true,  // ✅ Debe ser true
       "excelJSVersion": "Working", // ✅ Debe mostrar "Working"
       "templateExists": true,      // ✅ Debe ser true
       "error": null               // ✅ Debe ser null
     },
     "envVars": {
       "SUPABASE_URL": true,       // ✅ Debe ser true
       "SUPABASE_ANON_KEY": true   // ✅ Debe ser true
     }
   }
   ```

3. **Prueba la exportación:**
   ```
   curl https://tu-dominio.com/api/lista-chequeo/export/[ID_REGISTRO]
   ```

## Scripts de Verificación Local

```bash
# Verificar variables de entorno
node scripts/verify-env.js

# Probar condiciones de producción
node scripts/test-production-export.js
```

## Errores Comunes y Soluciones

### Error: "Variables de entorno de Supabase no configuradas"
**Solución:** Configura `NEXT_PUBLIC_SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`

### Error: "Error de conexión a la base de datos"
**Solución:** Verifica que las URLs y claves sean correctas y que Supabase esté accesible

### Error: "Plantilla Excel no encontrada"
**Solución:** Asegúrate de que `/public/document/lista-chequeo.xlsx` esté incluido en el build

## Contacto

Si persisten los problemas, proporciona:
1. Resultado del endpoint `/api/lista-chequeo/export/debug`
2. Logs del servidor de producción
3. Plataforma de hosting utilizada
