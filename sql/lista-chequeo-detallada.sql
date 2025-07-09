-- SQL para crear la estructura exacta de listas de chequeo según la plantilla Excel
-- Basado en la información detallada proporcionada por el usuario
-- SOLO modifica tablas relacionadas con listas de chequeo

-- Limpiar SOLO tablas de lista de chequeo (en orden correcto para evitar errores de FK)
DROP TABLE IF EXISTS lista_chequeo_respuestas CASCADE;
DROP TABLE IF EXISTS lista_chequeo_item_categorias CASCADE;
DROP TABLE IF EXISTS lista_chequeo_items_maestros CASCADE;
DROP TABLE IF EXISTS lista_chequeo_etapas CASCADE;
DROP TABLE IF EXISTS lista_chequeo_categorias CASCADE;
-- Eliminar tabla antigua si existe
DROP TABLE IF EXISTS lista_chequeo_items CASCADE;

-- 1. Crear tabla de categorías (tipos de contrato)
CREATE TABLE lista_chequeo_categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    hoja_excel VARCHAR(50) NOT NULL,
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de etapas
CREATE TABLE lista_chequeo_etapas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    orden INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de items maestros
CREATE TABLE lista_chequeo_items_maestros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_item INTEGER NOT NULL,
    titulo VARCHAR(300) NOT NULL,
    descripcion TEXT,
    etapa_id UUID REFERENCES lista_chequeo_etapas(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Crear tabla de relación items-categorías
CREATE TABLE lista_chequeo_item_categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
    fila_excel INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, categoria_id)
);

-- 5. Crear tabla de respuestas
CREATE TABLE lista_chequeo_respuestas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    area_id UUID REFERENCES areas(id),
    categoria_id UUID REFERENCES lista_chequeo_categorias(id),
    item_id UUID REFERENCES lista_chequeo_items_maestros(id),
    respuesta VARCHAR(20) CHECK (respuesta IN ('CUMPLE', 'NO_CUMPLE', 'NO_APLICA')),
    observaciones TEXT,
    user_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(area_id, categoria_id, item_id)
);

-- 6. Insertar categorías
INSERT INTO lista_chequeo_categorias (nombre, descripcion, hoja_excel, orden) VALUES
('SAMC', 'Subasta Abierta de Mayor Cuantía', 'SAMC', 1),
('MINIMA CUANTÍA', 'Contrato de Mínima Cuantía', 'MINIMA CUANTÍA', 2),
('CONTRATO INTERADMINISTRATIVO', 'Contrato Interadministrativo', 'CONTRATO INTERADMINISTRATIVO', 3),
('PRESTACIÓN DE SERVICIOS', 'Prestación de Servicios', 'PRESTACIÓN DE SERVICIOS', 4);

-- 7. Insertar etapas
INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) VALUES
('PRECONTRACTUAL', 'Etapa Precontractual', 1),
('CONTRACTUAL', 'Etapa Contractual', 2),
('EJECUCION', 'Etapa de Ejecución', 3),
('ADICION', 'Etapa de Adición al Contrato (Cuando Aplique)', 4);

