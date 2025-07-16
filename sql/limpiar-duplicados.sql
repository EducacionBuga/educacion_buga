-- Script para eliminar items duplicados de la base de datos
-- Ejecutar este script para limpiar los duplicados

DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    -- Verificar si hay duplicados
    SELECT COUNT(*) INTO duplicate_count 
    FROM (
        SELECT titulo, categoria_id, etapa_id, COUNT(*) as count
        FROM lista_chequeo_items_maestros 
        GROUP BY titulo, categoria_id, etapa_id 
        HAVING COUNT(*) > 1
    ) as duplicates;
    
    RAISE NOTICE 'Duplicados encontrados: %', duplicate_count;
    
    -- Eliminar duplicados manteniendo solo el registro con el ID más bajo
    DELETE FROM lista_chequeo_items_maestros 
    WHERE id NOT IN (
        SELECT MIN(id)
        FROM lista_chequeo_items_maestros 
        GROUP BY titulo, categoria_id, etapa_id
    );
    
    -- Obtener conteo después de limpieza
    SELECT COUNT(*) INTO duplicate_count FROM lista_chequeo_items_maestros;
    RAISE NOTICE 'Items restantes después de limpieza: %', duplicate_count;
    
    RAISE NOTICE 'Limpieza de duplicados completada';
END $$;

-- Verificar resultado final
SELECT 
    c.nombre as categoria,
    e.nombre as etapa,
    COUNT(*) as total_items
FROM lista_chequeo_items_maestros i
JOIN lista_chequeo_categorias c ON i.categoria_id = c.id
JOIN lista_chequeo_etapas e ON i.etapa_id = e.id
GROUP BY c.nombre, e.nombre
ORDER BY c.nombre, e.nombre;
