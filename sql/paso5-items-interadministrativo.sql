-- ========================================
-- PASO 5: INSERTAR ÍTEMS MAESTROS - CONTRATO INTERADMINISTRATIVO (29 ÍTEMS)
-- ========================================

DO $$
DECLARE
    inter_categoria_id UUID;
    precontractual_etapa_id UUID;
    contractual_etapa_id UUID;
    ejecucion_etapa_id UUID;
BEGIN
    -- Obtener IDs de categoría y etapas
    SELECT id INTO inter_categoria_id FROM lista_chequeo_categorias WHERE nombre = 'CONTRATO INTERADMINISTRATIVO';
    SELECT id INTO precontractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO contractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO ejecucion_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';

    -- ETAPA PRECONTRACTUAL (5 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (inter_categoria_id, precontractual_etapa_id, 1, 'Solicitud de la Dependencia solicitante', '', '1', 'Solicitud de la Dependencia solicitante', '', 1),
    (inter_categoria_id, precontractual_etapa_id, 2, 'Certificado de Disponibilidad Presupuestal', '', '2', 'Certificado de Disponibilidad Presupuestal', '', 2),
    (inter_categoria_id, precontractual_etapa_id, 3, 'Estudios y Documentos Previos', '', '3', 'Estudios y Documentos Previos', '', 3),
    (inter_categoria_id, precontractual_etapa_id, 4, 'Justificación para contratar directamente', '', '4', 'Justificación para contratar directamente', '', 4),
    (inter_categoria_id, precontractual_etapa_id, 5, 'Verificación de Competencias de la Entidad Contratista', '', '5', 'Verificación de Competencias de la Entidad Contratista', '', 5);

    -- ETAPA CONTRACTUAL (12 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (inter_categoria_id, contractual_etapa_id, 6, 'Certificado de Registro Presupuestal', '', '6', 'Certificado de Registro Presupuestal', '', 6),
    (inter_categoria_id, contractual_etapa_id, 7, 'Minuta del Contrato', '', '7', 'Minuta del Contrato', '', 7),
    (inter_categoria_id, contractual_etapa_id, 8, 'Pólizas (cuando aplique)', '', '8', 'Pólizas (cuando aplique)', '', 8),
    (inter_categoria_id, contractual_etapa_id, 9, 'Resolución o Acuerdo de nombramiento del Representante Legal', '', '9', 'Resolución o Acuerdo de nombramiento del Representante Legal', '', 9),
    (inter_categoria_id, contractual_etapa_id, 10, 'Cédula de Ciudadanía del Representante Legal', '', '10', 'Cédula de Ciudadanía del Representante Legal', '', 10),
    (inter_categoria_id, contractual_etapa_id, 11, 'Certificación Bancaria', '', '11', 'Certificación Bancaria', '', 11),
    (inter_categoria_id, contractual_etapa_id, 12, 'Contrato Firmado', '', '12', 'Contrato Firmado', '', 12),
    (inter_categoria_id, contractual_etapa_id, 13, 'Publicación Contrato en SECOP II', '', '13', 'Publicación Contrato en SECOP II', '', 13),
    (inter_categoria_id, contractual_etapa_id, 14, 'Registro de Firma del Contrato en SIA', '', '14', 'Registro de Firma del Contrato en SIA', '', 14),
    (inter_categoria_id, contractual_etapa_id, 15, 'Acta de Inicio', '', '15', 'Acta de Inicio', '', 15),
    (inter_categoria_id, contractual_etapa_id, 16, 'Registro de Acta de Inicio en SIA', '', '16', 'Registro de Acta de Inicio en SIA', '', 16),
    (inter_categoria_id, contractual_etapa_id, 17, 'Publicación de Acta de Inicio en SECOP II', '', '17', 'Publicación de Acta de Inicio en SECOP II', '', 17);

    -- ETAPA EJECUCIÓN (12 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (inter_categoria_id, ejecucion_etapa_id, 18, 'Informes de Supervisión', '', '18', 'Informes de Supervisión', '', 18),
    (inter_categoria_id, ejecucion_etapa_id, 19, 'Suspensión (cuando aplique)', '', '19', 'Suspensión (cuando aplique)', '', 19),
    (inter_categoria_id, ejecucion_etapa_id, 20, 'Reinicio (cuando aplique)', '', '20', 'Reinicio (cuando aplique)', '', 20),
    (inter_categoria_id, ejecucion_etapa_id, 21, 'Modificación (cuando aplique)', '', '21', 'Modificación (cuando aplique)', '', 21),
    (inter_categoria_id, ejecucion_etapa_id, 22, 'Adición (cuando aplique)', '', '22', 'Adición (cuando aplique)', '', 22),
    (inter_categoria_id, ejecucion_etapa_id, 23, 'Prórroga (cuando aplique)', '', '23', 'Prórroga (cuando aplique)', '', 23),
    (inter_categoria_id, ejecucion_etapa_id, 24, 'Actualización de Pólizas (cuando aplique)', '', '24', 'Actualización de Pólizas (cuando aplique)', '', 24),
    (inter_categoria_id, ejecucion_etapa_id, 25, 'Liquidación del Contrato', '', '25', 'Liquidación del Contrato', '', 25),
    (inter_categoria_id, ejecucion_etapa_id, 26, 'Acta de Liquidación', '', '26', 'Acta de Liquidación', '', 26),
    (inter_categoria_id, ejecucion_etapa_id, 27, 'Registro de Liquidación en SIA', '', '27', 'Registro de Liquidación en SIA', '', 27),
    (inter_categoria_id, ejecucion_etapa_id, 28, 'Publicación de Liquidación en SECOP II', '', '28', 'Publicación de Liquidación en SECOP II', '', 28),
    (inter_categoria_id, ejecucion_etapa_id, 29, 'Acta de Recibo Final de los Bienes y/o Servicios', '', '29', 'Acta de Recibo Final de los Bienes y/o Servicios', '', 29);
    
    RAISE NOTICE 'PASO 5 COMPLETADO: Se insertaron 29 ítems para CONTRATO INTERADMINISTRATIVO';
END $$;
