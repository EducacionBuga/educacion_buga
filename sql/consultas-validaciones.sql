-- Consultas útiles para administrar las validaciones de planes
-- Usar en Supabase SQL Editor o en tu cliente SQL preferido

-- 1. Ver todos los planes con su estado de validación actual
SELECT 
    pa.id,
    pa.programa,
    pa.meta,
    a.nombre as area_nombre,
    pa.responsable,
    COALESCE(pv.estado_validacion, 'pendiente') as estado_validacion,
    pv.comentarios,
    u.nombre as validado_por_nombre,
    pv.fecha_validacion,
    pa.created_at as fecha_creacion_plan
FROM plan_accion pa
LEFT JOIN areas a ON pa.area_id = a.id
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
LEFT JOIN usuarios u ON pv.validado_por = u.id
ORDER BY pa.created_at DESC;

-- 2. Obtener estadísticas generales de validaciones
SELECT 
    COUNT(*) as total_planes,
    COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) as aprobados,
    COUNT(CASE WHEN pv.estado_validacion = 'rechazado' THEN 1 END) as rechazados,
    COUNT(CASE WHEN pv.estado_validacion = 'en_revision' THEN 1 END) as en_revision,
    COUNT(CASE WHEN pv.estado_validacion IS NULL OR pv.estado_validacion = 'pendiente' THEN 1 END) as pendientes,
    ROUND(
        COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) * 100.0 / COUNT(*), 2
    ) as porcentaje_aprobados
FROM plan_accion pa
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id;

-- 3. Estadísticas de validaciones por área
SELECT 
    a.nombre as area,
    COUNT(pa.id) as total_planes,
    COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) as aprobados,
    COUNT(CASE WHEN pv.estado_validacion = 'rechazado' THEN 1 END) as rechazados,
    COUNT(CASE WHEN pv.estado_validacion = 'en_revision' THEN 1 END) as en_revision,
    COUNT(CASE WHEN pv.estado_validacion IS NULL OR pv.estado_validacion = 'pendiente' THEN 1 END) as pendientes
FROM areas a
LEFT JOIN plan_accion pa ON a.id = pa.area_id
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
GROUP BY a.id, a.nombre
ORDER BY a.nombre;

-- 4. Ver planes que necesitan atención (rechazados o en revisión)
SELECT 
    pa.id,
    pa.programa,
    pa.meta,
    a.nombre as area,
    pa.responsable,
    pv.estado_validacion,
    pv.comentarios,
    pv.fecha_validacion,
    u.nombre as validado_por
FROM plan_accion pa
JOIN plan_validaciones pv ON pa.id = pv.plan_id
JOIN areas a ON pa.area_id = a.id
LEFT JOIN usuarios u ON pv.validado_por = u.id
WHERE pv.estado_validacion IN ('rechazado', 'en_revision')
ORDER BY pv.fecha_validacion DESC;

-- 5. Planes pendientes de validación (sin validar o marcados como pendientes)
SELECT 
    pa.id,
    pa.programa,
    pa.meta,
    a.nombre as area,
    pa.responsable,
    pa.created_at as fecha_creacion,
    EXTRACT(DAYS FROM NOW() - pa.created_at) as dias_sin_validar
FROM plan_accion pa
JOIN areas a ON pa.area_id = a.id
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
WHERE pv.estado_validacion IS NULL OR pv.estado_validacion = 'pendiente'
ORDER BY pa.created_at ASC;

-- 6. Historial de validaciones de un plan específico
-- Reemplaza 'PLAN_ID_AQUI' con el ID real del plan
SELECT 
    pv.estado_validacion,
    pv.comentarios,
    u.nombre as validado_por,
    pv.fecha_validacion,
    pv.created_at
FROM plan_validaciones pv
LEFT JOIN usuarios u ON pv.validado_por = u.id
WHERE pv.plan_id = 'PLAN_ID_AQUI'  -- Reemplazar con ID real
ORDER BY pv.created_at DESC;

-- 7. Actividad de validación por administrador
SELECT 
    u.nombre as administrador,
    COUNT(*) as total_validaciones,
    COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) as aprobaciones,
    COUNT(CASE WHEN pv.estado_validacion = 'rechazado' THEN 1 END) as rechazos,
    COUNT(CASE WHEN pv.estado_validacion = 'en_revision' THEN 1 END) as puestos_en_revision,
    MIN(pv.fecha_validacion) as primera_validacion,
    MAX(pv.fecha_validacion) as ultima_validacion
