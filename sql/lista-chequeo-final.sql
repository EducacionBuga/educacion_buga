-- SCRIPT DE ESTRUCTURA COMPLETA PARA LISTAS DE CHEQUEO
-- Basado en la plantilla Excel exacta con 4 hojas

-- 1. Eliminar datos existentes de lista de chequeo (manteniendo otras tablas del sistema)
DELETE FROM lista_chequeo_respuestas;
DELETE FROM lista_chequeo_item_categorias;
DELETE FROM lista_chequeo_items_maestros;
DELETE FROM lista_chequeo_etapas;
DELETE FROM lista_chequeo_categorias;
DELETE FROM lista_chequeo;

-- 2. Eliminar tablas si existen
DROP TABLE IF EXISTS lista_chequeo_respuestas;
DROP TABLE IF EXISTS lista_chequeo_item_categorias;
DROP TABLE IF EXISTS lista_chequeo_items_maestros;
DROP TABLE IF EXISTS lista_chequeo_etapas;
DROP TABLE IF EXISTS lista_chequeo_categorias;
DROP TABLE IF EXISTS lista_chequeo;

-- 3. Crear tabla principal de lista de chequeo
CREATE TABLE lista_chequeo (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    area_id uuid REFERENCES areas(id),
    tipo_contrato text NOT NULL CHECK (tipo_contrato IN ('SAMC', 'MINIMA_CUANTIA', 'CONTRATO_INTERADMINISTRATIVO', 'PRESTACION_SERVICIOS')),
    numero_contrato text,
    objeto text,
    contratista text,
    valor_contrato numeric,
    fecha_inicio date,
    fecha_fin date,
    supervisor text,
    estado text DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'COMPLETADO', 'CANCELADO')),
    observaciones_generales text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- 4. Crear tabla de categorías (hojas de Excel)
CREATE TABLE lista_chequeo_categorias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text UNIQUE NOT NULL,
    orden integer NOT NULL,
    descripcion text,
    created_at timestamp with time zone DEFAULT now()
);

-- 5. Crear tabla de etapas
CREATE TABLE lista_chequeo_etapas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text UNIQUE NOT NULL,
    orden integer NOT NULL,
    descripcion text,
    created_at timestamp with time zone DEFAULT now()
);

-- 6. Crear tabla de items maestros
CREATE TABLE lista_chequeo_items_maestros (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_item integer UNIQUE NOT NULL,
    titulo text NOT NULL,
    descripcion text,
    etapa_id uuid REFERENCES lista_chequeo_etapas(id),
    created_at timestamp with time zone DEFAULT now()
);

-- 7. Crear tabla de relación item-categoria con fila de Excel
CREATE TABLE lista_chequeo_item_categorias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    item_id uuid REFERENCES lista_chequeo_items_maestros(id),
    categoria_id uuid REFERENCES lista_chequeo_categorias(id),
    fila_excel integer NOT NULL,
    UNIQUE(item_id, categoria_id)
);

-- 8. Crear tabla de respuestas
CREATE TABLE lista_chequeo_respuestas (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lista_chequeo_id uuid REFERENCES lista_chequeo(id) ON DELETE CASCADE,
    item_id uuid REFERENCES lista_chequeo_items_maestros(id),
    respuesta text CHECK (respuesta IN ('CUMPLE', 'NO_CUMPLE', 'NO_APLICA')),
    observaciones text,
    user_id uuid REFERENCES auth.users(id),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(lista_chequeo_id, item_id)
);

-- 9. Insertar categorías (hojas de Excel)
INSERT INTO lista_chequeo_categorias (nombre, orden, descripcion) VALUES
('SAMC', 1, 'Selección Abreviada de Menor Cuantía'),
('MINIMA CUANTÍA', 2, 'Mínima Cuantía'),
('CONTRATO INTERADMINISTRATIVO', 3, 'Contrato Interadministrativo'),
('PRESTACIÓN DE SERVICIOS', 4, 'Prestación de Servicios');

-- 10. Insertar etapas
INSERT INTO lista_chequeo_etapas (nombre, orden, descripcion) VALUES
('PRECONTRACTUAL', 1, 'Etapa precontractual'),
('CONTRACTUAL', 2, 'Etapa contractual'),
('EJECUCION', 3, 'Etapa de ejecución'),
('ADICION', 4, 'Adiciones y modificaciones');

