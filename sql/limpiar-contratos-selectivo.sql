-- ========================================
-- SCRIPT PARA LIMPIAR CONTRATOS SELECTIVAMENTE
-- ========================================

-- OPCIÓN 1: Eliminar por estado (ej: solo contratos de ejemplo/prueba)
-- Descomenta la línea que necesites:

-- Eliminar contratos por estado
-- DELETE FROM lista_chequeo_respuestas 
-- WHERE registro_id IN (
--     SELECT id FROM lista_chequeo_registros 
--     WHERE estado = 'EJEMPLO' OR estado = 'PRUEBA'
-- );
-- 
-- DELETE FROM lista_chequeo_registros 
-- WHERE estado = 'EJEMPLO' OR estado = 'PRUEBA';

-- OPCIÓN 2: Eliminar por dependencia específica
-- DELETE FROM lista_chequeo_respuestas 
-- WHERE registro_id IN (
--     SELECT id FROM lista_chequeo_registros 
--     WHERE dependencia = 'DEPENDENCIA_EJEMPLO'
-- );
-- 
-- DELETE FROM lista_chequeo_registros 
-- WHERE dependencia = 'DEPENDENCIA_EJEMPLO';

-- OPCIÓN 3: Eliminar por número de contrato que contenga "ejemplo" o "test"
-- DELETE FROM lista_chequeo_respuestas 
-- WHERE registro_id IN (
--     SELECT id FROM lista_chequeo_registros 
--     WHERE LOWER(numero_contrato) LIKE '%ejemplo%' 
--        OR LOWER(numero_contrato) LIKE '%test%'
--        OR LOWER(numero_contrato) LIKE '%prueba%'
-- );
-- 
-- DELETE FROM lista_chequeo_registros 
-- WHERE LOWER(numero_contrato) LIKE '%ejemplo%' 
--    OR LOWER(numero_contrato) LIKE '%test%'
--    OR LOWER(numero_contrato) LIKE '%prueba%';

-- OPCIÓN 4: Eliminar por rango de fechas (contratos creados hoy, por ejemplo)
-- DELETE FROM lista_chequeo_respuestas 
-- WHERE registro_id IN (
--     SELECT id FROM lista_chequeo_registros 
--     WHERE DATE(created_at) = CURRENT_DATE
-- );
-- 
-- DELETE FROM lista_chequeo_registros 
-- WHERE DATE(created_at) = CURRENT_DATE;

-- CONSULTA PREVIA: Ver qué contratos existen antes de eliminar
SELECT 
    id,
    dependencia,
    numero_contrato,
    contratista,
    estado,
    created_at
FROM lista_chequeo_registros
ORDER BY created_at DESC;

-- Contar respuestas por registro
SELECT 
    r.numero_contrato,
    r.contratista,
    COUNT(resp.id) as total_respuestas
FROM lista_chequeo_registros r
LEFT JOIN lista_chequeo_respuestas resp ON r.id = resp.registro_id
GROUP BY r.id, r.numero_contrato, r.contratista
ORDER BY r.created_at DESC;
