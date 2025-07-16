-- ========================================
-- PASO 2: INSERTAR CATEGORÍAS Y ETAPAS BASE
-- ========================================

-- Insertar categorías según documentos oficiales
INSERT INTO lista_chequeo_categorias (nombre, descripcion, hoja_excel, orden) VALUES
('SAMC', 'Selección Abreviada de Menor Cuantía - Código: ASE.BYS.SP-01.PR-01-F4', 'SAMC', 1),
('MINIMA CUANTÍA', 'Invitación Pública de Mínima Cuantía - Código: ASE.BYS.SP-01.PR-01-F5', 'MINIMA CUANTÍA', 2),
('CONTRATO INTERADMINISTRATIVO', 'Contrato Interadministrativo - Código: ASE.BYS.SP-01.PR-01-F6', 'CONTRATO INTERADMINISTRATIVO', 3),
('PRESTACIÓN DE SERVICIOS', 'Contrato de Prestación de Servicios - Código: ASE.BYS.SP-01.PR-01-F7', 'PRESTACIÓN DE SERVICIOS', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Insertar etapas según documentos oficiales
INSERT INTO lista_chequeo_etapas (nombre, descripcion, orden) VALUES
('PRECONTRACTUAL', 'Etapa precontractual - Documentos previos a la firma del contrato', 1),
('CONTRACTUAL', 'Etapa contractual - Documentos de formalización del contrato', 2),
('EJECUCION', 'Etapa de ejecución - Documentos durante la ejecución del contrato', 3),
('ADICION', 'Etapa de adición al contrato (cuando aplique) - Solo para Prestación de Servicios', 4)
ON CONFLICT (nombre) DO NOTHING;

-- Verificar inserción
SELECT 'Categorías insertadas' as tipo, COUNT(*) as cantidad FROM lista_chequeo_categorias
UNION ALL
SELECT 'Etapas insertadas' as tipo, COUNT(*) as cantidad FROM lista_chequeo_etapas;

SELECT 'PASO 2 COMPLETADO: Categorías y etapas insertadas' as resultado;
