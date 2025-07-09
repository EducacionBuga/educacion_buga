-- SQL para crear y poblar las tablas de listas de chequeo según la plantilla Excel
-- Estructura completa para manejar las 4 hojas: SAMC, MINIMA CUANTÍA, CONTRATO INTERADMINISTRATIVO, PRESTACIÓN DE SERVICIOS

-- 1. Crear tabla de categorías de lista de chequeo (tipos de contrato)
-- Primero verificamos si existe y la actualizamos si es necesario
DO $$ 
BEGIN
    -- Eliminar tabla existente si existe para recrearla con la estructura correcta
    DROP TABLE IF EXISTS lista_chequeo_respuestas;
    DROP TABLE IF EXISTS lista_chequeo_item_categorias;
    DROP TABLE IF EXISTS lista_chequeo_items_maestros;
    DROP TABLE IF EXISTS lista_chequeo_etapas;
    DROP TABLE IF EXISTS lista_chequeo_categorias;
    DROP TABLE IF EXISTS lista_chequeo_items; -- tabla anterior
END $$;

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

-- 3. Crear tabla de items maestros de lista de chequeo
CREATE TABLE lista_chequeo_items_maestros (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    numero_item INTEGER NOT NULL,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT NOT NULL,
    etapa_id UUID REFERENCES lista_chequeo_etapas(id),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(numero_item)
);

-- 4. Crear tabla de relación items-categorías (para saber qué items aplican a qué tipo de contrato)
CREATE TABLE lista_chequeo_item_categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    item_id UUID REFERENCES lista_chequeo_items_maestros(id) ON DELETE CASCADE,
    categoria_id UUID REFERENCES lista_chequeo_categorias(id) ON DELETE CASCADE,
    fila_excel INTEGER NOT NULL, -- Número de fila en la plantilla Excel
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(item_id, categoria_id)
);

-- 5. Crear tabla de respuestas de lista de chequeo
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

-- 6. Insertar categorías (tipos de contrato)
INSERT INTO lista_chequeo_categorias (nombre, descripcion, hoja_excel, orden) VALUES
('SAMC', 'Subasta Abierta de Mayor Cuantía', 'SAMC', 1),
('MINIMA CUANTÍA', 'Contrato de Mínima Cuantía', 'MINIMA CUANTÍA', 2),
('CONTRATO INTERADMINISTRATIVO', 'Contrato Interadministrativo', 'CONTRATO INTERADMINISTRATIVO', 3),
('PRESTACIÓN DE SERVICIOS', 'Prestación de Servicios', 'PRESTACIÓN DE SERVICIOS', 4);

-- 7. Insertar etapas
INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) VALUES
('PRECONTRACTUAL', 'Etapa precontractual del proceso', 1),
('EJECUCION', 'Etapa de ejecución del contrato', 2),
('CIERRE', 'Etapa de cierre del contrato', 3);

