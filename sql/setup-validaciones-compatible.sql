-- SQL Simplificado y Compatible para Validaciones
-- Ejecutar paso a paso para verificar compatibilidad

-- PASO 1: Verificar estructura de tablas existentes
-- Ejecutar estas consultas primero para validar la estructura

-- Verificar tabla plan_accion
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'plan_accion' 
ORDER BY ordinal_position;

-- Verificar tabla usuarios
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'usuarios' 
ORDER BY ordinal_position;

-- Verificar tabla areas
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'areas' 
ORDER BY ordinal_position;

-- PASO 2: Crear tabla de validaciones (versión compatible)
-- Solo ejecutar si el PASO 1 confirmó la estructura
CREATE TABLE IF NOT EXISTS plan_validaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL,
    estado_validacion VARCHAR(20) NOT NULL DEFAULT 'pendiente' 
        CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado', 'en_revision')),
    comentarios TEXT,
    validado_por UUID,
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id)
);

-- PASO 3: Crear índices básicos
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_plan_id ON plan_validaciones(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_estado ON plan_validaciones(estado_validacion);
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_validado_por ON plan_validaciones(validado_por);

-- PASO 4: Crear trigger para updated_at
CREATE OR REPLACE FUNCTION update_plan_validaciones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_plan_validaciones_updated_at
    BEFORE UPDATE ON plan_validaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_plan_validaciones_updated_at();

-- PASO 5: Habilitar RLS
ALTER TABLE plan_validaciones ENABLE ROW LEVEL SECURITY;

-- PASO 6: Políticas básicas de seguridad
-- Todos pueden leer
CREATE POLICY "plan_validaciones_select_policy" ON plan_validaciones
    FOR SELECT
    TO authenticated
    USING (true);

-- Solo usuarios autenticados pueden insertar (se validará a nivel de aplicación)
CREATE POLICY "plan_validaciones_insert_policy" ON plan_validaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = validado_por);

-- Solo el mismo usuario puede actualizar sus validaciones
CREATE POLICY "plan_validaciones_update_policy" ON plan_validaciones
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = validado_por);

-- PASO 7: Función simple para obtener validaciones
CREATE OR REPLACE FUNCTION get_plan_validation_simple(plan_uuid UUID)
RETURNS plan_validaciones AS $$
DECLARE
    result plan_validaciones;
BEGIN
    SELECT * INTO result
    FROM plan_validaciones
    WHERE plan_id = plan_uuid;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- PASO 8: Vista simple combinada
CREATE OR REPLACE VIEW plan_accion_con_validacion AS
SELECT 
    pa.*,
    pv.estado_validacion,
    pv.comentarios as comentarios_validacion,
    pv.fecha_validacion,
    pv.validado_por
FROM plan_accion pa
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id;

-- PASO 9: Insertar validaciones pendientes para planes existentes
-- Solo si no existen validaciones previas
INSERT INTO plan_validaciones (plan_id, estado_validacion)
SELECT pa.id, 'pendiente'
FROM plan_accion pa
WHERE NOT EXISTS (
    SELECT 1 FROM plan_validaciones pv WHERE pv.plan_id = pa.id
);

-- PASO 10: Verificación final
SELECT 
    'Setup completado correctamente' as mensaje,
    COUNT(*) as total_validaciones_creadas
FROM plan_validaciones;

-- CONSULTAS DE VERIFICACIÓN
-- Ejecutar para confirmar que todo funciona

-- Ver todas las validaciones
SELECT 
    pv.*,
    pa.programa,
    pa.meta
FROM plan_validaciones pv
JOIN plan_accion pa ON pv.plan_id = pa.id
LIMIT 5;

-- Estadísticas básicas
SELECT 
    estado_validacion,
    COUNT(*) as cantidad
FROM plan_validaciones
GROUP BY estado_validacion;

-- Verificar restricciones
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'plan_validaciones';
