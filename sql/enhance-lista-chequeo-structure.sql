-- ========================================
-- DATOS COMPLETOS PARA LISTA DE CHEQUEO
-- Basado en los documentos oficiales de la Secretaría de Educación de Buga
-- Incluye todos los items para SAMC, Mínima Cuantía, Contrato Interadministrativo y Prestación de Servicios
-- ========================================

-- Agregar campos para registrar información del contrato
ALTER TABLE lista_chequeo_respuestas 
ADD COLUMN IF NOT EXISTS numero_contrato VARCHAR(100),
ADD COLUMN IF NOT EXISTS valor_contrato DECIMAL(15,2),
ADD COLUMN IF NOT EXISTS contratista TEXT,
ADD COLUMN IF NOT EXISTS fecha_registro TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS usuario_registro VARCHAR(100);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_numero_contrato 
ON lista_chequeo_respuestas(numero_contrato);

CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_area_categoria 
ON lista_chequeo_respuestas(area_id, categoria_id);

-- Crear tabla para registros de listas de chequeo completadas
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

-- Habilitar RLS en la nueva tabla
ALTER TABLE lista_chequeo_registros ENABLE ROW LEVEL SECURITY;

-- Crear política permisiva para la nueva tabla
CREATE POLICY "Allow all operations on lista_chequeo_registros" ON lista_chequeo_registros
FOR ALL USING (true);

COMMENT ON TABLE lista_chequeo_registros IS 'Registros de listas de chequeo por contrato';

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================
