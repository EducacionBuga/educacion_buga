-- ========================================
-- PASO 0: ACTUALIZAR ESTRUCTURA DE TABLAS EXISTENTES
-- ========================================

-- 1. Actualizar tabla lista_chequeo_items_maestros
-- Agregar columna categoria_id que falta
ALTER TABLE lista_chequeo_items_maestros 
ADD COLUMN IF NOT EXISTS categoria_id UUID REFERENCES lista_chequeo_categorias(id);

-- Agregar columnas que faltan en items_maestros
ALTER TABLE lista_chequeo_items_maestros 
ADD COLUMN IF NOT EXISTS numero VARCHAR(10);

ALTER TABLE lista_chequeo_items_maestros 
ADD COLUMN IF NOT EXISTS texto TEXT;

ALTER TABLE lista_chequeo_items_maestros 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

ALTER TABLE lista_chequeo_items_maestros 
ADD COLUMN IF NOT EXISTS orden INTEGER;

-- 2. Crear tabla de registros si no existe
CREATE TABLE IF NOT EXISTS lista_chequeo_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dependencia VARCHAR(100) NOT NULL,
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id),
    numero_contrato VARCHAR(100) NOT NULL,
    valor_contrato DECIMAL(15,2),
    contratista TEXT NOT NULL,
    estado VARCHAR(50) DEFAULT 'EN_PROGRESO',
    porcentaje_completado INTEGER DEFAULT 0,
    usuario_creacion VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT NOW(),
    usuario_actualizacion VARCHAR(100),
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    observaciones_generales TEXT,
    UNIQUE(dependencia, categoria_id, numero_contrato)
);

-- 3. Actualizar tabla lista_chequeo_respuestas
-- Agregar columna registro_id
ALTER TABLE lista_chequeo_respuestas 
ADD COLUMN IF NOT EXISTS registro_id UUID REFERENCES lista_chequeo_registros(id);

-- 4. Habilitar RLS en todas las tablas
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_registros ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas permisivas (eliminar las existentes primero)
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas;
DROP POLICY IF EXISTS "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros;

-- Crear nuevas políticas
CREATE POLICY "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros FOR ALL USING (true);

-- 6. Crear índices necesarios
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_categoria ON lista_chequeo_items_maestros(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_etapa ON lista_chequeo_items_maestros(etapa_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_registro ON lista_chequeo_respuestas(registro_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_registros_dependencia ON lista_chequeo_registros(dependencia, categoria_id);

-- Verificar estructura actualizada
SELECT 'PASO 0 COMPLETADO: Estructura actualizada para coincidir con los scripts' as resultado;

-- Mostrar resumen de tablas
SELECT 
    'Tablas actualizadas' as tipo,
    COUNT(*) as cantidad
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'lista_chequeo_%';
