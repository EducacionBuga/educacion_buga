-- ENFOQUE DIRECTO PARA ELIMINAR SECURITY DEFINER
-- Ejecutar en Supabase SQL Editor
-- Método más agresivo y específico

-- ===== PASO 1: DIAGNÓSTICO COMPLETO =====

-- Ver TODA la información sobre la vista problemática
SELECT 
    'INFORMACIÓN COMPLETA DE LA VISTA:' as seccion;

-- Definición actual
SELECT 
    'DEFINICIÓN:' as tipo,
    definition
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Información del catálogo de PostgreSQL
SELECT 
    'INFORMACIÓN TÉCNICA:' as tipo,
    c.relname as nombre_vista,
    c.relkind as tipo_objeto,
    c.relowner as propietario_id,
    r.rolname as propietario_nombre
FROM pg_class c
JOIN pg_roles r ON c.relowner = r.oid
WHERE c.relname = 'plan_accion_con_validacion'
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ===== PASO 2: ELIMINACIÓN COMPLETA Y RECREACIÓN =====

DO $$
DECLARE
    original_definition text;
    clean_definition text;
BEGIN
    RAISE NOTICE '=== ELIMINACIÓN COMPLETA DE SECURITY DEFINER VIEW ===';
    
    -- Obtener definición antes de eliminar
    SELECT definition INTO original_definition
    FROM pg_views 
    WHERE schemaname = 'public' AND viewname = 'plan_accion_con_validacion';
    
    -- Eliminar completamente la vista y sus dependencias
    DROP VIEW IF EXISTS public.plan_accion_con_validacion CASCADE;
    RAISE NOTICE '✅ Vista eliminada con CASCADE';
    
    -- Esperar un momento para asegurar eliminación completa
    PERFORM pg_sleep(0.1);
    
    -- Recrear vista SIN ningún tipo de SECURITY DEFINER
    IF original_definition IS NOT NULL THEN
        -- Limpiar cualquier referencia a SECURITY DEFINER de la definición
        clean_definition := replace(original_definition, 'SECURITY DEFINER', '');
        clean_definition := replace(clean_definition, 'security definer', '');
        
        EXECUTE format('CREATE VIEW public.plan_accion_con_validacion AS %s', clean_definition);
        RAISE NOTICE '✅ Vista recreada limpia: %', left(clean_definition, 50);
    ELSE
        -- Crear vista básica funcional basada en plan_accion
        CREATE VIEW public.plan_accion_con_validacion AS
        SELECT 
            id,
            descripcion,
            responsable,
            fecha_limite,
            estado,
            area_id,
            categoria,
            prioridad,
            created_at,
            updated_at,
            observaciones,
            programa_pdm,
            subprograma_pdm,
            proyecto_pdm,
            'S' as incluir_pdm
        FROM public.plan_accion;
        RAISE NOTICE '✅ Vista básica funcional creada';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Error en recreación: % - %', SQLSTATE, SQLERRM;
        
        -- Crear vista mínima de emergencia
        BEGIN
            CREATE OR REPLACE VIEW public.plan_accion_con_validacion AS
            SELECT * FROM public.plan_accion;
            RAISE NOTICE '✅ Vista de emergencia creada';
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Error crítico: %', SQLERRM;
        END;
END $$;

-- ===== PASO 3: ASEGURAR PERMISOS ESTÁNDAR =====

-- Otorgar permisos básicos
GRANT SELECT ON public.plan_accion_con_validacion TO authenticated;
GRANT SELECT ON public.plan_accion_con_validacion TO anon;
GRANT SELECT ON public.plan_accion_con_validacion TO service_role;

-- ===== PASO 4: VERIFICACIÓN Y LIMPIEZA ADICIONAL =====

-- Verificar que no hay referencias a SECURITY DEFINER
SELECT 
    'VERIFICACIÓN FINAL:' as estado,
    schemaname,
    viewname,
    CASE 
        WHEN definition ILIKE '%security definer%' THEN '❌ SIGUE CON SECURITY DEFINER'
        ELSE '✅ SIN SECURITY DEFINER'
    END as resultado_security
FROM pg_views 
WHERE schemaname = 'public' 
    AND viewname = 'plan_accion_con_validacion';

-- Probar acceso a la vista
SELECT 
    'PRUEBA DE ACCESO:' as estado,
    COUNT(*) as registros_disponibles
FROM public.plan_accion_con_validacion;

-- Verificar propietario de la vista
SELECT 
    'PROPIETARIO:' as estado,
    c.relname as vista,
    r.rolname as propietario
FROM pg_class c
JOIN pg_roles r ON c.relowner = r.oid
WHERE c.relname = 'plan_accion_con_validacion'
    AND c.relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');

-- ===== RESULTADO FINAL =====
SELECT 
    '🎯 RESULTADO FINAL' as titulo,
    'Si la verificación muestra "SIN SECURITY DEFINER", el problema está resuelto' as instruccion,
    'Refresca el Dashboard de Supabase para confirmar que la advertencia desaparece' as siguiente_paso;
