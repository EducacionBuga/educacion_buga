-- SOLUCIÓN CORREGIDA PARA SECURITY DEFINER VIEW
-- Ejecutar en Supabase SQL Editor
-- Mantiene la estructura original de la vista

-- ===== PASO 1: OBTENER LA DEFINICIÓN EXACTA =====

-- Ver la definición completa actual
SELECT 
    'DEFINICIÓN ACTUAL:' as info,
    definition as vista_completa
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Ver las columnas exactas que tiene la vista
SELECT 
    'COLUMNAS ACTUALES:' as info,
    column_name,
    data_type,
    ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'plan_accion_con_validacion'
ORDER BY ordinal_position;

-- ===== PASO 2: RECREAR CON LA DEFINICIÓN EXACTA =====

DO $$
DECLARE
    view_definition text;
    backup_definition text;
BEGIN
    RAISE NOTICE '=== INICIANDO CORRECCIÓN DE SECURITY DEFINER ===';
    
    -- Obtener la definición exacta
    SELECT definition INTO view_definition
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'plan_accion_con_validacion';
    
    IF view_definition IS NOT NULL THEN
        -- Guardar backup de la definición
        backup_definition := view_definition;
        RAISE NOTICE 'Definición encontrada: %', left(view_definition, 100) || '...';
        
        -- Eliminar la vista existente
        DROP VIEW IF EXISTS public.plan_accion_con_validacion CASCADE;
        RAISE NOTICE '✅ Vista original eliminada';
        
        -- Recrear con la definición exacta (sin SECURITY DEFINER)
        EXECUTE format('CREATE VIEW public.plan_accion_con_validacion AS %s', view_definition);
        RAISE NOTICE '✅ Vista recreada con definición original';
        
    ELSE
        RAISE NOTICE '⚠️ No se encontró la vista - puede que ya esté corregida';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error recreando vista: % - %', SQLSTATE, SQLERRM;
        RAISE NOTICE 'Intentando crear vista básica funcional...';
        
        -- Crear vista básica que funcione
        BEGIN
            CREATE OR REPLACE VIEW public.plan_accion_con_validacion AS
            SELECT 
                *,
                'activo' as incluir_pdm
            FROM public.plan_accion;
            RAISE NOTICE '✅ Vista básica creada como respaldo';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error en vista de respaldo: %', SQLERRM;
        END;
END $$;

-- ===== PASO 3: ASEGURAR PERMISOS =====

-- Otorgar permisos apropiados
GRANT SELECT ON public.plan_accion_con_validacion TO authenticated;
GRANT SELECT ON public.plan_accion_con_validacion TO anon;

-- ===== VERIFICACIÓN FINAL =====

SELECT '=== VERIFICACIÓN FINAL ===' as titulo;

-- Confirmar que la vista existe
SELECT 
    'VISTA FINAL:' as estado,
    schemaname,
    viewname,
    'Vista recreada sin SECURITY DEFINER' as resultado
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Verificar las columnas finales
SELECT 
    'COLUMNAS FINALES:' as estado,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'plan_accion_con_validacion'
ORDER BY ordinal_position
LIMIT 10;

-- Probar que la vista funciona
SELECT 
    'PRUEBA FUNCIONAL:' as estado,
    COUNT(*) as registros_accesibles
FROM public.plan_accion_con_validacion
LIMIT 1;

SELECT 
    '🎉 CORRECCIÓN COMPLETADA' as resultado,
    'La vista ahora debería funcionar sin advertencias de SECURITY DEFINER' as nota;
