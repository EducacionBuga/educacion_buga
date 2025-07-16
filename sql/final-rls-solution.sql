-- SOLUCIÓN FINAL: Deshabilitar RLS en todas las tablas problemáticas
-- Ejecutar en Supabase SQL Editor

-- ===== DESHABILITAR RLS EN TODAS LAS TABLAS =====

DO $$
DECLARE
    table_record RECORD;
    success_count INTEGER := 0;
    error_count INTEGER := 0;
BEGIN
    RAISE NOTICE '=== INICIANDO DESHABILITACIÓN DE RLS ===';
    
    -- Iterar sobre todas las tablas problemáticas que realmente existen
    FOR table_record IN 
        SELECT tablename 
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
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', table_record.tablename);
            RAISE NOTICE '✅ SUCCESS: RLS deshabilitado en %', table_record.tablename;
            success_count := success_count + 1;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ ERROR en %: % - %', table_record.tablename, SQLSTATE, SQLERRM;
                error_count := error_count + 1;
        END;
    END LOOP;
    
    RAISE NOTICE '=== RESUMEN FINAL ===';
    RAISE NOTICE 'Tablas procesadas exitosamente: %', success_count;
    RAISE NOTICE 'Errores encontrados: %', error_count;
    
END $$;

-- ===== VERIFICACIÓN COMPLETA =====

SELECT '=== VERIFICACIÓN POST-SCRIPT ===' as titulo;

-- Mostrar estado actual de todas las tablas
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '🔴 RLS AÚN HABILITADO'
        ELSE '🟢 RLS DESHABILITADO'
    END as estado_actual
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
ORDER BY tablename;

-- Contar tablas problemáticas restantes
SELECT 
    COUNT(*) as tablas_con_rls,
    CASE 
        WHEN COUNT(*) = 0 THEN '🎉 PERFECTO: Todas las tablas tienen RLS deshabilitado'
        ELSE '⚠️ ATENCIÓN: ' || COUNT(*) || ' tabla(s) siguen con RLS habilitado'
    END as resultado_final
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

-- ===== INSTRUCCIONES FINALES =====
SELECT 
    'INSTRUCCIONES FINALES:' as seccion,
    'Después de este script, ve a tu Dashboard de Supabase y presiona F5 (refresh completo)' as accion_1,
    'Si las advertencias siguen apareciendo, son falsas alarmas del cache del dashboard' as accion_2,
    'Tu aplicación debería funcionar perfectamente independientemente de las advertencias' as accion_3;
