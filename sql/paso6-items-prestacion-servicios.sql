-- ========================================
-- PASO 6: INSERTAR ÍTEMS MAESTROS - PRESTACIÓN DE SERVICIOS (51 ÍTEMS)
-- ========================================

DO $$
DECLARE
    prestacion_categoria_id UUID;
    precontractual_etapa_id UUID;
    contractual_etapa_id UUID;
    ejecucion_etapa_id UUID;
    adicion_etapa_id UUID;
BEGIN
    -- Obtener IDs de categoría y etapas
    SELECT id INTO prestacion_categoria_id FROM lista_chequeo_categorias WHERE nombre = 'PRESTACIÓN DE SERVICIOS';
    SELECT id INTO precontractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL';
    SELECT id INTO contractual_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL';
    SELECT id INTO ejecucion_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION';
    SELECT id INTO adicion_etapa_id FROM lista_chequeo_etapas WHERE nombre = 'ADICION';

    -- ETAPA PRECONTRACTUAL (5 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (prestacion_categoria_id, precontractual_etapa_id, 1, 'Solicitud de la Dependencia solicitante', '', '1', 'Solicitud de la Dependencia solicitante', '', 1),
    (prestacion_categoria_id, precontractual_etapa_id, 2, 'Certificado de Disponibilidad Presupuestal', '', '2', 'Certificado de Disponibilidad Presupuestal', '', 2),
    (prestacion_categoria_id, precontractual_etapa_id, 3, 'Estudios y Documentos Previos', '', '3', 'Estudios y Documentos Previos', '', 3),
    (prestacion_categoria_id, precontractual_etapa_id, 4, 'Justificación para contratar directamente', '', '4', 'Justificación para contratar directamente', '', 4),
    (prestacion_categoria_id, precontractual_etapa_id, 5, 'Hoja de Vida y soportes del Contratista', '', '5', 'Hoja de Vida y soportes del Contratista', '', 5);

    -- ETAPA CONTRACTUAL (16 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (prestacion_categoria_id, contractual_etapa_id, 6, 'Certificado de Registro Presupuestal', '', '6', 'Certificado de Registro Presupuestal', '', 6),
    (prestacion_categoria_id, contractual_etapa_id, 7, 'Minuta del Contrato', '', '7', 'Minuta del Contrato', '', 7),
    (prestacion_categoria_id, contractual_etapa_id, 8, 'Fotocopia de Cédula de Ciudadanía del Contratista', '', '8', 'Fotocopia de Cédula de Ciudadanía del Contratista', '', 8),
    (prestacion_categoria_id, contractual_etapa_id, 9, 'Certificación Bancaria', '', '9', 'Certificación Bancaria', '', 9),
    (prestacion_categoria_id, contractual_etapa_id, 10, 'Fotocopia del RUT', '', '10', 'Fotocopia del RUT', '', 10),
    (prestacion_categoria_id, contractual_etapa_id, 11, 'Certificado de Antecedentes Disciplinarios', '', '11', 'Certificado de Antecedentes Disciplinarios', '', 11),
    (prestacion_categoria_id, contractual_etapa_id, 12, 'Certificado de Antecedentes Fiscales', '', '12', 'Certificado de Antecedentes Fiscales', '', 12),
    (prestacion_categoria_id, contractual_etapa_id, 13, 'Certificado de Antecedentes Penales', '', '13', 'Certificado de Antecedentes Penales', '', 13),
    (prestacion_categoria_id, contractual_etapa_id, 14, 'Exámenes Médicos Ocupacionales', '', '14', 'Exámenes Médicos Ocupacionales', '', 14),
    (prestacion_categoria_id, contractual_etapa_id, 15, 'Afiliación al Sistema de Seguridad Social en Salud', '', '15', 'Afiliación al Sistema de Seguridad Social en Salud', '', 15),
    (prestacion_categoria_id, contractual_etapa_id, 16, 'Afiliación al Sistema General de Pensiones', '', '16', 'Afiliación al Sistema General de Pensiones', '', 16),
    (prestacion_categoria_id, contractual_etapa_id, 17, 'Afiliación al Sistema General de Riesgos Laborales', '', '17', 'Afiliación al Sistema General de Riesgos Laborales', '', 17),
    (prestacion_categoria_id, contractual_etapa_id, 18, 'Contrato Firmado', '', '18', 'Contrato Firmado', '', 18),
    (prestacion_categoria_id, contractual_etapa_id, 19, 'Publicación Contrato en SECOP II', '', '19', 'Publicación Contrato en SECOP II', '', 19),
    (prestacion_categoria_id, contractual_etapa_id, 20, 'Registro de Firma del Contrato en SIA', '', '20', 'Registro de Firma del Contrato en SIA', '', 20),
    (prestacion_categoria_id, contractual_etapa_id, 21, 'Acta de Inicio', '', '21', 'Acta de Inicio', '', 21);

    -- ETAPA EJECUCIÓN (18 ítems)
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (prestacion_categoria_id, ejecucion_etapa_id, 22, 'Registro de Acta de Inicio en SIA', '', '22', 'Registro de Acta de Inicio en SIA', '', 22),
    (prestacion_categoria_id, ejecucion_etapa_id, 23, 'Publicación de Acta de Inicio en SECOP II', '', '23', 'Publicación de Acta de Inicio en SECOP II', '', 23),
    (prestacion_categoria_id, ejecucion_etapa_id, 24, 'Informes de Actividades', '', '24', 'Informes de Actividades', '', 24),
    (prestacion_categoria_id, ejecucion_etapa_id, 25, 'Informes de Supervisión', '', '25', 'Informes de Supervisión', '', 25),
    (prestacion_categoria_id, ejecucion_etapa_id, 26, 'Verificación mensual de aportes a seguridad social', '', '26', 'Verificación mensual de aportes a seguridad social', '', 26),
    (prestacion_categoria_id, ejecucion_etapa_id, 27, 'Suspensión (cuando aplique)', '', '27', 'Suspensión (cuando aplique)', '', 27),
    (prestacion_categoria_id, ejecucion_etapa_id, 28, 'Reinicio (cuando aplique)', '', '28', 'Reinicio (cuando aplique)', '', 28),
    (prestacion_categoria_id, ejecucion_etapa_id, 29, 'Cesión (cuando aplique)', '', '29', 'Cesión (cuando aplique)', '', 29),
    (prestacion_categoria_id, ejecucion_etapa_id, 30, 'Modificación (cuando aplique)', '', '30', 'Modificación (cuando aplique)', '', 30),
    (prestacion_categoria_id, ejecucion_etapa_id, 31, 'Prórroga (cuando aplique)', '', '31', 'Prórroga (cuando aplique)', '', 31),
    (prestacion_categoria_id, ejecucion_etapa_id, 32, 'Liquidación del Contrato', '', '32', 'Liquidación del Contrato', '', 32),
    (prestacion_categoria_id, ejecucion_etapa_id, 33, 'Acta de Liquidación', '', '33', 'Acta de Liquidación', '', 33),
    (prestacion_categoria_id, ejecucion_etapa_id, 34, 'Registro de Liquidación en SIA', '', '34', 'Registro de Liquidación en SIA', '', 34),
    (prestacion_categoria_id, ejecucion_etapa_id, 35, 'Publicación de Liquidación en SECOP II', '', '35', 'Publicación de Liquidación en SECOP II', '', 35),
    (prestacion_categoria_id, ejecucion_etapa_id, 36, 'Paz y Salvo de Seguridad Social', '', '36', 'Paz y Salvo de Seguridad Social', '', 36),
    (prestacion_categoria_id, ejecucion_etapa_id, 37, 'Paz y Salvo Parafiscales', '', '37', 'Paz y Salvo Parafiscales', '', 37),
    (prestacion_categoria_id, ejecucion_etapa_id, 38, 'Facturas', '', '38', 'Facturas', '', 38),
    (prestacion_categoria_id, ejecucion_etapa_id, 39, 'Certificación de cumplimiento del objeto contractual', '', '39', 'Certificación de cumplimiento del objeto contractual', '', 39);

    -- ETAPA ADICIÓN (12 ítems) - Solo para Prestación de Servicios
    INSERT INTO lista_chequeo_items_maestros (categoria_id, etapa_id, numero_item, titulo, descripcion, numero, texto, observaciones, orden) VALUES
    (prestacion_categoria_id, adicion_etapa_id, 40, 'Solicitud de Adición al contrato', '', '40', 'Solicitud de Adición al contrato', '', 40),
    (prestacion_categoria_id, adicion_etapa_id, 41, 'Justificación de la Adición', '', '41', 'Justificación de la Adición', '', 41),
    (prestacion_categoria_id, adicion_etapa_id, 42, 'Certificado de Disponibilidad Presupuestal para la Adición', '', '42', 'Certificado de Disponibilidad Presupuestal para la Adición', '', 42),
    (prestacion_categoria_id, adicion_etapa_id, 43, 'Certificado de Registro Presupuestal para la Adición', '', '43', 'Certificado de Registro Presupuestal para la Adición', '', 43),
    (prestacion_categoria_id, adicion_etapa_id, 44, 'Minuta del Otrosí de Adición', '', '44', 'Minuta del Otrosí de Adición', '', 44),
    (prestacion_categoria_id, adicion_etapa_id, 45, 'Verificación de Afiliación a Seguridad Social del Contratista', '', '45', 'Verificación de Afiliación a Seguridad Social del Contratista', '', 45),
    (prestacion_categoria_id, adicion_etapa_id, 46, 'Otrosí Firmado', '', '46', 'Otrosí Firmado', '', 46),
    (prestacion_categoria_id, adicion_etapa_id, 47, 'Publicación del Otrosí en SECOP II', '', '47', 'Publicación del Otrosí en SECOP II', '', 47),
    (prestacion_categoria_id, adicion_etapa_id, 48, 'Registro del Otrosí en SIA', '', '48', 'Registro del Otrosí en SIA', '', 48),
    (prestacion_categoria_id, adicion_etapa_id, 49, 'Acta de Reinicio (cuando aplique)', '', '49', 'Acta de Reinicio (cuando aplique)', '', 49),
    (prestacion_categoria_id, adicion_etapa_id, 50, 'Registro de Acta de Reinicio en SIA (cuando aplique)', '', '50', 'Registro de Acta de Reinicio en SIA (cuando aplique)', '', 50),
    (prestacion_categoria_id, adicion_etapa_id, 51, 'Publicación de Acta de Reinicio en SECOP II (cuando aplique)', '', '51', 'Publicación de Acta de Reinicio en SECOP II (cuando aplique)', '', 51);
    
    RAISE NOTICE 'PASO 6 COMPLETADO: Se insertaron 51 ítems para PRESTACIÓN DE SERVICIOS';
END $$;
