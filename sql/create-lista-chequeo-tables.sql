-- ========================================
-- SISTEMA EDUCATIVO BUGA - LISTA DE CHEQUEO
-- Script de creación de tablas de producción
-- ========================================

-- 1. Tabla de categorías de lista de chequeo (tipos de contrato)
CREATE TABLE IF NOT EXISTS lista_chequeo_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE, -- SAMC, MINIMA CUANTÍA, etc.
    descripcion TEXT,
    hoja_excel VARCHAR(50) NOT NULL, -- Nombre de la hoja en Excel
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de etapas del proceso contractual
CREATE TABLE IF NOT EXISTS lista_chequeo_etapas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(50) NOT NULL UNIQUE, -- PRECONTRACTUAL, CONTRACTUAL, EJECUCION
    descripcion TEXT,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla maestra de items de lista de chequeo
CREATE TABLE IF NOT EXISTS lista_chequeo_items_maestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_item INTEGER NOT NULL,
    titulo VARCHAR(500) NOT NULL,
    descripcion TEXT,
    etapa_id UUID NOT NULL REFERENCES lista_chequeo_etapas(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
    fila_excel INTEGER, -- Número de fila en Excel para exportación
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(categoria_id, numero_item)
);

-- 4. Tabla de relación entre items y categorías (para flexibilidad)
CREATE TABLE IF NOT EXISTS lista_chequeo_item_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(item_id, categoria_id)
);