-- 8. Insertar items maestros según la estructura proporcionada
WITH etapas AS (
    SELECT id, nombre FROM lista_chequeo_etapas
)
INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id) VALUES
-- SAMC - Etapa Precontractual (1-24)
(1, 'FICHA MGA (PROCESOS DE INVERSIÓN)', 'Ficha MGA para procesos de inversión', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(2, 'CERTIFICADO DE VIABILIDAD Y REGISTRO', 'Certificado de viabilidad y registro', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(3, 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', 'Estudios previos y análisis del sector', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(4, 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cotizaciones para procesos de compraventas, suministros o servicios', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(5, 'CÁMARAS DE COMERCIO COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cámaras de comercio cotizaciones', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(6, 'PRESUPUESTO OFICIAL (PROCESOS DE OBRA PÚBLICA)', 'Presupuesto oficial para procesos de obra pública', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(7, 'PROYECTO DE PLIEGOS', 'Proyecto de pliegos', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(8, 'AVISO DE CONVOCATORIA', 'Aviso de convocatoria', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(9, 'CONCEPTO JURÍDICO', 'Concepto jurídico', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(10, 'OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Observaciones al proyecto de pliegos', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(11, 'RESPUESTA A LAS OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones al proyecto de pliegos', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(12, 'SOLICITUD DE LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Solicitud de limitación a MIPYMES', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(13, 'LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Limitación a MIPYMES', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(14, 'RESOLUCIÓN DE APERTURA', 'Resolución de apertura', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(15, 'PLIEGOS DEFINITIVOS', 'Pliegos definitivos', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(16, 'OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Observaciones al pliego definitivo', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(17, 'RESPUESTA A OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Respuesta a observaciones al pliego definitivo', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(18, 'ADENDA (EN CASO DE PRESENTARSE)', 'Adenda', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(19, 'EVALUACIÓN DE LAS OFERTAS', 'Evaluación de las ofertas', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(20, 'SOLICITUD DE SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Solicitud de subsanación', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(21, 'SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Subsanación', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(22, 'OBSERVACIONES AL INFORME DE EVALUACIÓN (EN CASO DE PRESENTARSE)', 'Observaciones al informe de evaluación', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(23, 'RESPUESTA A LAS OBSERVACIONES (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(24, 'ACEPTACIÓN DE OFERTA', 'Aceptación de oferta (SAMC)', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),

-- SAMC - Etapa Contractual (25-42)
(25, 'MINUTA DE CONTRATO', 'Minuta de contrato', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(26, 'HOJA DE VIDA Y DOCUMENTOS REP. LEGAL', 'Hoja de vida y documentos del representante legal', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(27, 'CÁMARA DE COMERCIO (SI APLICA)', 'Cámara de comercio', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(28, 'RUT', 'RUT', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(29, 'FOTOCOPIA CÉDULA', 'Fotocopia de cédula', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(30, 'FOTOCOPIA LIBRETA MILITAR (SI APLICA)', 'Fotocopia libreta militar', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(31, 'CERTIFICADOS ANTECEDENTES (FISCALES, DISCIPLINARIOS, JUDICIALES, MEDIDAS CORRECTIVAS, DELITOS SEXUALES, REDAM, PACO-CONTRATISTAS)', 'Certificados de antecedentes', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(32, 'RUT (SEGUNDA COPIA PARA FIRMA)', 'RUT segunda copia para firma', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(33, 'DECLARACIÓN JURAMENTADA DE BIENES Y RENTAS', 'Declaración juramentada de bienes y rentas', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(34, 'FORMULARIO ÚNICO DE INSCRIPCIÓN DE TERCEROS', 'Formulario único de inscripción de terceros', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(35, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(36, 'CONCEPTO JURÍDICO', 'Concepto jurídico contractual', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(37, 'DESIGNACIÓN SUPERVISIÓN', 'Designación de supervisión', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(38, 'REGISTRO PRESUPUESTAL', 'Registro presupuestal', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(39, 'PÓLIZAS', 'Pólizas', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(40, 'RECIBO DE PAGO PÓLIZAS', 'Recibo de pago de pólizas', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(41, 'RESOLUCIÓN DE APROBACIÓN DE PÓLIZAS', 'Resolución de aprobación de pólizas', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(42, 'ACTA DE INICIO', 'Acta de inicio', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),

-- SAMC - Etapa de Ejecución (43-51)
(43, 'INFORMES DE EJECUCIÓN DEL CONTRATO', 'Informes de ejecución del contrato', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(44, 'ENTRADA DE ALMACÉN (PROCESOS DE COMPRAVENTA)', 'Entrada de almacén para procesos de compraventa', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(45, 'INFORMES DE SUPERVISIÓN', 'Informes de supervisión', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(46, 'PAGO SISTEMA INTEGRAL DE SEGURIDAD SOCIAL', 'Pago sistema integral de seguridad social', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(47, 'FACTURAS O CUENTAS DE COBRO', 'Facturas o cuentas de cobro', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(48, 'ÓRDENES DE PAGO', 'Órdenes de pago', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(49, 'COMPROBANTE DE EGRESO', 'Comprobante de egreso', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(50, 'INFORME FINAL DE EJECUCIÓN', 'Informe final de ejecución', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(51, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),

-- Items adicionales específicos para otros contratos (52-100)
(52, 'RESOLUCIÓN DE ADJUDICACIÓN', 'Resolución de adjudicación (MÍNIMA CUANTÍA)', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(53, 'CERTIFICADO DE VIABILIDAD (PROCESOS DE INVERSIÓN)', 'Certificado de viabilidad para procesos de inversión', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(54, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'Certificado de disponibilidad presupuestal', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(55, 'COTIZACIONES E.S.A.L', 'Cotizaciones E.S.A.L', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(56, 'CÁMARA DE COMERCIO COTIZACIONES E.S.A.L', 'Cámara de comercio cotizaciones E.S.A.L', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(57, 'PRESUPUESTO OFICIAL PROMEDIADO', 'Presupuesto oficial promediado', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(58, 'INVITACIÓN A PARTICIPAR', 'Invitación a participar', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(59, 'EVALUACIÓN DE OFERTAS (PROCESO CON PRESENTACIÓN DE OFERTA)', 'Evaluación de ofertas con presentación de oferta', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(60, 'ACEPTACIÓN DE LA OFERTA', 'Aceptación de la oferta', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(61, 'MINUTA CONVENIO', 'Minuta de convenio', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(62, 'RESOLUCIÓN VERIFICACIÓN Y APROBACIÓN DE PÓLIZAS', 'Resolución verificación y aprobación de pólizas', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(63, 'INFORME INTERVINIENTE', 'Informe del interviniente', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(64, 'CERTIFICADO PERSONAL NO SUFICIENTE', 'Certificado personal no suficiente', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(65, 'INVITACIÓN A PRESENTAR PROPUESTA', 'Invitación a presentar propuesta', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(66, 'PROPUESTA CONTRACTUAL O COTIZACIÓN', 'Propuesta contractual o cotización', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(67, 'HOJA DE VIDA SIGEP', 'Hoja de vida SIGEP', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(68, 'CERTIFICADO EXAMEN MÉDICO OCUPACIONAL', 'Certificado examen médico ocupacional', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(69, 'CERTIFICACIONES DE ESTUDIO', 'Certificaciones de estudio', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(70, 'TARJETA PROFESIONAL', 'Tarjeta profesional', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(71, 'RETHUS – ANTECEDENTES PERSONA DE LA SALUD (SI APLICA)', 'RETHUS - Antecedentes persona de la salud', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(72, 'CERTIFICACIONES LABORALES', 'Certificaciones laborales', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(73, 'PUBLICACIÓN SECOP 2', 'Publicación SECOP 2', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(74, 'CERTIFICADO PERSONAL IDÓNEO', 'Certificado personal idóneo', (SELECT id FROM etapas WHERE nombre = 'PRECONTRACTUAL')),
(75, 'DESIGNACIÓN SUPERVISOR CONTRATO', 'Designación supervisor contrato', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(76, 'SOLICITUD REGISTRO PRESUPUESTAL', 'Solicitud registro presupuestal', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(77, 'CERTIFICADO AFILIACIÓN A SALUD Y PENSIÓN', 'Certificado afiliación a salud y pensión', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(78, 'AFILIACIÓN ARL', 'Afiliación ARL', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(79, 'ACEPTACIÓN CONTRATO SECOP', 'Aceptación contrato SECOP', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(80, 'PUBLICACIÓN SIA OBSERVA', 'Publicación SIA OBSERVA', (SELECT id FROM etapas WHERE nombre = 'CONTRACTUAL')),
(81, 'PLANILLAS DE SEGURIDAD SOCIAL', 'Planillas de seguridad social', (SELECT id FROM etapas WHERE nombre = 'EJECUCION')),
(82, 'MODIFICACIONES O ADICIONES AL CONTRATO (SI APLICA)', 'Modificaciones o adiciones al contrato', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(83, 'MGA ADICIÓN (POR PROYECTO)', 'MGA adición por proyecto', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(84, 'VIABILIDAD ADICIÓN (POR PROYECTO)', 'Viabilidad adición por proyecto', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(85, 'CDP', 'CDP', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(86, 'JUSTIFICACIÓN (ADICIÓN, PRÓRROGA, SUSPENSIÓN, REINICIO, MODIFICACIÓN, TERMINACIÓN Y/O CESIÓN DE CONTRATO)', 'Justificación de modificaciones contractuales', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(87, 'MINUTA DE ADICIÓN AL CONTRATO', 'Minuta de adición al contrato', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(88, 'CONCEPTO JURÍDICO ADICIÓN', 'Concepto jurídico adición', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(89, 'SOLICITUD CRP ADICIÓN', 'Solicitud CRP adición', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(90, 'CRP ADICIÓN', 'CRP adición', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(91, 'ARL ADICIÓN', 'ARL adición', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(92, 'ACEPTACIÓN ADICIÓN SECOP 2', 'Aceptación adición SECOP 2', (SELECT id FROM etapas WHERE nombre = 'ADICION')),
(93, 'SIA OBSERVA ADICIÓN', 'SIA OBSERVA adición', (SELECT id FROM etapas WHERE nombre = 'ADICION'));

-- 9. Relacionar items con categorías y asignar filas de Excel
-- Primero obtenemos los IDs de las categorías
DO $$
DECLARE
    samc_id UUID;
    minima_id UUID;
    interadmin_id UUID;
    prestacion_id UUID;
    item_rec RECORD;
BEGIN
    -- Obtener IDs de categorías
    SELECT id INTO samc_id FROM lista_chequeo_categorias WHERE nombre = 'SAMC';
    SELECT id INTO minima_id FROM lista_chequeo_categorias WHERE nombre = 'MINIMA CUANTÍA';
    SELECT id INTO interadmin_id FROM lista_chequeo_categorias WHERE nombre = 'CONTRATO INTERADMINISTRATIVO';
    SELECT id INTO prestacion_id FROM lista_chequeo_categorias WHERE nombre = 'PRESTACIÓN DE SERVICIOS';

    -- SAMC: Items 1-51 (mapeo según ROW_MAP)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item BETWEEN 1 AND 51 LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, samc_id, 
            CASE item_rec.numero_item
                WHEN 1 THEN 12 WHEN 2 THEN 13 WHEN 3 THEN 14 WHEN 4 THEN 15 WHEN 5 THEN 16
                WHEN 6 THEN 17 WHEN 7 THEN 18 WHEN 8 THEN 19 WHEN 9 THEN 20 WHEN 10 THEN 21
                WHEN 11 THEN 22 WHEN 12 THEN 23 WHEN 13 THEN 24 WHEN 14 THEN 25 WHEN 15 THEN 26
                WHEN 16 THEN 27 WHEN 17 THEN 28 WHEN 18 THEN 29 WHEN 19 THEN 30 WHEN 20 THEN 31
                WHEN 21 THEN 32 WHEN 22 THEN 33 WHEN 23 THEN 34 WHEN 24 THEN 35 WHEN 25 THEN 36
                WHEN 26 THEN 37 WHEN 27 THEN 38 WHEN 28 THEN 39 WHEN 29 THEN 40 WHEN 30 THEN 41
                WHEN 31 THEN 42 WHEN 32 THEN 43 WHEN 33 THEN 44 WHEN 34 THEN 45 WHEN 35 THEN 46
                WHEN 36 THEN 48 WHEN 37 THEN 49 WHEN 38 THEN 50 WHEN 39 THEN 51 WHEN 40 THEN 52
                WHEN 41 THEN 53 WHEN 42 THEN 54 WHEN 43 THEN 56 WHEN 44 THEN 57 WHEN 45 THEN 58
                WHEN 46 THEN 59 WHEN 47 THEN 60 WHEN 48 THEN 61 WHEN 49 THEN 62 WHEN 50 THEN 63
                WHEN 51 THEN 64
            END
        );
    END LOOP;

    -- MINIMA CUANTÍA: Items 1-23, 52 (item 24 reemplazado por 52), 25-51
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item BETWEEN 1 AND 23 LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, minima_id, 
            CASE item_rec.numero_item
                WHEN 1 THEN 12 WHEN 2 THEN 13 WHEN 3 THEN 14 WHEN 4 THEN 15 WHEN 5 THEN 16
                WHEN 6 THEN 17 WHEN 7 THEN 18 WHEN 8 THEN 19 WHEN 9 THEN 20 WHEN 10 THEN 21
                WHEN 11 THEN 22 WHEN 12 THEN 23 WHEN 13 THEN 24 WHEN 14 THEN 25 WHEN 15 THEN 26
                WHEN 16 THEN 27 WHEN 17 THEN 28 WHEN 18 THEN 29 WHEN 19 THEN 30 WHEN 20 THEN 31
                WHEN 21 THEN 32 WHEN 22 THEN 33 WHEN 23 THEN 34
            END
        );
    END LOOP;

    -- Agregar item 52 (RESOLUCIÓN DE ADJUDICACIÓN) en posición 24 para MÍNIMA CUANTÍA
    INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
    SELECT id, minima_id, 35 FROM lista_chequeo_items_maestros WHERE numero_item = 52;

    -- Agregar items 25-51 para MÍNIMA CUANTÍA
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item BETWEEN 25 AND 51 LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, minima_id, 
            CASE item_rec.numero_item
                WHEN 25 THEN 36 WHEN 26 THEN 37 WHEN 27 THEN 38 WHEN 28 THEN 39 WHEN 29 THEN 40
                WHEN 30 THEN 41 WHEN 31 THEN 42 WHEN 32 THEN 43 WHEN 33 THEN 44 WHEN 34 THEN 45
                WHEN 35 THEN 46 WHEN 36 THEN 48 WHEN 37 THEN 49 WHEN 38 THEN 50 WHEN 39 THEN 51
                WHEN 40 THEN 52 WHEN 41 THEN 53 WHEN 42 THEN 54 WHEN 43 THEN 56 WHEN 44 THEN 57
                WHEN 45 THEN 58 WHEN 46 THEN 59 WHEN 47 THEN 60 WHEN 48 THEN 61 WHEN 49 THEN 62
                WHEN 50 THEN 63 WHEN 51 THEN 64
            END
        );
    END LOOP;

    -- CONTRATO INTERADMINISTRATIVO: Items específicos según mapeo
    -- Precontractual (1-12 + items específicos)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (1,53,54,55,56,57,3,58,59,10,11,60) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, interadmin_id, 
            CASE item_rec.numero_item
                WHEN 1 THEN 12 WHEN 53 THEN 13 WHEN 54 THEN 14 WHEN 55 THEN 15 WHEN 56 THEN 16
                WHEN 57 THEN 17 WHEN 3 THEN 18 WHEN 58 THEN 19 WHEN 59 THEN 20 WHEN 10 THEN 21
                WHEN 11 THEN 22 WHEN 60 THEN 23
            END
        );
    END LOOP;

    -- Contractual (61 + items específicos)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (61,9,38,39,40,62,37,42,63) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, interadmin_id, 
            CASE item_rec.numero_item
                WHEN 61 THEN 25 WHEN 9 THEN 26 WHEN 38 THEN 27 WHEN 39 THEN 28 WHEN 40 THEN 29
                WHEN 62 THEN 30 WHEN 37 THEN 31 WHEN 42 THEN 32 WHEN 63 THEN 33
            END
        );
    END LOOP;

    -- Ejecución (43,45,46,47,48,49,50,51)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (43,45,46,47,48,49,50,51) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, interadmin_id, 
            CASE item_rec.numero_item
                WHEN 43 THEN 35 WHEN 45 THEN 36 WHEN 46 THEN 37 WHEN 47 THEN 38
                WHEN 48 THEN 39 WHEN 49 THEN 40 WHEN 50 THEN 41 WHEN 51 THEN 42
            END
        );
    END LOOP;

    -- PRESTACIÓN DE SERVICIOS: Items específicos según descripción
    -- Precontractual (1,53,54,64,3,65,66,67,29,30,31,28,33,34,35,68,69,70,71,72,73,74)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (1,53,54,64,3,65,66,67,29,30,31,28,33,34,35,68,69,70,71,72,73,74) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, prestacion_id, 
            CASE item_rec.numero_item
                WHEN 1 THEN 12 WHEN 53 THEN 13 WHEN 54 THEN 14 WHEN 64 THEN 15 WHEN 3 THEN 16
                WHEN 65 THEN 17 WHEN 66 THEN 18 WHEN 67 THEN 19 WHEN 29 THEN 20 WHEN 30 THEN 21
                WHEN 31 THEN 22 WHEN 28 THEN 23 WHEN 33 THEN 24 WHEN 34 THEN 25 WHEN 35 THEN 26
                WHEN 68 THEN 27 WHEN 69 THEN 28 WHEN 70 THEN 29 WHEN 71 THEN 30 WHEN 72 THEN 31
                WHEN 73 THEN 32 WHEN 74 THEN 33
            END
        );
    END LOOP;

    -- Contractual (25,9,75,76,38,77,78,79,42,80)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (25,9,75,76,38,77,78,79,42,80) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, prestacion_id, 
            CASE item_rec.numero_item
                WHEN 25 THEN 35 WHEN 9 THEN 36 WHEN 75 THEN 37 WHEN 76 THEN 38 WHEN 38 THEN 39
                WHEN 77 THEN 40 WHEN 78 THEN 41 WHEN 79 THEN 42 WHEN 42 THEN 43 WHEN 80 THEN 44
            END
        );
    END LOOP;

    -- Ejecución (48,47,81,43,45,49)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item IN (48,47,81,43,45,49) LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, prestacion_id, 
            CASE item_rec.numero_item
                WHEN 48 THEN 48 WHEN 47 THEN 49 WHEN 81 THEN 50 WHEN 43 THEN 51
                WHEN 45 THEN 52 WHEN 49 THEN 53
            END
        );
    END LOOP;

    -- Adición (82-93)
    FOR item_rec IN SELECT id, numero_item FROM lista_chequeo_items_maestros WHERE numero_item BETWEEN 82 AND 93 LOOP
        INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
        VALUES (item_rec.id, prestacion_id, 
            CASE item_rec.numero_item
                WHEN 82 THEN 56 WHEN 83 THEN 57 WHEN 84 THEN 58 WHEN 85 THEN 59 WHEN 86 THEN 60
                WHEN 87 THEN 61 WHEN 88 THEN 62 WHEN 89 THEN 63 WHEN 90 THEN 64 WHEN 91 THEN 65
                WHEN 92 THEN 66 WHEN 93 THEN 67
            END
        );
    END LOOP;

END $$;

-- 10. Crear índices para optimización
CREATE INDEX idx_lista_chequeo_respuestas_area ON lista_chequeo_respuestas(area_id);
CREATE INDEX idx_lista_chequeo_respuestas_categoria ON lista_chequeo_respuestas(categoria_id);
CREATE INDEX idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);
CREATE INDEX idx_lista_chequeo_item_categorias_item ON lista_chequeo_item_categorias(item_id);
CREATE INDEX idx_lista_chequeo_item_categorias_categoria ON lista_chequeo_item_categorias(categoria_id);
CREATE INDEX idx_lista_chequeo_items_maestros_numero ON lista_chequeo_items_maestros(numero_item);

-- 11. Crear triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- 12. Comentarios para documentación
COMMENT ON TABLE lista_chequeo_categorias IS 'Categorías de lista de chequeo (tipos de contrato)';
COMMENT ON TABLE lista_chequeo_etapas IS 'Etapas del proceso contractual';
COMMENT ON TABLE lista_chequeo_items_maestros IS 'Items maestros de lista de chequeo';
COMMENT ON TABLE lista_chequeo_item_categorias IS 'Relación entre items y categorías con mapeo a filas de Excel';
COMMENT ON TABLE lista_chequeo_respuestas IS 'Respuestas de lista de chequeo por área';

-- Consulta para verificar la estructura creada
SELECT 
    c.nombre as categoria,
    e.nombre as etapa,
    im.numero_item,
    im.titulo,
    ic.fila_excel
FROM lista_chequeo_categorias c
JOIN lista_chequeo_item_categorias ic ON c.id = ic.categoria_id
JOIN lista_chequeo_items_maestros im ON ic.item_id = im.id
JOIN lista_chequeo_etapas e ON im.etapa_id = e.id
ORDER BY c.orden, ic.fila_excel;