-- 8. Insertar items maestros específicos basados en la estructura proporcionada
INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id) VALUES
-- ITEMS PRECONTRACTUALES 
(1, 'FICHA MGA (PROCESOS DE INVERSIÓN)', 'Ficha MGA para procesos de inversión.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(2, 'CERTIFICADO DE VIABILIDAD Y REGISTRO', 'Certificado de viabilidad y registro del proyecto.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(3, 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', 'Estudios previos y análisis del sector correspondiente.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(4, 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cotizaciones para procesos de compraventas, suministros o servicios.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(5, 'CÁMARAS DE COMERCIO COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cámaras de comercio de las cotizaciones.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(6, 'PRESUPUESTO OFICIAL (PROCESOS DE OBRA PÚBLICA)', 'Presupuesto oficial para procesos de obra pública.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(7, 'PROYECTO DE PLIEGOS', 'Proyecto de pliegos de condiciones.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(8, 'AVISO DE CONVOCATORIA', 'Aviso de convocatoria del proceso.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(9, 'CONCEPTO JURÍDICO', 'Concepto jurídico del proceso contractual.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(10, 'OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Observaciones al proyecto de pliegos.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(11, 'RESPUESTA A LAS OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones al proyecto de pliegos.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(12, 'SOLICITUD DE LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Solicitud de limitación a MiPymes.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(13, 'LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Limitación a MiPymes aprobada.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(14, 'RESOLUCIÓN DE APERTURA', 'Resolución de apertura del proceso.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(15, 'PLIEGOS DEFINITIVOS', 'Pliegos definitivos del proceso.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(16, 'OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Observaciones al pliego definitivo.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(17, 'RESPUESTA A OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Respuesta a observaciones al pliego definitivo.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(18, 'ADENDA (EN CASO DE PRESENTARSE)', 'Adenda al proceso contractual.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(19, 'EVALUACIÓN DE LAS OFERTAS', 'Evaluación de las ofertas presentadas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(20, 'SOLICITUD DE SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Solicitud de subsanación de ofertas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(21, 'SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Subsanación de ofertas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(22, 'OBSERVACIONES AL INFORME DE EVALUACIÓN (EN CASO DE PRESENTARSE)', 'Observaciones al informe de evaluación.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(23, 'RESPUESTA A LAS OBSERVACIONES (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones del informe.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(24, 'ACEPTACIÓN DE OFERTA', 'Aceptación de la oferta seleccionada.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),

-- ITEMS CONTRACTUALES
(25, 'MINUTA DE CONTRATO', 'Minuta del contrato a suscribir.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(26, 'HOJA DE VIDA Y DOCUMENTOS REP. LEGAL', 'Hoja de vida y documentos del representante legal.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(27, 'CÁMARA DE COMERCIO (SI APLICA)', 'Cámara de comercio del contratista.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(28, 'RUT', 'Registro Único Tributario.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(29, 'FOTOCOPIA CÉDULA', 'Fotocopia de la cédula de ciudadanía.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(30, 'FOTOCOPIA LIBRETA MILITAR (SI APLICA)', 'Fotocopia de la libreta militar.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(31, 'CERTIFICADOS ANTECEDENTES (FISCALES, DISCIPLINARIOS, JUDICIALES, MEDIDAS CORRECTIVAS, DELITOS SEXUALES, REDAM, PACO-CONTRATISTAS)', 'Certificados de antecedentes.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(32, 'RUT (SEGUNDA COPIA PARA FIRMA)', 'Segunda copia del RUT para firma.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(33, 'DECLARACIÓN JURAMENTADA DE BIENES Y RENTAS', 'Declaración juramentada de bienes y rentas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(34, 'FORMULARIO ÚNICO DE INSCRIPCIÓN DE TERCEROS', 'Formulario único de inscripción de terceros.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(35, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria del contratista.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(36, 'CONCEPTO JURÍDICO', 'Concepto jurídico contractual.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(37, 'DESIGNACIÓN SUPERVISIÓN', 'Designación del supervisor del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(38, 'REGISTRO PRESUPUESTAL', 'Registro presupuestal del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(39, 'PÓLIZAS', 'Pólizas de garantía del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(40, 'RECIBO DE PAGO PÓLIZAS', 'Recibo de pago de las pólizas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(41, 'RESOLUCIÓN DE APROBACIÓN DE PÓLIZAS', 'Resolución de aprobación de pólizas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(42, 'ACTA DE INICIO', 'Acta de inicio del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),

-- ITEMS DE EJECUCIÓN
(43, 'INFORMES DE EJECUCIÓN DEL CONTRATO', 'Informes de ejecución del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(44, 'ENTRADA DE ALMACÉN (PROCESOS DE COMPRAVENTA)', 'Entrada de almacén para procesos de compraventa.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(45, 'INFORMES DE SUPERVISIÓN', 'Informes de supervisión del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(46, 'PAGO SISTEMA INTEGRAL DE SEGURIDAD SOCIAL', 'Pago del sistema integral de seguridad social.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(47, 'FACTURAS O CUENTAS DE COBRO', 'Facturas o cuentas de cobro.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(48, 'ÓRDENES DE PAGO', 'Órdenes de pago del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(49, 'COMPROBANTE DE EGRESO', 'Comprobante de egreso de los pagos.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(50, 'INFORME FINAL DE EJECUCIÓN', 'Informe final de ejecución del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(51, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),

-- ITEMS ADICIONALES ESPECÍFICOS
(52, 'RESOLUCIÓN DE ADJUDICACIÓN', 'Resolución de adjudicación del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(53, 'CERTIFICADO DE VIABILIDAD (PROCESOS DE INVERSIÓN)', 'Certificado de viabilidad para procesos de inversión.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(54, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'Certificado de disponibilidad presupuestal.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(55, 'COTIZACIONES E.S.A.L', 'Cotizaciones de entidades sin ánimo de lucro.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(56, 'CÁMARA DE COMERCIO COTIZACIONES E.S.A.L', 'Cámara de comercio de cotizaciones E.S.A.L.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(57, 'PRESUPUESTO OFICIAL PROMEDIADO', 'Presupuesto oficial promediado.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(58, 'INVITACIÓN A PARTICIPAR', 'Invitación a participar en el proceso.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(59, 'EVALUACIÓN DE OFERTAS (PROCESO CON PRESENTACIÓN DE OFERTA)', 'Evaluación de ofertas del proceso.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(60, 'ACEPTACIÓN DE LA OFERTA', 'Aceptación de la oferta seleccionada.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(61, 'MINUTA CONVENIO', 'Minuta del convenio interadministrativo.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(62, 'RESOLUCIÓN VERIFICACIÓN Y APROBACIÓN DE PÓLIZAS', 'Resolución de verificación y aprobación de pólizas.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(63, 'INFORME INTERVINIENTE', 'Informe del interviniente del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(64, 'CERTIFICADO PERSONAL NO SUFICIENTE', 'Certificado de personal no suficiente.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(65, 'INVITACIÓN A PRESENTAR PROPUESTA', 'Invitación a presentar propuesta.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(66, 'PROPUESTA CONTRACTUAL O COTIZACIÓN', 'Propuesta contractual o cotización.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(67, 'HOJA DE VIDA SIGEP', 'Hoja de vida en el sistema SIGEP.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(68, 'CERTIFICADO EXAMEN MÉDICO OCUPACIONAL', 'Certificado de examen médico ocupacional.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(69, 'CERTIFICACIONES DE ESTUDIO', 'Certificaciones de estudio del contratista.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(70, 'TARJETA PROFESIONAL', 'Tarjeta profesional del contratista.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(71, 'RETHUS – ANTECEDENTES PERSONA DE LA SALUD (SI APLICA)', 'RETHUS - Antecedentes persona de la salud.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(72, 'CERTIFICACIONES LABORALES', 'Certificaciones laborales del contratista.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(73, 'PUBLICACIÓN SECOP 2', 'Publicación en SECOP 2.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(74, 'CERTIFICADO PERSONAL IDÓNEO', 'Certificado de personal idóneo.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(75, 'DESIGNACIÓN SUPERVISOR CONTRATO', 'Designación del supervisor del contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(76, 'SOLICITUD REGISTRO PRESUPUESTAL', 'Solicitud de registro presupuestal.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(77, 'CERTIFICADO AFILIACIÓN A SALUD Y PENSIÓN', 'Certificado de afiliación a salud y pensión.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(78, 'AFILIACIÓN ARL', 'Afiliación a ARL.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(79, 'ACEPTACIÓN CONTRATO SECOP', 'Aceptación del contrato en SECOP.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(80, 'PUBLICACIÓN SIA OBSERVA', 'Publicación en SIA Observa.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(81, 'PLANILLAS DE SEGURIDAD SOCIAL', 'Planillas de seguridad social.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(82, 'MODIFICACIONES O ADICIONES AL CONTRATO (SI APLICA)', 'Modificaciones o adiciones al contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(83, 'MGA ADICIÓN (POR PROYECTO)', 'MGA de adición por proyecto.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(84, 'VIABILIDAD ADICIÓN (POR PROYECTO)', 'Viabilidad de adición por proyecto.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(85, 'CDP', 'Certificado de disponibilidad presupuestal.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(86, 'JUSTIFICACIÓN (ADICIÓN, PRÓRROGA, SUSPENSIÓN, REINICIO, MODIFICACIÓN, TERMINACIÓN Y/O CESIÓN DE CONTRATO)', 'Justificación de modificaciones al contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(87, 'MINUTA DE ADICIÓN AL CONTRATO', 'Minuta de adición al contrato.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(88, 'CONCEPTO JURÍDICO ADICIÓN', 'Concepto jurídico de la adición.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(89, 'SOLICITUD CRP ADICIÓN', 'Solicitud de CRP para adición.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(90, 'CRP ADICIÓN', 'CRP de la adición.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(91, 'ARL ADICIÓN', 'ARL de la adición.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(92, 'ACEPTACIÓN ADICIÓN SECOP 2', 'Aceptación de adición en SECOP 2.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(93, 'SIA OBSERVA ADICIÓN', 'SIA Observa de la adición.', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION'));

-- 9. Relacionar items con categorías y definir filas en Excel
-- Primero obtenemos los IDs de categorías
WITH categorias AS (
    SELECT id, nombre FROM lista_chequeo_categorias
),
items AS (
    SELECT id, numero_item FROM lista_chequeo_items_maestros
)

-- SAMC: Items 1-51 (todas las filas según ROW_MAP)
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
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
FROM items i, categorias c
WHERE c.nombre = 'SAMC' AND i.numero_item BETWEEN 1 AND 51;

-- MINIMA CUANTÍA: Items 1-51 (mismas filas que SAMC)
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
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
FROM items i, categorias c
WHERE c.nombre = 'MINIMA CUANTÍA' AND i.numero_item BETWEEN 1 AND 51;

-- CONTRATO INTERADMINISTRATIVO: Items 1-29 (según ROW_MAP específico)
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
        WHEN 1 THEN 12 WHEN 2 THEN 13 WHEN 3 THEN 14 WHEN 4 THEN 15 WHEN 5 THEN 16
        WHEN 6 THEN 17 WHEN 7 THEN 18 WHEN 8 THEN 19 WHEN 9 THEN 20 WHEN 10 THEN 21
        WHEN 11 THEN 22 WHEN 12 THEN 23 WHEN 13 THEN 25 WHEN 14 THEN 26 WHEN 15 THEN 27
        WHEN 16 THEN 28 WHEN 17 THEN 29 WHEN 18 THEN 30 WHEN 19 THEN 31 WHEN 20 THEN 32
        WHEN 21 THEN 33 WHEN 22 THEN 35 WHEN 23 THEN 36 WHEN 24 THEN 37 WHEN 25 THEN 38
        WHEN 26 THEN 39 WHEN 27 THEN 40 WHEN 28 THEN 41 WHEN 29 THEN 42
    END
FROM items i, categorias c
WHERE c.nombre = 'CONTRATO INTERADMINISTRATIVO' AND i.numero_item BETWEEN 1 AND 29;

-- PRESTACIÓN DE SERVICIOS: Items 1-51 (mismas filas que SAMC)
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
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
FROM items i, categorias c
WHERE c.nombre = 'PRESTACIÓN DE SERVICIOS' AND i.numero_item BETWEEN 1 AND 51;

-- 10. Crear índices para optimización
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_area ON lista_chequeo_respuestas(area_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_categoria ON lista_chequeo_respuestas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_respuestas_item ON lista_chequeo_respuestas(item_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_item_categorias_item ON lista_chequeo_item_categorias(item_id);
CREATE INDEX IF NOT EXISTS idx_lista_chequeo_item_categorias_categoria ON lista_chequeo_item_categorias(categoria_id);

-- 11. Crear funciones para triggers de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 12. Crear triggers para updated_at
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

-- 13. Comentarios para documentación
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
ORDER BY c.orden, e.orden, im.numero_item;