-- 5. Tabla de respuestas de lista de chequeo por área
CREATE TABLE IF NOT EXISTS lista_chequeo_respuestas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id UUID NOT NULL, -- ID del área que responde
    categoria_id UUID NOT NULL REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
    item_id UUID NOT NULL REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
    respuesta VARCHAR(20) CHECK (respuesta IN ('CUMPLE', 'NO_CUMPLE', 'NO_APLICA')),
    observaciones TEXT,
    usuario_creacion VARCHAR(100), -- Email o ID del usuario que creó
    usuario_modificacion VARCHAR(100), -- Email o ID del usuario que modificó
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(area_id, categoria_id, item_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_categoria ON lista_chequeo_items_maestros(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_items_etapa ON lista_chequeo_items_maestros(etapa_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_area ON lista_chequeo_respuestas(area_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_categoria ON lista_chequeo_respuestas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);

-- Función para actualizar el timestamp de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_lista_chequeo_categorias_updated_at 
    BEFORE UPDATE ON lista_chequeo_categorias 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lista_chequeo_etapas_updated_at 
    BEFORE UPDATE ON lista_chequeo_etapas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lista_chequeo_items_maestros_updated_at 
    BEFORE UPDATE ON lista_chequeo_items_maestros 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lista_chequeo_respuestas_updated_at 
    BEFORE UPDATE ON lista_chequeo_respuestas 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- DATOS INICIALES
-- ========================================

-- Insertar categorías (tipos de contrato)
INSERT INTO lista_chequeo_categorias (nombre, descripcion, hoja_excel, orden) VALUES
('SAMC', 'Selección Abreviada de Menor Cuantía', 'SAMC', 1),
('MINIMA CUANTÍA', 'Contrato de Mínima Cuantía', 'MINIMA CUANTÍA', 2),
('CONTRATO INTERADMINISTRATIVO', 'Contrato Interadministrativo', 'CONTRATO INTERADMINISTRATIVO', 3),
('PRESTACIÓN DE SERVICIOS', 'Contrato de Prestación de Servicios', 'PRESTACIÓN DE SERVICIOS', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar etapas del proceso
INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) VALUES
('PRECONTRACTUAL', 'Etapa previa a la firma del contrato', 1),
('CONTRACTUAL', 'Etapa de formalización del contrato', 2),
('EJECUCION', 'Etapa de ejecución y seguimiento del contrato', 3)
ON CONFLICT (nombre) DO NOTHING;

-- ========================================
-- ITEMS DE EJEMPLO PARA SAMC
-- ========================================

-- Obtener IDs para referencias
DO $$
DECLARE
    categoria_samc_id UUID;
    etapa_precontractual_id UUID;
    etapa_contractual_id UUID;
    etapa_ejecucion_id UUID;
BEGIN
    -- Obtener IDs de categoría y etapas
    SELECT id INTO categoria_samc_id FROM lista_chequeo_categorias WHERE nombre = 'SAMC';
    SELECT id INTO etapa_precontractual_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO etapa_contractual_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO etapa_ejecucion_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';
    
    -- Items PRECONTRACTUALES para SAMC
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (1, 'FICHA MGA (PROCESOS DE INVERSIÓN)', 'Ficha MGA para procesos de inversión', etapa_precontractual_id, categoria_samc_id, 12),
    (2, 'CERTIFICADO DE VIABILIDAD Y REGISTRO', 'Certificado de viabilidad y registro en el banco de programas y proyectos', etapa_precontractual_id, categoria_samc_id, 13),
    (3, 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', 'Estudios previos y análisis del sector económico', etapa_precontractual_id, categoria_samc_id, 14),
    (4, 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cotizaciones para procesos de compraventas, suministros o servicios', etapa_precontractual_id, categoria_samc_id, 15),
    (5, 'CÁMARAS DE COMERCIO COTIZACIONES', 'Cámaras de comercio de los proveedores que cotizaron', etapa_precontractual_id, categoria_samc_id, 16),
    (6, 'ANÁLISIS DE PRECIOS COTIZACIONES', 'Análisis de precios de las cotizaciones recibidas', etapa_precontractual_id, categoria_samc_id, 17),
    (7, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'Certificado de disponibilidad presupuestal vigente', etapa_precontractual_id, categoria_samc_id, 18),
    (8, 'SOLICITUD DE CONTRATACIÓN', 'Solicitud formal de contratación con justificación', etapa_precontractual_id, categoria_samc_id, 19),
    (9, 'RESOLUCIÓN NECESIDAD Y CONVENIENCIA', 'Resolución de necesidad y conveniencia del proceso', etapa_precontractual_id, categoria_samc_id, 20),
    (10, 'DELEGACIÓN', 'Acto administrativo de delegación de competencias', etapa_precontractual_id, categoria_samc_id, 21)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- Items CONTRACTUALES para SAMC
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (25, 'MINUTA DE CONTRATO', 'Minuta del contrato debidamente elaborada', etapa_contractual_id, categoria_samc_id, 39),
    (26, 'HOJA DE VIDA Y DOCUMENTOS REP. LEGAL', 'Hoja de vida y documentos del representante legal', etapa_contractual_id, categoria_samc_id, 40),
    (27, 'CÁMARA DE COMERCIO (SI APLICA)', 'Cámara de comercio del contratista cuando aplique', etapa_contractual_id, categoria_samc_id, 41),
    (28, 'RUT ACTUALIZADO', 'RUT actualizado del contratista', etapa_contractual_id, categoria_samc_id, 42),
    (29, 'CERTIFICADO DE ANTECEDENTES FISCALES', 'Certificado de antecedentes fiscales de la CGR', etapa_contractual_id, categoria_samc_id, 43),
    (30, 'CERTIFICADO DE ANTECEDENTES DISCIPLINARIOS', 'Certificado de antecedentes disciplinarios', etapa_contractual_id, categoria_samc_id, 44),
    (31, 'BOLETÍN DE RESPONSABLES FISCALES', 'Consulta del boletín de responsables fiscales', etapa_contractual_id, categoria_samc_id, 45),
    (32, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria del contratista', etapa_contractual_id, categoria_samc_id, 46),
    (33, 'PÓLIZAS DE SEGUROS', 'Pólizas de seguros requeridas para el contrato', etapa_contractual_id, categoria_samc_id, 47),
    (34, 'CONTRATO FIRMADO', 'Contrato debidamente firmado por las partes', etapa_contractual_id, categoria_samc_id, 48)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- Items EJECUCIÓN para SAMC
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (43, 'INFORMES DE EJECUCIÓN DEL CONTRATO', 'Informes periódicos de ejecución del contrato', etapa_ejecucion_id, categoria_samc_id, 57),
    (44, 'ENTRADA DE ALMACÉN (PROCESOS DE COMPRAVENTA)', 'Entrada de almacén para procesos de compraventa', etapa_ejecucion_id, categoria_samc_id, 58),
    (45, 'INFORMES DE SUPERVISIÓN', 'Informes del supervisor del contrato', etapa_ejecucion_id, categoria_samc_id, 59),
    (46, 'FACTURAS Y CUENTAS DE COBRO', 'Facturas y cuentas de cobro del contratista', etapa_ejecucion_id, categoria_samc_id, 60),
    (47, 'ACTAS DE RECIBO A SATISFACCIÓN', 'Actas de recibo a satisfacción de bienes/servicios', etapa_ejecucion_id, categoria_samc_id, 61),
    (48, 'CERTIFICACIONES DE PAGOS', 'Certificaciones de pagos realizados', etapa_ejecucion_id, categoria_samc_id, 62),
    (49, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación del contrato', etapa_ejecucion_id, categoria_samc_id, 63),
    (50, 'PAZ Y SALVO FINAL', 'Paz y salvo final del contrato', etapa_ejecucion_id, categoria_samc_id, 64)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
END $$;

-- ========================================
-- POLÍTICAS RLS (Row Level Security)
-- ========================================

-- Habilitar RLS en todas las tablas
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_item_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;

-- Políticas permisivas para todas las operaciones (como en el resto del sistema)
CREATE POLICY "Allow all operations on lista_chequeo_categorias" 
    ON lista_chequeo_categorias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lista_chequeo_etapas" 
    ON lista_chequeo_etapas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lista_chequeo_items_maestros" 
    ON lista_chequeo_items_maestros FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lista_chequeo_item_categorias" 
    ON lista_chequeo_item_categorias FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on lista_chequeo_respuestas" 
    ON lista_chequeo_respuestas FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ========================================
-- COMENTARIOS EN TABLAS
-- ========================================

COMMENT ON TABLE lista_chequeo_categorias IS 'Categorías de lista de chequeo (tipos de contrato)';
COMMENT ON TABLE lista_chequeo_etapas IS 'Etapas del proceso contractual';
COMMENT ON TABLE lista_chequeo_items_maestros IS 'Items maestros de lista de chequeo';
COMMENT ON TABLE lista_chequeo_item_categorias IS 'Relación items-categorías para flexibilidad';
COMMENT ON TABLE lista_chequeo_respuestas IS 'Respuestas de lista de chequeo por área';

-- ========================================
-- VERIFICACIÓN FINAL
-- ========================================

-- Mostrar resumen de datos insertados
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
    'Items' as tabla,
    count(*) as registros
FROM lista_chequeo_items_maestros
UNION ALL
SELECT 
    'Respuestas' as tabla,
    count(*) as registros
FROM lista_chequeo_respuestas;

-- ========================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- ========================================
