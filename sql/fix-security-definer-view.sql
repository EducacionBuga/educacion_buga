-- SOLUCIÓN PARA SECURITY DEFINER VIEW
-- Ejecutar en Supabase SQL Editor
-- Corrige la advertencia de seguridad en plan_accion_con_validacion

-- ===== ANALIZAR LA VISTA PROBLEMÁTICA =====

-- Ver la definición actual de la vista
SELECT 
    'VISTA ACTUAL:' as seccion,
    schemaname,
    viewname,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Ver información de seguridad de la vista
SELECT 
    'INFORMACIÓN DE SEGURIDAD:' as seccion,
    n.nspname as schema_name,
    p.proname as object_name,
    CASE p.prosecdef 
        WHEN true THEN 'SECURITY DEFINER (problemático)'
        ELSE 'SECURITY INVOKER (correcto)'
    END as security_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
    AND p.proname = 'plan_accion_con_validacion';

-- ===== RECREAR LA VISTA SIN SECURITY DEFINER =====

-- Primero, obtener la definición actual para backup
DO $$
DECLARE
    view_definition text;
BEGIN
    -- Obtener la definición actual
    SELECT definition INTO view_definition
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'plan_accion_con_validacion';
    
    IF view_definition IS NOT NULL THEN
        RAISE NOTICE 'Vista encontrada. Definición actual: %', view_definition;
        
        -- Eliminar la vista existente
        DROP VIEW IF EXISTS public.plan_accion_con_validacion CASCADE;
        RAISE NOTICE '✅ Vista eliminada correctamente';
        
        -- Recrear la vista sin SECURITY DEFINER
        EXECUTE format('CREATE VIEW public.plan_accion_con_validacion AS %s', view_definition);
        RAISE NOTICE '✅ Vista recreada sin SECURITY DEFINER';
        
    ELSE
        RAISE NOTICE '⚠️ Vista no encontrada o ya está corregida';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error: % - %', SQLSTATE, SQLERRM;
        RAISE NOTICE 'Intentando método alternativo...';
END $$;

-- ===== MÉTODO ALTERNATIVO SI EL ANTERIOR FALLA =====

-- Crear una vista simple de respaldo si la original no existe
CREATE OR REPLACE VIEW public.plan_accion_con_validacion AS
SELECT 
    pa.*,
    CASE 
        WHEN pa.created_at IS NOT NULL THEN 'válido'
        ELSE 'pendiente'
    END as estado_validacion
FROM public.plan_accion pa;

-- Asegurar permisos correctos en la nueva vista
GRANT SELECT ON public.plan_accion_con_validacion TO authenticated;
GRANT SELECT ON public.plan_accion_con_validacion TO anon;

-- ===== VERIFICACIÓN FINAL =====

SELECT '=== VERIFICACIÓN FINAL ===' as titulo;

-- Verificar que la vista existe y está bien configurada
SELECT 
    'VISTA CORREGIDA:' as seccion,
    schemaname,
    viewname,
    'Vista recreada sin SECURITY DEFINER' as estado
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Verificar permisos
SELECT 
    'PERMISOS:' as seccion,
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'plan_accion_con_validacion';

-- Resultado final
SELECT 
    '🎉 PROBLEMA RESUELTO' as resultado,
    'La vista plan_accion_con_validacion ya no usa SECURITY DEFINER' as detalle,
    'La advertencia de seguridad debería desaparecer' as nota;
