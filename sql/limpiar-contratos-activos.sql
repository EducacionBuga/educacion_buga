-- ========================================
-- SCRIPT PARA LIMPIAR CONTRATOS ACTIVOS (DATOS DE EJEMPLO)
-- ========================================

-- IMPORTANTE: Este script eliminará TODOS los datos de contratos
-- y respuestas asociadas. Usar con cuidado.

-- 1. Primero eliminar las respuestas asociadas a los registros
-- (debido a las restricciones de clave foránea)
DELETE FROM lista_chequeo_respuestas 
WHERE registro_id IN (
    SELECT id FROM lista_chequeo_registros
);

-- 2. Eliminar todos los registros de contratos
DELETE FROM lista_chequeo_registros;

-- 3. Reiniciar secuencias si es necesario (opcional)
-- Esto solo es necesario si tienes campos AUTO_INCREMENT

-- 4. Verificar que se eliminaron correctamente
SELECT 
    'lista_chequeo_registros' as tabla,
    COUNT(*) as registros_restantes
FROM lista_chequeo_registros

UNION ALL

SELECT 
    'lista_chequeo_respuestas' as tabla,
    COUNT(*) as registros_restantes
FROM lista_chequeo_respuestas;

-- 5. Mostrar mensaje de confirmación
SELECT 
    'LIMPIEZA COMPLETADA' as estado,
    'Todos los contratos y respuestas han sido eliminados' as mensaje;
