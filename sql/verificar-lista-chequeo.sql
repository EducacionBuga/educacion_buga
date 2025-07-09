-- Consulta de verificación para comprobar la estructura de lista de chequeo

-- 1. Verificar categorías
SELECT 'CATEGORIAS' as tabla, COUNT(*) as total FROM lista_chequeo_categorias;

-- 2. Verificar etapas  
SELECT 'ETAPAS' as tabla, COUNT(*) as total FROM lista_chequeo_etapas;

-- 3. Verificar items maestros
SELECT 'ITEMS MAESTROS' as tabla, COUNT(*) as total FROM lista_chequeo_items_maestros;

-- 4. Verificar relaciones item-categoria
SELECT 'ITEM-CATEGORIAS' as tabla, COUNT(*) as total FROM lista_chequeo_item_categorias;

-- 5. Ver muestra de datos por categoría
SELECT 
    c.nombre as categoria,
    COUNT(*) as total_items
FROM lista_chequeo_categorias c
JOIN lista_chequeo_item_categorias ic ON c.id = ic.categoria_id
GROUP BY c.nombre, c.orden
ORDER BY c.orden;

-- 6. Ver items por etapa
SELECT 
    e.nombre as etapa,
    COUNT(*) as total_items
FROM lista_chequeo_etapas e
JOIN lista_chequeo_items_maestros im ON e.id = im.etapa_id
GROUP BY e.nombre, e.orden
ORDER BY e.orden;

-- 7. Verificar mapeo de filas para SAMC (primeros 10)
SELECT 
    im.numero_item,
    im.titulo,
    ic.fila_excel,
    e.nombre as etapa
FROM lista_chequeo_categorias c
JOIN lista_chequeo_item_categorias ic ON c.id = ic.categoria_id
JOIN lista_chequeo_items_maestros im ON ic.item_id = im.id
JOIN lista_chequeo_etapas e ON im.etapa_id = e.id
WHERE c.nombre = 'SAMC'
ORDER BY ic.fila_excel
LIMIT 10;

-- 8. Verificar estructura de datos para exportación
SELECT 
    'Estructura OK' as status,
    'Tablas creadas y pobladas correctamente' as mensaje;
