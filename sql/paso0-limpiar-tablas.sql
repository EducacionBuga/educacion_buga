-- ========================================
-- PASO 0: LIMPIAR TABLAS EXISTENTES (EJECUTAR PRIMERO)
-- ========================================

-- Eliminar políticas existentes si existen
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros;

-- Eliminar tablas en orden inverso (para evitar problemas de dependencias)
DROP TABLE IF EXISTS lista_chequeo_respuestas CASCADE;
DROP TABLE IF EXISTS lista_chequeo_registros CASCADE;
DROP TABLE IF EXISTS lista_chequeo_items_maestros CASCADE;
DROP TABLE IF EXISTS lista_chequeo_etapas CASCADE;
DROP TABLE IF EXISTS lista_chequeo_categorias CASCADE;

-- Mensaje de confirmación
SELECT 'PASO 0 COMPLETADO: Tablas eliminadas, ahora ejecuta paso1-estructura-base.sql' as resultado;
