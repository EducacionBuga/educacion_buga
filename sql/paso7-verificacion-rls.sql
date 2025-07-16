-- ========================================
-- PASO 7: VERIFICACIÓN Y ACTIVACIÓN RLS
-- ========================================

-- Verificar que todas las tablas fueron creadas
SELECT 
    'VERIFICACIÓN DE TABLAS' as tipo,
    COUNT(*) as total_tablas
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lista_chequeo_%';

-- Verificar cantidad de registros insertados
SELECT 'Categorías' as tabla, COUNT(*) as registros FROM lista_chequeo_categorias
UNION ALL
SELECT 'Etapas' as tabla, COUNT(*) as registros FROM lista_chequeo_etapas
UNION ALL
SELECT 'Ítems Maestros' as tabla, COUNT(*) as registros FROM lista_chequeo_items_maestros;

-- Verificar ítems por categoría
SELECT 
    c.nombre as categoria,
    COUNT(im.id) as total_items
FROM lista_chequeo_categorias c
LEFT JOIN lista_chequeo_items_maestros im ON c.id = im.categoria_id
GROUP BY c.nombre, c.orden
ORDER BY c.orden;

-- Verificar ítems por etapa en cada categoría
SELECT 
    c.nombre as categoria,
    e.nombre as etapa,
    COUNT(im.id) as items_count
FROM lista_chequeo_categorias c
CROSS JOIN lista_chequeo_etapas e
LEFT JOIN lista_chequeo_items_maestros im ON c.id = im.categoria_id AND e.id = im.etapa_id
GROUP BY c.nombre, c.orden, e.nombre, e.orden
ORDER BY c.orden, e.orden;

-- Activar RLS en todas las tablas
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_registros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;

-- Crear política para administradores (acceso total)
CREATE POLICY "Administradores acceso total" ON lista_chequeo_categorias
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Administradores acceso total" ON lista_chequeo_etapas
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Administradores acceso total" ON lista_chequeo_items_maestros
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Crear políticas para usuarios normales (acceso por dependencia)
CREATE POLICY "Usuarios ven categorías" ON lista_chequeo_categorias
    FOR SELECT USING (true); -- Todos pueden ver las categorías

CREATE POLICY "Usuarios ven etapas" ON lista_chequeo_etapas
    FOR SELECT USING (true); -- Todos pueden ver las etapas

CREATE POLICY "Usuarios ven items maestros" ON lista_chequeo_items_maestros
    FOR SELECT USING (true); -- Todos pueden ver los ítems maestros

-- Políticas para registros (solo su dependencia)
CREATE POLICY "Usuarios gestionan sus registros" ON lista_chequeo_registros
    FOR ALL USING (dependencia = auth.jwt() ->> 'dependencia');

-- Políticas para respuestas (solo sus registros)
CREATE POLICY "Usuarios gestionan sus respuestas" ON lista_chequeo_respuestas
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM lista_chequeo_registros r 
            WHERE r.id = registro_id 
            AND r.dependencia = auth.jwt() ->> 'dependencia'
        )
    );

-- Mensaje de finalización
SELECT 'PASO 7 COMPLETADO: RLS activado y políticas creadas' as resultado;

-- Resumen final
SELECT 'BASE DE DATOS LISTA PARA PRODUCCIÓN' as estado,
       'Ejecute los siguientes pasos desde la interfaz Next.js para completar la configuración' as siguiente_paso;
