-- RESULTADOS SIMPLES Y CLAROS DEL DIAGNÓSTICO RLS
-- Ejecutar en Supabase SQL Editor

-- ===== MOSTRAR SOLO LA INFORMACIÓN CLAVE =====

-- 1. ¿Cuáles son TABLES y cuáles VIEWS?
SELECT 
    'OBJETOS ENCONTRADOS:' as seccion,
    'TABLE' as tipo,
    tablename as nombre,
    CASE WHEN rowsecurity THEN 'RLS HABILITADO' ELSE 'RLS DESHABILITADO' END as estado
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
    'OBJETOS ENCONTRADOS:' as seccion,
    'VIEW' as tipo,
    viewname as nombre,
    'N/A (es vista)' as estado
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

-- 2. Usuario y permisos actuales
SELECT 
    'USUARIO ACTUAL:' as seccion,
    current_user as usuario,
    session_user as sesion,
    'Verificar si es service_role o authenticated' as nota;

-- 3. Contar problemas reales
SELECT 
    'RESUMEN PROBLEMAS:' as seccion,
    COUNT(*) as tablas_con_rls_habilitado,
    CASE 
        WHEN COUNT(*) = 0 THEN 'NO HAY PROBLEMAS REALES'
        ELSE CAST(COUNT(*) AS text) || ' TABLAS CON RLS HABILITADO'
    END as diagnostico
FROM pg_tables 
WHERE schemaname = 'public' 
    AND rowsecurity = true
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

-- 4. Intentar deshabilitar una tabla específica para ver el error
DO $$
DECLARE
    error_message text;
BEGIN
    BEGIN
        -- Intentar con una tabla que sabemos que existe
        IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'lista_chequeo_respuestas') THEN
            ALTER TABLE public.lista_chequeo_respuestas DISABLE ROW LEVEL SECURITY;
            RAISE NOTICE 'SUCCESS: RLS deshabilitado en lista_chequeo_respuestas';
        ELSE
            RAISE NOTICE 'SKIP: lista_chequeo_respuestas no es una tabla';
        END IF;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR: % - %', SQLSTATE, SQLERRM;
    END;
END $$;

-- 5. Verificación final
SELECT 
    'VERIFICACIÓN FINAL:' as seccion,
    tablename,
    CASE WHEN rowsecurity THEN 'SIGUE CON RLS' ELSE 'RLS DESHABILITADO' END as resultado
FROM pg_tables 
WHERE schemaname = 'public' 
    AND tablename = 'lista_chequeo_respuestas';
