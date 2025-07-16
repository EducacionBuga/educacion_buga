-- ========================================
-- PASO 4: INSERTAR ÍTEMS MAESTROS - MÍNIMA CUANTÍA (51 ÍTEMS)
-- ========================================

DO $$
DECLARE
    minima_categoria_id UUID;
    precontractual_etapa_id UUID;
    contractual_etapa_id UUID;
    ejecucion_etapa_id UUID;
BEGIN
    -- Obtener IDs de categoría y etapas
    SELECT id INTO minima_categoria_id FROM lista_chequeo_categorias WHERE nombre = 'MINIMA CUANTÍA';
    SELECT id INTO precontractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO contractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO ejecucion_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';

    -- ETAPA PRECONTRACTUAL (15 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (minima_categoria_id, precontractual_etapa_id, 1, 'Solicitud de la Dependencia solicitante', '', '1', 'Solicitud de la Dependencia solicitante', '', 1),
    (minima_categoria_id, precontractual_etapa_id, 2, 'Certificado de Disponibilidad Presupuestal', '', '2', 'Certificado de Disponibilidad Presupuestal', '', 2),
    (minima_categoria_id, precontractual_etapa_id, 3, 'Estudios y Documentos Previos', '', '3', 'Estudios y Documentos Previos', '', 3),
    (minima_categoria_id, precontractual_etapa_id, 4, 'Invitación Pública', '', '4', 'Invitación Pública', '', 4),
    (minima_categoria_id, precontractual_etapa_id, 5, 'Pliego de Condiciones', '', '5', 'Pliego de Condiciones', '', 5),
    (minima_categoria_id, precontractual_etapa_id, 6, 'Publicación en SECOP II', '', '6', 'Publicación en SECOP II', '', 6),
    (minima_categoria_id, precontractual_etapa_id, 7, 'Informe de Evaluación', '', '7', 'Informe de Evaluación', '', 7),
    (minima_categoria_id, precontractual_etapa_id, 8, 'Respuesta a Observaciones al Pliego de Condiciones', '', '8', 'Respuesta a Observaciones al Pliego de Condiciones', '', 8),
    (minima_categoria_id, precontractual_etapa_id, 9, 'Anexo Técnico', '', '9', 'Anexo Técnico', '', 9),
    (minima_categoria_id, precontractual_etapa_id, 10, 'Presentación de Propuestas', '', '10', 'Presentación de Propuestas', '', 10),
    (minima_categoria_id, precontractual_etapa_id, 11, 'Evaluación de Ofertas', '', '11', 'Evaluación de Ofertas', '', 11),
    (minima_categoria_id, precontractual_etapa_id, 12, 'Informe de Evaluación de Ofertas', '', '12', 'Informe de Evaluación de Ofertas', '', 12),
    (minima_categoria_id, precontractual_etapa_id, 13, 'Adjudicación', '', '13', 'Adjudicación', '', 13),
    (minima_categoria_id, precontractual_etapa_id, 14, 'Comunicación de Adjudicación', '', '14', 'Comunicación de Adjudicación', '', 14),
    (minima_categoria_id, precontractual_etapa_id, 15, 'Auto que declara desierto el proceso (cuando aplique)', '', '15', 'Auto que declara desierto el proceso (cuando aplique)', '', 15);

    -- ETAPA CONTRACTUAL (18 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (minima_categoria_id, contractual_etapa_id, 16, 'Certificado de Registro Presupuestal', '', '16', 'Certificado de Registro Presupuestal', '', 16),
    (minima_categoria_id, contractual_etapa_id, 17, 'Minuta del Contrato', '', '17', 'Minuta del Contrato', '', 17),
    (minima_categoria_id, contractual_etapa_id, 18, 'Pólizas', '', '18', 'Pólizas', '', 18),
    (minima_categoria_id, contractual_etapa_id, 19, 'Registro Único Tributario RUT', '', '19', 'Registro Único Tributario RUT', '', 19),
    (minima_categoria_id, contractual_etapa_id, 20, 'Cámara de Comercio', '', '20', 'Cámara de Comercio', '', 20),
    (minima_categoria_id, contractual_etapa_id, 21, 'Cédula de Ciudadanía del Representante Legal', '', '21', 'Cédula de Ciudadanía del Representante Legal', '', 21),
    (minima_categoria_id, contractual_etapa_id, 22, 'Certificación Bancaria', '', '22', 'Certificación Bancaria', '', 22),
    (minima_categoria_id, contractual_etapa_id, 23, 'Autorización de la Junta Directiva (cuando aplique)', '', '23', 'Autorización de la Junta Directiva (cuando aplique)', '', 23),
    (minima_categoria_id, contractual_etapa_id, 24, 'Certificación del revisor fiscal (cuando aplique)', '', '24', 'Certificación del revisor fiscal (cuando aplique)', '', 24),
    (minima_categoria_id, contractual_etapa_id, 25, 'Contrato Firmado', '', '25', 'Contrato Firmado', '', 25),
    (minima_categoria_id, contractual_etapa_id, 26, 'Publicación Contrato en SECOP II', '', '26', 'Publicación Contrato en SECOP II', '', 26),
    (minima_categoria_id, contractual_etapa_id, 27, 'Registro de Firma del Contrato en SIA', '', '27', 'Registro de Firma del Contrato en SIA', '', 27),
    (minima_categoria_id, contractual_etapa_id, 28, 'Acta de Inicio', '', '28', 'Acta de Inicio', '', 28),
    (minima_categoria_id, contractual_etapa_id, 29, 'Registro de Acta de Inicio en SIA', '', '29', 'Registro de Acta de Inicio en SIA', '', 29),
    (minima_categoria_id, contractual_etapa_id, 30, 'Publicación de Acta de Inicio en SECOP II', '', '30', 'Publicación de Acta de Inicio en SECOP II', '', 30),
    (minima_categoria_id, contractual_etapa_id, 31, 'Acta de inicio firmada por el supervisor', '', '31', 'Acta de inicio firmada por el supervisor', '', 31),
    (minima_categoria_id, contractual_etapa_id, 32, 'Verificación de Afiliación a Seguridad Social del Contratista', '', '32', 'Verificación de Afiliación a Seguridad Social del Contratista', '', 32),
    (minima_categoria_id, contractual_etapa_id, 33, 'Registro Fotográfico de la Obra (cuando aplique)', '', '33', 'Registro Fotográfico de la Obra (cuando aplique)', '', 33);

    -- ETAPA EJECUCIÓN (18 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (minima_categoria_id, ejecucion_etapa_id, 34, 'Informes de Supervisión', '', '34', 'Informes de Supervisión', '', 34),
    (minima_categoria_id, ejecucion_etapa_id, 35, 'Suspensión (cuando aplique)', '', '35', 'Suspensión (cuando aplique)', '', 35),
    (minima_categoria_id, ejecucion_etapa_id, 36, 'Reinicio (cuando aplique)', '', '36', 'Reinicio (cuando aplique)', '', 36),
    (minima_categoria_id, ejecucion_etapa_id, 37, 'Cesión (cuando aplique)', '', '37', 'Cesión (cuando aplique)', '', 37),
    (minima_categoria_id, ejecucion_etapa_id, 38, 'Modificación (cuando aplique)', '', '38', 'Modificación (cuando aplique)', '', 38),
    (minima_categoria_id, ejecucion_etapa_id, 39, 'Adición (cuando aplique)', '', '39', 'Adición (cuando aplique)', '', 39),
    (minima_categoria_id, ejecucion_etapa_id, 40, 'Prórroga (cuando aplique)', '', '40', 'Prórroga (cuando aplique)', '', 40),
    (minima_categoria_id, ejecucion_etapa_id, 41, 'Actualización de Pólizas (cuando aplique)', '', '41', 'Actualización de Pólizas (cuando aplique)', '', 41),
    (minima_categoria_id, ejecucion_etapa_id, 42, 'Liquidación del Contrato', '', '42', 'Liquidación del Contrato', '', 42),
    (minima_categoria_id, ejecucion_etapa_id, 43, 'Acta de Liquidación', '', '43', 'Acta de Liquidación', '', 43),
    (minima_categoria_id, ejecucion_etapa_id, 44, 'Registro de Liquidación en SIA', '', '44', 'Registro de Liquidación en SIA', '', 44),
    (minima_categoria_id, ejecucion_etapa_id, 45, 'Publicación de Liquidación en SECOP II', '', '45', 'Publicación de Liquidación en SECOP II', '', 45),
    (minima_categoria_id, ejecucion_etapa_id, 46, 'Registro fotográfico de la Obra terminada (cuando aplique)', '', '46', 'Registro fotográfico de la Obra terminada (cuando aplique)', '', 46),
    (minima_categoria_id, ejecucion_etapa_id, 47, 'Paz y Salvo de Seguridad Social', '', '47', 'Paz y Salvo de Seguridad Social', '', 47),
    (minima_categoria_id, ejecucion_etapa_id, 48, 'Paz y Salvo Parafiscales', '', '48', 'Paz y Salvo Parafiscales', '', 48),
    (minima_categoria_id, ejecucion_etapa_id, 49, 'Balance General y Estado de Resultados (cuando aplique)', '', '49', 'Balance General y Estado de Resultados (cuando aplique)', '', 49),
    (minima_categoria_id, ejecucion_etapa_id, 50, 'Facturas', '', '50', 'Facturas', '', 50),
    (minima_categoria_id, ejecucion_etapa_id, 51, 'Acta de Recibo Final de los Bienes y/o Servicios', '', '51', 'Acta de Recibo Final de los Bienes y/o Servicios', '', 51);
    
    RAISE NOTICE 'PASO 4 COMPLETADO: Se insertaron 51 ítems para MÍNIMA CUANTÍA';
END $$;
