-- Migración para agregar campos de información demográfica a la tabla plan_accion
-- Fecha: 2024-01-XX
-- Descripción: Agrega campos demográficos completos: grupo_etareo, grupo_poblacion, zona, grupo_etnico y cantidad

-- Agregar columna grupo_etareo
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS grupo_etareo TEXT;

-- Agregar columna grupo_poblacion
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS grupo_poblacion TEXT;

-- Agregar columna zona
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS zona TEXT;

-- Agregar columna grupo_etnico
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS grupo_etnico TEXT;

-- Agregar columna cantidad (campo numérico abierto)
ALTER TABLE plan_accion 
ADD COLUMN IF NOT EXISTS cantidad NUMERIC;

-- Agregar comentarios a las columnas para documentación
COMMENT ON COLUMN plan_accion.grupo_etareo IS 'Grupo etáreo de la población objetivo (ej: 0-5, 6-10, 11-15, etc.)';
COMMENT ON COLUMN plan_accion.grupo_poblacion IS 'Grupo de población identificado (ej: víctima del conflicto, afrodescendiente, etc.)';
COMMENT ON COLUMN plan_accion.zona IS 'Zona geográfica o territorial de aplicación del plan';
COMMENT ON COLUMN plan_accion.grupo_etnico IS 'Grupo étnico de la población objetivo';
COMMENT ON COLUMN plan_accion.cantidad IS 'Cantidad numérica asociada al plan de acción (dato abierto)';

-- Verificar que las columnas se agregaron correctamente
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plan_accion' 
AND column_name IN ('grupo_etareo', 'grupo_poblacion', 'zona', 'grupo_etnico', 'cantidad');