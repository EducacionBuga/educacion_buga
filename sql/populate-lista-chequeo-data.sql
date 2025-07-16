-- ========================================
-- DATOS COMPLETOS PARA LISTA DE CHEQUEO
-- Basado en los documentos oficiales de la Secretaría de Educación de Buga
-- Código: ASE.BYS.SP-01.PR-01-F4, F5, F6, F7
-- Rev.No.1 - Fecha de Emisión: Marzo 2023
-- ========================================

DO $$
DECLARE
    -- IDs de etapas
    etapa_precontractual_id UUID;
    etapa_contractual_id UUID;
    etapa_ejecucion_id UUID;
    etapa_adicion_id UUID;
    
    -- IDs de categorías
    categoria_samc_id UUID;
    categoria_minima_id UUID;
    categoria_interadmin_id UUID;
    categoria_servicios_id UUID;
BEGIN
    -- Obtener IDs de etapas
    SELECT id INTO etapa_precontractual_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO etapa_contractual_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO etapa_ejecucion_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';
    
    -- Crear etapa de adición para prestación de servicios
    INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) 
    VALUES ('ADICION', 'Etapa de adición al contrato (cuando aplique)', 4)
    ON CONFLICT (nombre) DO UPDATE SET descripcion = EXCLUDED.descripcion;
    
    SELECT id INTO etapa_adicion_id FROM lista_chequeo_etapas WHERE nombre = 'ADICION';
    
    -- Obtener IDs de categorías
    SELECT id INTO categoria_samc_id FROM lista_chequeo_categorias WHERE nombre = 'SAMC';
    SELECT id INTO categoria_minima_id FROM lista_chequeo_categorias WHERE nombre = 'MINIMA CUANTÍA';
    SELECT id INTO categoria_interadmin_id FROM lista_chequeo_categorias WHERE nombre = 'CONTRATO INTERADMINISTRATIVO';
    SELECT id INTO categoria_servicios_id FROM lista_chequeo_categorias WHERE nombre = 'PRESTACIÓN DE SERVICIOS';

    -- ========================================
    -- ITEMS PARA SAMC (SELECCIÓN ABREVIADA MENOR CUANTÍA)
    -- Documento: ASE.BYS.SP-01.PR-01-F4
    -- ========================================
    
    -- ETAPA PRECONTRACTUAL SAMC (Items 1-24)
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (1, 'FICHA MGA (PROCESOS DE INVERSIÓN)', 'Ficha MGA para procesos de inversión', etapa_precontractual_id, categoria_samc_id, 12),
    (2, 'CERTIFICADO DE VIABILIDAD Y REGISTRO', 'Certificado de viabilidad y registro', etapa_precontractual_id, categoria_samc_id, 13),
    (3, 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', 'Estudios previos y análisis del sector', etapa_precontractual_id, categoria_samc_id, 14),
    (4, 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cotizaciones para procesos de compraventas, suministros o servicios', etapa_precontractual_id, categoria_samc_id, 15),
    (5, 'CÁMARAS DE COMERCIO COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cámaras de comercio cotizaciones', etapa_precontractual_id, categoria_samc_id, 16),
    (6, 'PRESUPUESTO OFICIAL (PROCESOS DE OBRA PÚBLICA)', 'Presupuesto oficial para procesos de obra pública', etapa_precontractual_id, categoria_samc_id, 17),
    (7, 'PROYECTO DE PLIEGOS', 'Proyecto de pliegos de condiciones', etapa_precontractual_id, categoria_samc_id, 18),
    (8, 'AVISO DE CONVOCATORIA', 'Aviso de convocatoria del proceso', etapa_precontractual_id, categoria_samc_id, 19),
    (9, 'CONCEPTO JURÍDICO', 'Concepto jurídico del proceso', etapa_precontractual_id, categoria_samc_id, 20),
    (10, 'OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Observaciones al proyecto de pliegos cuando se presenten', etapa_precontractual_id, categoria_samc_id, 21),
    (11, 'RESPUESTA A LAS OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones al proyecto de pliegos', etapa_precontractual_id, categoria_samc_id, 22),
    (12, 'SOLICITUD DE LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Solicitud de limitación a MIPYMES específica para SAMC', etapa_precontractual_id, categoria_samc_id, 23),
    (13, 'LIMITACIÓN A MIPYMES(EN CASO DE PRESENTARSE) SOLO SAMC', 'Limitación a MIPYMES específica para SAMC', etapa_precontractual_id, categoria_samc_id, 24),
    (14, 'RESOLUCIÓN DE APERTURA', 'Resolución de apertura del proceso', etapa_precontractual_id, categoria_samc_id, 25),
    (15, 'PLIEGOS DEFINITIVOS', 'Pliegos definitivos del proceso', etapa_precontractual_id, categoria_samc_id, 26),
    (16, 'OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Observaciones al pliego definitivo cuando se presenten', etapa_precontractual_id, categoria_samc_id, 27),
    (17, 'RESPUESTA A OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Respuesta a observaciones al pliego definitivo', etapa_precontractual_id, categoria_samc_id, 28),
    (18, 'ADENDA(EN CASO DE PRESENTARSE)', 'Adenda al proceso cuando se presente', etapa_precontractual_id, categoria_samc_id, 29),
    (19, 'EVALUACIÓN DE LAS OFERTAS', 'Evaluación de las ofertas presentadas', etapa_precontractual_id, categoria_samc_id, 30),
    (20, 'SOLICITUD DE SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Solicitud de subsanación cuando se presente', etapa_precontractual_id, categoria_samc_id, 31),
    (21, 'SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Subsanación cuando se presente', etapa_precontractual_id, categoria_samc_id, 32),
    (22, 'OBSERVACIONES AL INFORME DE EVALUACIÓN (EN CASO DE PRESENTARSE)', 'Observaciones al informe de evaluación cuando se presenten', etapa_precontractual_id, categoria_samc_id, 33),
    (23, 'RESPUESTA A LAS OBSERVACIONES (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones cuando se presenten', etapa_precontractual_id, categoria_samc_id, 34),
    (24, 'ACEPTACIÓN DE OFERTA', 'Aceptación de la oferta seleccionada', etapa_precontractual_id, categoria_samc_id, 35)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    SELECT id INTO categoria_minima_id FROM lista_chequeo_categorias WHERE nombre = 'MINIMA CUANTÍA';
    SELECT id INTO categoria_interadmin_id FROM lista_chequeo_categorias WHERE nombre = 'CONTRATO INTERADMINISTRATIVO';
    SELECT id INTO categoria_servicios_id FROM lista_chequeo_categorias WHERE nombre = 'PRESTACIÓN DE SERVICIOS';
    
    -- Obtener IDs de etapas
    SELECT id INTO etapa_precontractual_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO etapa_contractual_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO etapa_ejecucion_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';
    
    -- ========================================
    -- ITEMS PARA MÍNIMA CUANTÍA
    -- ========================================
    
    -- PRECONTRACTUALES MÍNIMA CUANTÍA
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (1, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'CDP vigente para el proceso de mínima cuantía', etapa_precontractual_id, categoria_minima_id, 12),
    (2, 'SOLICITUD DE CONTRATACIÓN', 'Solicitud de contratación con justificación técnica', etapa_precontractual_id, categoria_minima_id, 13),
    (3, 'COTIZACIONES (MÍNIMO 3)', 'Mínimo tres cotizaciones para comparación de precios', etapa_precontractual_id, categoria_minima_id, 14),
    (4, 'ANÁLISIS DE PRECIOS', 'Análisis comparativo de precios y selección', etapa_precontractual_id, categoria_minima_id, 15),
    (5, 'ESTUDIOS PREVIOS SIMPLIFICADOS', 'Estudios previos simplificados para mínima cuantía', etapa_precontractual_id, categoria_minima_id, 16)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- CONTRACTUALES MÍNIMA CUANTÍA
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (10, 'ORDEN DE COMPRA O CONTRATO', 'Orden de compra o contrato según el caso', etapa_contractual_id, categoria_minima_id, 25),
    (11, 'RUT DEL CONTRATISTA', 'RUT actualizado del contratista', etapa_contractual_id, categoria_minima_id, 26),
    (12, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria si aplica', etapa_contractual_id, categoria_minima_id, 27),
    (13, 'CÉDULA DE CIUDADANÍA', 'Copia de cédula del contratista', etapa_contractual_id, categoria_minima_id, 28)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- EJECUCIÓN MÍNIMA CUANTÍA
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (20, 'FACTURA O CUENTA DE COBRO', 'Factura o cuenta de cobro del contratista', etapa_ejecucion_id, categoria_minima_id, 35),
    (21, 'ACTA DE RECIBO', 'Acta de recibo a satisfacción', etapa_ejecucion_id, categoria_minima_id, 36),
    (22, 'CERTIFICACIÓN DE PAGO', 'Certificación de pago realizado', etapa_ejecucion_id, categoria_minima_id, 37)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- ========================================
    -- ITEMS PARA CONTRATO INTERADMINISTRATIVO
    -- ========================================
    
    -- PRECONTRACTUALES INTERADMINISTRATIVO
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (1, 'ESTUDIOS PREVIOS INTERADMINISTRATIVO', 'Estudios previos justificando la contratación interadministrativa', etapa_precontractual_id, categoria_interadmin_id, 12),
    (2, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'CDP para contrato interadministrativo', etapa_precontractual_id, categoria_interadmin_id, 13),
    (3, 'COMPETENCIAS DE LA ENTIDAD EJECUTORA', 'Verificación de competencias de la entidad ejecutora', etapa_precontractual_id, categoria_interadmin_id, 14),
    (4, 'CAPACIDAD TÉCNICA Y OPERATIVA', 'Verificación de capacidad técnica y operativa', etapa_precontractual_id, categoria_interadmin_id, 15),
    (5, 'PROPUESTA DE LA ENTIDAD EJECUTORA', 'Propuesta técnica y económica de la entidad ejecutora', etapa_precontractual_id, categoria_interadmin_id, 16)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- CONTRACTUALES INTERADMINISTRATIVO
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (10, 'CONVENIO INTERADMINISTRATIVO', 'Convenio interadministrativo firmado', etapa_contractual_id, categoria_interadmin_id, 25),
    (11, 'CERTIFICADO DE EXISTENCIA ENTIDAD', 'Certificado de existencia de la entidad ejecutora', etapa_contractual_id, categoria_interadmin_id, 26),
    (12, 'ACREDITACIÓN REP. LEGAL ENTIDAD', 'Acreditación del representante legal de la entidad', etapa_contractual_id, categoria_interadmin_id, 27),
    (13, 'REGISTRO PRESUPUESTAL', 'Registro presupuestal del convenio', etapa_contractual_id, categoria_interadmin_id, 28)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- EJECUCIÓN INTERADMINISTRATIVO
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (20, 'INFORMES DE EJECUCIÓN', 'Informes periódicos de ejecución del convenio', etapa_ejecucion_id, categoria_interadmin_id, 35),
    (21, 'SUPERVISIÓN DEL CONVENIO', 'Informes de supervisión del convenio', etapa_ejecucion_id, categoria_interadmin_id, 36),
    (22, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación del convenio', etapa_ejecucion_id, categoria_interadmin_id, 37)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- ========================================
    -- ITEMS PARA PRESTACIÓN DE SERVICIOS
    -- ========================================
    
    -- PRECONTRACTUALES PRESTACIÓN DE SERVICIOS
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (1, 'ESTUDIOS PREVIOS', 'Estudios previos para prestación de servicios', etapa_precontractual_id, categoria_servicios_id, 12),
    (2, 'ANÁLISIS DEL SECTOR', 'Análisis del sector de prestación de servicios', etapa_precontractual_id, categoria_servicios_id, 13),
    (3, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'CDP para contrato de prestación de servicios', etapa_precontractual_id, categoria_servicios_id, 14),
    (4, 'TÉRMINOS DE REFERENCIA', 'Términos de referencia del servicio a contratar', etapa_precontractual_id, categoria_servicios_id, 15),
    (5, 'CONVOCATORIA', 'Convocatoria pública para prestación de servicios', etapa_precontractual_id, categoria_servicios_id, 16)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- CONTRACTUALES PRESTACIÓN DE SERVICIOS
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (10, 'CONTRATO DE PRESTACIÓN DE SERVICIOS', 'Contrato de prestación de servicios firmado', etapa_contractual_id, categoria_servicios_id, 25),
    (11, 'HOJA DE VIDA DEL CONTRATISTA', 'Hoja de vida actualizada del contratista', etapa_contractual_id, categoria_servicios_id, 26),
    (12, 'DOCUMENTO DE IDENTIDAD', 'Cédula de ciudadanía del contratista', etapa_contractual_id, categoria_servicios_id, 27),
    (13, 'RUT DEL CONTRATISTA', 'RUT actualizado del contratista', etapa_contractual_id, categoria_servicios_id, 28),
    (14, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria del contratista', etapa_contractual_id, categoria_servicios_id, 29),
    (15, 'AFILIACIÓN A SEGURIDAD SOCIAL', 'Certificación de afiliación a seguridad social', etapa_contractual_id, categoria_servicios_id, 30)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
    -- EJECUCIÓN PRESTACIÓN DE SERVICIOS
    INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id, categoria_id, fila_excel) VALUES
    (20, 'INFORMES DE ACTIVIDADES', 'Informes mensuales de actividades desarrolladas', etapa_ejecucion_id, categoria_servicios_id, 35),
    (21, 'PRODUCTOS ENTREGABLES', 'Productos entregables según contrato', etapa_ejecucion_id, categoria_servicios_id, 36),
    (22, 'CUENTAS DE COBRO', 'Cuentas de cobro del contratista', etapa_ejecucion_id, categoria_servicios_id, 37),
    (23, 'CERTIFICACIÓN SUPERVISOR', 'Certificación del supervisor del contrato', etapa_ejecucion_id, categoria_servicios_id, 38),
    (24, 'AFILIACIÓN SEGURIDAD SOCIAL VIGENTE', 'Certificación vigente de seguridad social', etapa_ejecucion_id, categoria_servicios_id, 39),
    (25, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación del contrato', etapa_ejecucion_id, categoria_servicios_id, 40)
    ON CONFLICT (categoria_id, numero_item) DO NOTHING;
    
END $$;

-- ========================================
-- VERIFICACIÓN DE DATOS INSERTADOS
-- ========================================

-- Resumen por categoría y etapa
SELECT 
    c.nombre as categoria,
    e.nombre as etapa,
    count(i.id) as items
FROM lista_chequeo_categorias c
CROSS JOIN lista_chequeo_etapas e
LEFT JOIN lista_chequeo_items_maestros i ON i.categoria_id = c.id AND i.etapa_id = e.id
GROUP BY c.nombre, c.orden, e.nombre, e.orden
ORDER BY c.orden, e.orden;

-- Total de items por categoría
SELECT 
    c.nombre as categoria,
    count(i.id) as total_items
FROM lista_chequeo_categorias c
LEFT JOIN lista_chequeo_items_maestros i ON i.categoria_id = c.id
GROUP BY c.nombre, c.orden
ORDER BY c.orden;

-- ========================================
-- SCRIPT COMPLETADO
-- ========================================
