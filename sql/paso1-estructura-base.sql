-- ========================================
-- PASO 1: CREAR ESTRUCTURA BASE DE LISTA DE CHEQUEO
-- ========================================

-- 1. Crear tabla de categorías
CREATE TABLE IF NOT EXISTS lista_chequeo_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    hoja_excel VARCHAR(100),
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Crear tabla de etapas
CREATE TABLE IF NOT EXISTS lista_chequeo_etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    orden INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crear tabla de items maestros
CREATE TABLE IF NOT EXISTS lista_chequeo_items_maestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero VARCHAR(10) NOT NULL,
    texto TEXT NOT NULL,
    observaciones TEXT,
    etapa_id UUID NOT NULL REFERENCES lista_chequeo_etapas(id),
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id),
    orden INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(categoria_id, numero)
);

-- 4. Crear tabla de registros de contratos (debe ir antes que respuestas)
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

-- 5. Crear tabla de respuestas (ahora puede referenciar registros)
CREATE TABLE IF NOT EXISTS lista_chequeo_respuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registro_id UUID NOT NULL REFERENCES lista_chequeo_registros(id),
    item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id),
    respuesta VARCHAR(20), -- 'CUMPLE', 'NO_CUMPLE', 'NO_APLICA'
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(registro_id, item_id)
);

-- 6. Habilitar RLS
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_registros ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas permisivas
CREATE POLICY "Allow all operations on lista_chequeo_categorias" ON lista_chequeo_categorias FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_etapas" ON lista_chequeo_etapas FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_items_maestros" ON lista_chequeo_items_maestros FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_respuestas" ON lista_chequeo_respuestas FOR ALL USING (true);
CREATE POLICY "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros FOR ALL USING (true);

-- 8. Crear índices
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_categoria ON lista_chequeo_items_maestros(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_etapa ON lista_chequeo_items_maestros(etapa_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_registro ON lista_chequeo_respuestas(registro_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_registros_dependencia ON lista_chequeo_registros(dependencia, categoria_id);

SELECT 'PASO 1 COMPLETADO: Estructura base creada' as resultado;
