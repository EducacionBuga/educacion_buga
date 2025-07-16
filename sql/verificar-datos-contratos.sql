-- ========================================
-- SCRIPT PARA VERIFICAR DATOS ANTES DE LIMPIAR
-- ========================================

-- 1. Ver todos los contratos existentes
SELECT 
    'CONTRATOS EXISTENTES' as seccion,
    '' as separador;

SELECT 
    id,
    dependencia,
    numero_contrato,
    valor_contrato,
    contratista,
    estado,
    porcentaje_completado,
    usuario_creacion,
    created_at,
    updated_at
FROM lista_chequeo_registros
ORDER BY created_at DESC;

-- 2. Resumen por estado
SELECT 
    'RESUMEN POR ESTADO' as seccion,
    '' as separador;

SELECT 
    estado,
    COUNT(*) as cantidad_contratos,
    SUM(valor_contrato) as valor_total
FROM lista_chequeo_registros
GROUP BY estado
ORDER BY cantidad_contratos DESC;

-- 3. Resumen por dependencia
SELECT 
    'RESUMEN POR DEPENDENCIA' as seccion,
    '' as separador;

SELECT 
    dependencia,
    COUNT(*) as cantidad_contratos,
    AVG(porcentaje_completado) as promedio_completado
FROM lista_chequeo_registros
GROUP BY dependencia
ORDER BY cantidad_contratos DESC;

-- 4. Ver contratos con respuestas
SELECT 
    'CONTRATOS CON RESPUESTAS' as seccion,
    '' as separador;

SELECT 
    r.numero_contrato,
    r.contratista,
    r.estado,
    COUNT(resp.id) as total_respuestas,
    COUNT(DISTINCT resp.item_maestro_id) as items_respondidos
FROM lista_chequeo_registros r
LEFT JOIN lista_chequeo_respuestas resp ON r.id = resp.registro_id
GROUP BY r.id, r.numero_contrato, r.contratista, r.estado
HAVING COUNT(resp.id) > 0
ORDER BY total_respuestas DESC;

-- 5. Contratos que parecen de ejemplo/prueba
SELECT 
    'POSIBLES CONTRATOS DE EJEMPLO' as seccion,
    '' as separador;

SELECT 
    id,
    numero_contrato,
    contratista,
    dependencia,
    estado,
    created_at
FROM lista_chequeo_registros
WHERE 
    LOWER(numero_contrato) LIKE '%ejemplo%' 
    OR LOWER(numero_contrato) LIKE '%test%'
    OR LOWER(numero_contrato) LIKE '%prueba%'
    OR LOWER(contratista) LIKE '%ejemplo%'
    OR LOWER(contratista) LIKE '%test%'
    OR LOWER(contratista) LIKE '%prueba%'
ORDER BY created_at DESC;

-- 6. Estadísticas generales
SELECT 
    'ESTADÍSTICAS GENERALES' as seccion,
    '' as separador;

SELECT 
    'Total contratos' as metrica,
    COUNT(*) as valor
FROM lista_chequeo_registros

UNION ALL

SELECT 
    'Total respuestas' as metrica,
    COUNT(*) as valor
FROM lista_chequeo_respuestas

UNION ALL

SELECT 
    'Contratos completados' as metrica,
    COUNT(*) as valor
FROM lista_chequeo_registros
WHERE porcentaje_completado = 100

UNION ALL

SELECT 
    'Contratos en progreso' as metrica,
    COUNT(*) as valor
FROM lista_chequeo_registros
WHERE porcentaje_completado BETWEEN 1 AND 99

UNION ALL

SELECT 
    'Contratos sin iniciar' as metrica,
    COUNT(*) as valor
FROM lista_chequeo_registros
WHERE porcentaje_completado = 0;