-- 11. Insertar items maestros según la estructura real de la plantilla
INSERT INTO lista_chequeo_items_maestros (numero_item, titulo, descripcion, etapa_id) VALUES
-- ITEMS PRECONTRACTUALES
(1, 'FICHA MGA (PROCESOS DE INVERSIÓN)', 'Ficha MGA para procesos de inversión', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(2, 'CERTIFICADO DE VIABILIDAD Y REGISTRO', 'Certificado de viabilidad y registro', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(3, 'ESTUDIOS PREVIOS Y ANÁLISIS DEL SECTOR', 'Estudios previos y análisis del sector', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(4, 'COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cotizaciones para procesos de compraventas, suministros o servicios', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(5, 'CÁMARAS DE COMERCIO COTIZACIONES (PROCESOS DE COMPRAVENTAS, SUMINISTROS O SERVICIOS)', 'Cámaras de comercio cotizaciones', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(6, 'PRESUPUESTO OFICIAL (PROCESOS DE OBRA PÚBLICA)', 'Presupuesto oficial para procesos de obra pública', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(7, 'PROYECTO DE PLIEGOS', 'Proyecto de pliegos', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(8, 'AVISO DE CONVOCATORIA', 'Aviso de convocatoria', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(9, 'CONCEPTO JURÍDICO', 'Concepto jurídico', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(10, 'OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Observaciones al proyecto de pliegos', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(11, 'RESPUESTA A LAS OBSERVACIONES AL PROYECTO DE PLIEGOS (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones al proyecto de pliegos', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(12, 'SOLICITUD DE LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Solicitud de limitación a MIPYMES', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(13, 'LIMITACIÓN A MIPYMES (EN CASO DE PRESENTARSE) SOLO SAMC', 'Limitación a MIPYMES', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(14, 'RESOLUCIÓN DE APERTURA', 'Resolución de apertura', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(15, 'PLIEGOS DEFINITIVOS', 'Pliegos definitivos', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(16, 'OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Observaciones al pliego definitivo', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(17, 'RESPUESTA A OBSERVACIONES AL PLIEGO DEFINITIVO (EN CASO DE PRESENTARSE)', 'Respuesta a observaciones al pliego definitivo', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(18, 'ADENDA (EN CASO DE PRESENTARSE)', 'Adenda', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(19, 'EVALUACIÓN DE LAS OFERTAS', 'Evaluación de las ofertas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(20, 'SOLICITUD DE SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Solicitud de subsanación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(21, 'SUBSANACIÓN (EN CASO DE PRESENTARSE)', 'Subsanación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(22, 'OBSERVACIONES AL INFORME DE EVALUACIÓN (EN CASO DE PRESENTARSE)', 'Observaciones al informe de evaluación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(23, 'RESPUESTA A LAS OBSERVACIONES (EN CASO DE PRESENTARSE)', 'Respuesta a las observaciones', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(24, 'ACEPTACIÓN DE OFERTA', 'Aceptación de oferta', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(52, 'RESOLUCIÓN DE ADJUDICACIÓN', 'Resolución de adjudicación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(53, 'CERTIFICADO DE VIABILIDAD (PROCESOS DE INVERSIÓN)', 'Certificado de viabilidad para procesos de inversión', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(54, 'CERTIFICADO DE DISPONIBILIDAD PRESUPUESTAL', 'Certificado de disponibilidad presupuestal', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(55, 'COTIZACIONES E.S.A.L', 'Cotizaciones E.S.A.L', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(56, 'CÁMARA DE COMERCIO COTIZACIONES E.S.A.L', 'Cámara de comercio cotizaciones E.S.A.L', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(57, 'PRESUPUESTO OFICIAL PROMEDIADO', 'Presupuesto oficial promediado', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(58, 'INVITACIÓN A PARTICIPAR', 'Invitación a participar', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(59, 'EVALUACIÓN DE OFERTAS (PROCESO CON PRESENTACIÓN DE OFERTA)', 'Evaluación de ofertas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(60, 'ACEPTACIÓN DE LA OFERTA', 'Aceptación de la oferta', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(64, 'CERTIFICADO PERSONAL NO SUFICIENTE', 'Certificado personal no suficiente', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(65, 'INVITACIÓN A PRESENTAR PROPUESTA', 'Invitación a presentar propuesta', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(66, 'PROPUESTA CONTRACTUAL O COTIZACIÓN', 'Propuesta contractual o cotización', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(67, 'HOJA DE VIDA SIGEP', 'Hoja de vida SIGEP', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(68, 'CERTIFICADO EXAMEN MÉDICO OCUPACIONAL', 'Certificado examen médico ocupacional', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(69, 'CERTIFICACIONES DE ESTUDIO', 'Certificaciones de estudio', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(70, 'TARJETA PROFESIONAL', 'Tarjeta profesional', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(71, 'RETHUS – ANTECEDENTES PERSONA DE LA SALUD (SI APLICA)', 'RETHUS – Antecedentes persona de la salud', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(72, 'CERTIFICACIONES LABORALES', 'Certificaciones laborales', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(73, 'PUBLICACIÓN SECOP 2', 'Publicación SECOP 2', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),
(74, 'CERTIFICADO PERSONAL IDÓNEO', 'Certificado personal idóneo', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'PRECONTRACTUAL')),

-- ITEMS CONTRACTUALES
(25, 'MINUTA DE CONTRATO', 'Minuta de contrato', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(26, 'HOJA DE VIDA Y DOCUMENTOS REP. LEGAL', 'Hoja de vida y documentos representante legal', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(27, 'CÁMARA DE COMERCIO (SI APLICA)', 'Cámara de comercio', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(28, 'RUT', 'RUT', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(29, 'FOTOCOPIA CÉDULA', 'Fotocopia cédula', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(30, 'FOTOCOPIA LIBRETA MILITAR (SI APLICA)', 'Fotocopia libreta militar', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(31, 'CERTIFICADOS ANTECEDENTES (FISCALES, DISCIPLINARIOS, JUDICIALES, MEDIDAS CORRECTIVAS, DELITOS SEXUALES, REDAM, PACO-CONTRATISTAS)', 'Certificados antecedentes', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(32, 'RUT (SEGUNDA COPIA PARA FIRMA)', 'RUT segunda copia para firma', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(33, 'DECLARACIÓN JURAMENTADA DE BIENES Y RENTAS', 'Declaración juramentada de bienes y rentas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(34, 'FORMULARIO ÚNICO DE INSCRIPCIÓN DE TERCEROS', 'Formulario único de inscripción de terceros', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(35, 'CERTIFICACIÓN BANCARIA', 'Certificación bancaria', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(36, 'CONCEPTO JURÍDICO', 'Concepto jurídico', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(37, 'DESIGNACIÓN SUPERVISIÓN', 'Designación supervisión', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(38, 'REGISTRO PRESUPUESTAL', 'Registro presupuestal', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(39, 'PÓLIZAS', 'Pólizas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(40, 'RECIBO DE PAGO PÓLIZAS', 'Recibo de pago pólizas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(41, 'RESOLUCIÓN DE APROBACIÓN DE PÓLIZAS', 'Resolución de aprobación de pólizas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(42, 'ACTA DE INICIO', 'Acta de inicio', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(61, 'MINUTA CONVENIO', 'Minuta convenio', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(62, 'RESOLUCIÓN VERIFICACIÓN Y APROBACIÓN DE PÓLIZAS', 'Resolución verificación y aprobación de pólizas', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(63, 'INFORME INTERVINIENTE', 'Informe interviniente', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(75, 'DESIGNACIÓN SUPERVISOR CONTRATO', 'Designación supervisor contrato', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(76, 'SOLICITUD REGISTRO PRESUPUESTAL', 'Solicitud registro presupuestal', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(77, 'CERTIFICADO AFILIACIÓN A SALUD Y PENSIÓN', 'Certificado afiliación a salud y pensión', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(78, 'AFILIACIÓN ARL', 'Afiliación ARL', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(79, 'ACEPTACIÓN CONTRATO SECOP', 'Aceptación contrato SECOP', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),
(80, 'PUBLICACIÓN SIA OBSERVA', 'Publicación SIA OBSERVA', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'CONTRACTUAL')),

-- ITEMS DE EJECUCIÓN
(43, 'INFORMES DE EJECUCIÓN DEL CONTRATO', 'Informes de ejecución del contrato', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(44, 'ENTRADA DE ALMACÉN (PROCESOS DE COMPRAVENTA)', 'Entrada de almacén', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(45, 'INFORMES DE SUPERVISIÓN', 'Informes de supervisión', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(46, 'PAGO SISTEMA INTEGRAL DE SEGURIDAD SOCIAL', 'Pago sistema integral de seguridad social', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(47, 'FACTURAS O CUENTAS DE COBRO', 'Facturas o cuentas de cobro', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(48, 'ÓRDENES DE PAGO', 'Órdenes de pago', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(49, 'COMPROBANTE DE EGRESO', 'Comprobante de egreso', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(50, 'INFORME FINAL DE EJECUCIÓN', 'Informe final de ejecución', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(51, 'ACTA DE LIQUIDACIÓN', 'Acta de liquidación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),
(81, 'PLANILLAS DE SEGURIDAD SOCIAL', 'Planillas de seguridad social', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'EJECUCION')),

-- ITEMS DE ADICIÓN
(82, 'MODIFICACIONES O ADICIONES AL CONTRATO (SI APLICA)', 'Modificaciones o adiciones al contrato', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(83, 'MGA ADICIÓN (POR PROYECTO)', 'MGA adición por proyecto', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(84, 'VIABILIDAD ADICIÓN (POR PROYECTO)', 'Viabilidad adición por proyecto', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(85, 'CDP', 'CDP', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(86, 'JUSTIFICACIÓN (ADICIÓN, PRÓRROGA, SUSPENSIÓN, REINICIO, MODIFICACIÓN, TERMINACIÓN Y/O CESIÓN DE CONTRATO)', 'Justificación', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(87, 'MINUTA DE ADICIÓN AL CONTRATO', 'Minuta de adición al contrato', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(88, 'CONCEPTO JURÍDICO ADICIÓN', 'Concepto jurídico adición', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(89, 'SOLICITUD CRP ADICIÓN', 'Solicitud CRP adición', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(90, 'CRP ADICIÓN', 'CRP adición', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(91, 'ARL ADICIÓN', 'ARL adición', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(92, 'ACEPTACIÓN ADICIÓN SECOP 2', 'Aceptación adición SECOP 2', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION')),
(93, 'SIA OBSERVA ADICIÓN', 'SIA OBSERVA adición', (SELECT id FROM lista_chequeo_etapas WHERE nombre = 'ADICION'));

-- 12. Relacionar items con categorías y definir filas en Excel según ROW_MAP exacto

-- SAMC: Items 1-24, 52-59, 25-42, 43-51, 82-93 (todas las filas según ROW_MAP)
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
        WHEN 1 THEN 12 WHEN 2 THEN 13 WHEN 3 THEN 14 WHEN 4 THEN 15 WHEN 5 THEN 16
        WHEN 6 THEN 17 WHEN 7 THEN 18 WHEN 8 THEN 19 WHEN 9 THEN 20 WHEN 10 THEN 21
        WHEN 11 THEN 22 WHEN 12 THEN 23 WHEN 13 THEN 24 WHEN 14 THEN 25 WHEN 15 THEN 26
        WHEN 16 THEN 27 WHEN 17 THEN 28 WHEN 18 THEN 29 WHEN 19 THEN 30 WHEN 20 THEN 31
        WHEN 21 THEN 32 WHEN 22 THEN 33 WHEN 23 THEN 34 WHEN 24 THEN 35 WHEN 52 THEN 36
        WHEN 53 THEN 37 WHEN 54 THEN 38 WHEN 25 THEN 39 WHEN 26 THEN 40 WHEN 27 THEN 41
        WHEN 28 THEN 42 WHEN 29 THEN 43 WHEN 30 THEN 44 WHEN 31 THEN 45 WHEN 32 THEN 46
        WHEN 33 THEN 47 WHEN 34 THEN 48 WHEN 35 THEN 49 WHEN 36 THEN 50 WHEN 37 THEN 51
        WHEN 38 THEN 52 WHEN 39 THEN 53 WHEN 40 THEN 54 WHEN 41 THEN 55 WHEN 42 THEN 56
        WHEN 43 THEN 57 WHEN 44 THEN 58 WHEN 45 THEN 59 WHEN 46 THEN 60 WHEN 47 THEN 61
        WHEN 48 THEN 62 WHEN 49 THEN 63 WHEN 50 THEN 64 WHEN 51 THEN 65 WHEN 82 THEN 66
        WHEN 83 THEN 67 WHEN 84 THEN 68 WHEN 85 THEN 69 WHEN 86 THEN 70 WHEN 87 THEN 71
        WHEN 88 THEN 72 WHEN 89 THEN 73 WHEN 90 THEN 74 WHEN 91 THEN 75 WHEN 92 THEN 76
        WHEN 93 THEN 77
    END
FROM lista_chequeo_items_maestros i, lista_chequeo_categorias c
WHERE c.nombre = 'SAMC' AND i.numero_item IN (
    1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,52,53,54,
    25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
    43,44,45,46,47,48,49,50,51,
    82,83,84,85,86,87,88,89,90,91,92,93
);

-- MINIMA CUANTÍA: Items 53-60, 25-42, 43-51, 82-93
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
        WHEN 53 THEN 12 WHEN 54 THEN 13 WHEN 55 THEN 14 WHEN 56 THEN 15 WHEN 57 THEN 16
        WHEN 58 THEN 17 WHEN 59 THEN 18 WHEN 60 THEN 19 WHEN 25 THEN 20 WHEN 26 THEN 21
        WHEN 27 THEN 22 WHEN 28 THEN 23 WHEN 29 THEN 24 WHEN 30 THEN 25 WHEN 31 THEN 26
        WHEN 32 THEN 27 WHEN 33 THEN 28 WHEN 34 THEN 29 WHEN 35 THEN 30 WHEN 36 THEN 31
        WHEN 37 THEN 32 WHEN 38 THEN 33 WHEN 39 THEN 34 WHEN 40 THEN 35 WHEN 41 THEN 36
        WHEN 42 THEN 37 WHEN 43 THEN 38 WHEN 44 THEN 39 WHEN 45 THEN 40 WHEN 46 THEN 41
        WHEN 47 THEN 42 WHEN 48 THEN 43 WHEN 49 THEN 44 WHEN 50 THEN 45 WHEN 51 THEN 46
        WHEN 82 THEN 47 WHEN 83 THEN 48 WHEN 84 THEN 49 WHEN 85 THEN 50 WHEN 86 THEN 51
        WHEN 87 THEN 52 WHEN 88 THEN 53 WHEN 89 THEN 54 WHEN 90 THEN 55 WHEN 91 THEN 56
        WHEN 92 THEN 57 WHEN 93 THEN 58
    END
FROM lista_chequeo_items_maestros i, lista_chequeo_categorias c
WHERE c.nombre = 'MINIMA CUANTÍA' AND i.numero_item IN (
    53,54,55,56,57,58,59,60,
    25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,
    43,44,45,46,47,48,49,50,51,
    82,83,84,85,86,87,88,89,90,91,92,93
);

-- CONTRATO INTERADMINISTRATIVO: Items 53,54,3,61-63,75-80,43,45,81,46-51,82-93
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
        WHEN 53 THEN 12 WHEN 54 THEN 13 WHEN 3 THEN 14 WHEN 61 THEN 15 WHEN 62 THEN 16
        WHEN 63 THEN 17 WHEN 75 THEN 18 WHEN 76 THEN 19 WHEN 77 THEN 20 WHEN 78 THEN 21
        WHEN 79 THEN 22 WHEN 80 THEN 23 WHEN 43 THEN 24 WHEN 45 THEN 25 WHEN 81 THEN 26
        WHEN 46 THEN 27 WHEN 47 THEN 28 WHEN 48 THEN 29 WHEN 49 THEN 30 WHEN 50 THEN 31
        WHEN 51 THEN 32 WHEN 82 THEN 33 WHEN 83 THEN 34 WHEN 84 THEN 35 WHEN 85 THEN 36
        WHEN 86 THEN 37 WHEN 87 THEN 38 WHEN 88 THEN 39 WHEN 89 THEN 40 WHEN 90 THEN 41
        WHEN 91 THEN 42 WHEN 92 THEN 43 WHEN 93 THEN 44
    END
FROM lista_chequeo_items_maestros i, lista_chequeo_categorias c
WHERE c.nombre = 'CONTRATO INTERADMINISTRATIVO' AND i.numero_item IN (
    53,54,3,61,62,63,75,76,77,78,79,80,43,45,81,46,47,48,49,50,51,
    82,83,84,85,86,87,88,89,90,91,92,93
);

-- PRESTACIÓN DE SERVICIOS: Items 64-74,75-80,43,45,81,46-51,82-93
INSERT INTO lista_chequeo_item_categorias (item_id, categoria_id, fila_excel)
SELECT 
    i.id,
    c.id,
    CASE i.numero_item
        WHEN 64 THEN 12 WHEN 65 THEN 13 WHEN 66 THEN 14 WHEN 67 THEN 15 WHEN 68 THEN 16
        WHEN 69 THEN 17 WHEN 70 THEN 18 WHEN 71 THEN 19 WHEN 72 THEN 20 WHEN 73 THEN 21
        WHEN 74 THEN 22 WHEN 75 THEN 23 WHEN 76 THEN 24 WHEN 77 THEN 25 WHEN 78 THEN 26
        WHEN 79 THEN 27 WHEN 80 THEN 28 WHEN 43 THEN 29 WHEN 45 THEN 30 WHEN 81 THEN 31
        WHEN 46 THEN 32 WHEN 47 THEN 33 WHEN 48 THEN 34 WHEN 49 THEN 35 WHEN 50 THEN 36
        WHEN 51 THEN 37 WHEN 82 THEN 38 WHEN 83 THEN 39 WHEN 84 THEN 40 WHEN 85 THEN 41
        WHEN 86 THEN 42 WHEN 87 THEN 43 WHEN 88 THEN 44 WHEN 89 THEN 45 WHEN 90 THEN 46
        WHEN 91 THEN 47 WHEN 92 THEN 48 WHEN 93 THEN 49
    END
FROM lista_chequeo_items_maestros i, lista_chequeo_categorias c
WHERE c.nombre = 'PRESTACIÓN DE SERVICIOS' AND i.numero_item IN (
    64,65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,43,45,81,46,47,48,49,50,51,
    82,83,84,85,86,87,88,89,90,91,92,93
);

-- 13. Crear índices para mejorar rendimiento
CREATE INDEX idx_lista_chequeo_area_id ON lista_chequeo(area_id);
CREATE INDEX idx_lista_chequeo_tipo_contrato ON lista_chequeo(tipo_contrato);
CREATE INDEX idx_lista_chequeo_user_id ON lista_chequeo(user_id);
CREATE INDEX idx_lista_chequeo_respuestas_lista_id ON lista_chequeo_respuestas(lista_chequeo_id);
CREATE INDEX idx_lista_chequeo_respuestas_item_id ON lista_chequeo_respuestas(item_id);
CREATE INDEX idx_lista_chequeo_item_categorias_categoria_id ON lista_chequeo_item_categorias(categoria_id);
CREATE INDEX idx_lista_chequeo_item_categorias_item_id ON lista_chequeo_item_categorias(item_id);

-- 14. Habilitar RLS (Row Level Security)
ALTER TABLE lista_chequeo ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_respuestas ENABLE ROW LEVEL SECURITY;

-- 15. Crear políticas RLS básicas
CREATE POLICY "Users can view their own lista_chequeo" ON lista_chequeo
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own lista_chequeo" ON lista_chequeo
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lista_chequeo" ON lista_chequeo
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lista_chequeo" ON lista_chequeo
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own respuestas" ON lista_chequeo_respuestas
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own respuestas" ON lista_chequeo_respuestas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own respuestas" ON lista_chequeo_respuestas
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own respuestas" ON lista_chequeo_respuestas
    FOR DELETE USING (auth.uid() = user_id);

-- 16. Permitir lectura pública de tablas de configuración
ALTER TABLE lista_chequeo_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_items_maestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE lista_chequeo_item_categorias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read categorias" ON lista_chequeo_categorias FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read etapas" ON lista_chequeo_etapas FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read items_maestros" ON lista_chequeo_items_maestros FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can read item_categorias" ON lista_chequeo_item_categorias FOR SELECT TO public USING (true);

-- FIN DEL SCRIPT
