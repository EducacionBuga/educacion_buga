-- ========================================
-- INICIALIZACIÓN COMPLETA DE LISTA DE CHEQUEO
-- Script maestro para crear toda la estructura y datos
-- ========================================

-- 1. Crear tablas base si no existen
CREATE TABLE IF NOT EXISTS lista_chequeo_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    hoja_excel VARCHAR(100),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lista_chequeo_etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS lista_chequeo_items_maestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_item INTEGER NOT NULL,
    titulo TEXT NOT NULL,
    descripcion TEXT,
    etapa_id UUID NOT NULL REFERENCES lista_chequeo_etapas(id),
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id),
    fila_excel INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(categoria_id, numero_item)
);

CREATE TABLE IF NOT EXISTS lista_chequeo_respuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES areas(id),
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id),
    item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id),
    respuesta VARCHAR(20), -- 'CUMPLE', 'NO_CUMPLE', 'NO_APLICA'
    observaciones TEXT,
    numero_contrato VARCHAR(100),
    valor_contrato DECIMAL(15,2),
    contratista TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(area_id, categoria_id, item_id, numero_contrato)
);

CREATE TABLE IF NOT EXISTS lista_chequeo_registros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL REFERENCES areas(id),
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
    UNIQUE(area_id, categoria_id, numero_contrato)
);

-- 2. Habilitar RLS en todas las tablas
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_registros ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas permisivas
CREATE POLICY IF NOT EXISTS "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas
FOR ALL USING (true);

CREATE POLICY IF NOT EXISTS "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros
FOR ALL USING (true);

-- 4. Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_categoria ON lista_chequeo_items_maestros(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_etapa ON lista_chequeo_items_maestros(etapa_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_area_categoria ON lista_chequeo_respuestas(area_id, categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_contrato ON lista_chequeo_respuestas(numero_contrato);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_registros_area_categoria ON lista_chequeo_registros(area_id, categoria_id);

-- 5. Insertar categorías base
INSERT INTO lista_chequeo_categorias (nombre, descripcion, hoja_excel, orden) VALUES
('SAMC', 'Selección Abreviada de Menor Cuantía', 'SAMC', 1),
('MINIMA CUANTÍA', 'Invitación Pública de Mínima Cuantía', 'MINIMA CUANTÍA', 2),
('CONTRATO INTERADMINISTRATIVO', 'Contrato Interadministrativo', 'CONTRATO INTERADMINISTRATIVO', 3),
('PRESTACIÓN DE SERVICIOS', 'Contrato de Prestación de Servicios', 'PRESTACIÓN DE SERVICIOS', 4)
ON CONFLICT (nombre) DO NOTHING;

-- 6. Insertar etapas base
INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) VALUES
('PRECONTRACTUAL', 'Etapa precontractual', 1),
('CONTRACTUAL', 'Etapa contractual', 2),
('EJECUCION', 'Etapa de ejecución', 3),
('ADICION', 'Etapa de adición al contrato (cuando aplique)', 4)
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================

-- Verificar estructura creada
SELECT 
    'Categorías' as tabla,
    count(*) as registros
FROM lista_chequeo_categorias
UNION ALL
SELECT 
    'Etapas' as tabla,
    count(*) as registros
FROM lista_chequeo_etapas
UNION ALL
SELECT 
    'Items maestros' as tabla,
    count(*) as registros
FROM lista_chequeo_items_maestros
UNION ALL
SELECT 
    'Respuestas' as tabla,
    count(*) as registros
FROM lista_chequeo_respuestas
UNION ALL
SELECT 
    'Registros' as tabla,
    count(*) as registros
FROM lista_chequeo_registros;

-- Mostrar mensaje de éxito
SELECT 'Estructura de lista de chequeo inicializada correctamente' as mensaje;