FROM plan_validaciones pv
JOIN usuarios u ON pv.validado_por = u.id
WHERE pv.fecha_validacion IS NOT NULL
GROUP BY u.id, u.nombre
ORDER BY total_validaciones DESC;

-- 8. Planes aprobados recientemente (últimos 30 días)
SELECT 
    pa.programa,
    pa.meta,
    a.nombre as area,
    pa.responsable,
    u.nombre as aprobado_por,
    pv.fecha_validacion,
    pv.comentarios
FROM plan_accion pa
JOIN plan_validaciones pv ON pa.id = pv.plan_id
JOIN areas a ON pa.area_id = a.id
LEFT JOIN usuarios u ON pv.validado_por = u.id
WHERE pv.estado_validacion = 'aprobado'
    AND pv.fecha_validacion >= NOW() - INTERVAL '30 days'
ORDER BY pv.fecha_validacion DESC;

-- 9. Encontrar planes con múltiples validaciones (historial de cambios)
SELECT 
    pa.programa,
    a.nombre as area,
    COUNT(pv.id) as numero_validaciones,
    STRING_AGG(pv.estado_validacion, ' → ' ORDER BY pv.created_at) as historial_estados
FROM plan_accion pa
JOIN areas a ON pa.area_id = a.id
JOIN plan_validaciones pv ON pa.id = pv.plan_id
GROUP BY pa.id, pa.programa, a.nombre
HAVING COUNT(pv.id) > 1
ORDER BY numero_validaciones DESC;

-- 10. Resumen ejecutivo de validaciones
WITH stats AS (
    SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) as aprobados,
        COUNT(CASE WHEN pv.estado_validacion = 'rechazado' THEN 1 END) as rechazados,
        COUNT(CASE WHEN pv.estado_validacion = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN pv.estado_validacion IS NULL OR pv.estado_validacion = 'pendiente' THEN 1 END) as pendientes
    FROM plan_accion pa
    LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
)
SELECT 
    'RESUMEN EJECUTIVO DE VALIDACIONES' as titulo,
    total as "Total de Planes",
    aprobados as "Planes Aprobados",
    rechazados as "Planes Rechazados", 
    en_revision as "En Revisión",
    pendientes as "Pendientes",
    ROUND(aprobados * 100.0 / total, 1) || '%' as "% Aprobados",
    ROUND(pendientes * 100.0 / total, 1) || '%' as "% Pendientes"
FROM stats;

-- 11. Función para aprobar todos los planes de un área específica
-- Usar con cuidado: reemplaza 'AREA_ID' y 'ADMIN_USER_ID'
/*
INSERT INTO plan_validaciones (plan_id, estado_validacion, comentarios, validado_por, fecha_validacion)
SELECT 
    pa.id,
    'aprobado',
    'Aprobación masiva por área',
    'ADMIN_USER_ID',  -- Reemplazar con ID del admin
    NOW()
FROM plan_accion pa
WHERE pa.area_id = 'AREA_ID'  -- Reemplazar con ID del área
ON CONFLICT (plan_id) DO UPDATE SET
    estado_validacion = 'aprobado',
    comentarios = 'Aprobación masiva por área',
    validado_por = 'ADMIN_USER_ID',  -- Reemplazar con ID del admin
    fecha_validacion = NOW(),
    updated_at = NOW();
*/

-- 12. Verificar integridad de los datos
SELECT 
    'Verificación de Integridad' as check_type,
    COUNT(*) as count,
    'Planes sin área válida' as description
FROM plan_accion pa
LEFT JOIN areas a ON pa.area_id = a.id
WHERE a.id IS NULL
UNION ALL
SELECT 
    'Verificación de Integridad',
    COUNT(*),
    'Validaciones huérfanas (sin plan)'
FROM plan_validaciones pv
LEFT JOIN plan_accion pa ON pv.plan_id = pa.id
WHERE pa.id IS NULL
UNION ALL
SELECT 
    'Verificación de Integridad',
    COUNT(*),
    'Validaciones con validador inexistente'
FROM plan_validaciones pv
LEFT JOIN usuarios u ON pv.validado_por = u.id
WHERE pv.validado_por IS NOT NULL AND u.id IS NULL;
