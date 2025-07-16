-- DIAGNÓSTICO PROFUNDO DE LOS PROBLEMAS RLS
-- Ejecutar en Supabase SQL Editor para entender qué está pasando

SELECT '=== DIAGNÓSTICO COMPLETO RLS ===' as titulo;

-- 1. Verificar si las tablas realmente existen y su tipo
SELECT 
    'PASO 1: Verificar existencia de objetos' as paso;

SELECT 
    'TABLE' as tipo,
    tablename as nombre,
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'SÍ - Problemático'
        ELSE 'NO - Correcto'
    END as estado
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename IN (
        'lista_chequeo_respuestas',
        'lista_chequeo_etapas',
        'lista_chequeo_items_maestros',
        'lista_chequeo_item_categorias',
        'lista_chequeo_categorias',
        'pdm_programas',
        'pdm_subprogramas',
        'pdm_proyectos'
    )
UNION ALL
SELECT 
    'VIEW' as tipo,
    viewname as nombre,
    NULL as rls_habilitado,
    'N/A - Es vista' as estado
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname IN (
        'plan_accion_con_validacion',
        'lista_chequeo_respuestas',
        'lista_chequeo_etapas',
        'lista_chequeo_items_maestros',
        'lista_chequeo_item_categorias',
        'lista_chequeo_categorias',
        'pdm_programas',
        'pdm_subprogramas',
        'pdm_proyectos'
    )
ORDER BY tipo, nombre;

-- 2. Verificar políticas RLS existentes
SELECT 
    'PASO 2: Políticas RLS activas' as paso;

SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
    AND tablename IN (
        'lista_chequeo_respuestas',
        'lista_chequeo_etapas',
        'lista_chequeo_items_maestros',
        'lista_chequeo_item_categorias',
        'lista_chequeo_categorias',
        'pdm_programas',
        'pdm_subprogramas',
        'pdm_proyectos'
    );

-- 3. Verificar permisos de usuario actual
SELECT 
    'PASO 3: Verificar permisos del usuario actual' as paso;

SELECT 
    current_user as usuario_actual,
    session_user as usuario_sesion,
    current_setting('role') as rol_actual;

-- 4. Intentar un ALTER TABLE manual para ver el error específico
SELECT 
    'PASO 4: Prueba manual (veremos el error específico)' as paso;

-- Función para intentar deshabilitar RLS y capturar el error exacto
CREATE OR REPLACE FUNCTION test_disable_rls(table_name text)
RETURNS text AS $$
DECLARE
    result text;
    table_exists boolean;
BEGIN
    -- Verificar si la tabla existe
    SELECT EXISTS (
        SELECT 1 FROM pg_tables 
        WHERE schemaname = 'public' AND tablename = table_name
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RETURN 'SKIP: ' || table_name || ' no es una tabla (es VIEW o no existe)';
    END IF;
    
    -- Intentar deshabilitar RLS
    BEGIN
        EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_name);
        RETURN 'SUCCESS: RLS deshabilitado en ' || table_name;
    EXCEPTION
        WHEN insufficient_privilege THEN
            RETURN 'ERROR: Sin privilegios para ' || table_name;
        WHEN undefined_table THEN
            RETURN 'ERROR: Tabla ' || table_name || ' no encontrada';
        WHEN OTHERS THEN
            RETURN 'ERROR en ' || table_name || ': ' || SQLSTATE || ' - ' || SQLERRM;
    END;
END;
$$ LANGUAGE plpgsql;

-- Probar con una tabla específica
SELECT test_disable_rls('lista_chequeo_respuestas') as test_resultado;

-- 5. Verificar configuración de RLS a nivel de sistema
SELECT 
    'PASO 5: Configuración del sistema' as paso;

SELECT 
    name,
    setting,
    context,
    short_desc
FROM pg_settings 
WHERE name LIKE '%security%' OR name LIKE '%rls%'
ORDER BY name;

-- Limpiar función de prueba
DROP FUNCTION test_disable_rls(text);

-- RESUMEN
SELECT 
    'RESUMEN: Si ves errores arriba, esa es la causa del problema RLS' as conclusion;
