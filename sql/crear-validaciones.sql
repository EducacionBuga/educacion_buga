-- SQL para crear la tabla de validaciones de planes de acción
-- Ejecutar en Supabase SQL Editor

-- 1. Crear la tabla plan_validaciones
CREATE TABLE IF NOT EXISTS plan_validaciones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    plan_id UUID NOT NULL REFERENCES plan_accion(id) ON DELETE CASCADE,
    estado_validacion VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado', 'en_revision')),
    comentarios TEXT,
    validado_por UUID REFERENCES auth.users(id),
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(plan_id) -- Solo una validación por plan (la más reciente)
);

-- 2. Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_plan_id ON plan_validaciones(plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_estado ON plan_validaciones(estado_validacion);
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_validado_por ON plan_validaciones(validado_por);
CREATE INDEX IF NOT EXISTS idx_plan_validaciones_fecha ON plan_validaciones(fecha_validacion);

-- 3. Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_plan_validaciones_updated_at
    BEFORE UPDATE ON plan_validaciones
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Crear una función para obtener el estado de validación de un plan
CREATE OR REPLACE FUNCTION get_plan_validation_status(plan_uuid UUID)
RETURNS TABLE(
    plan_id UUID,
    estado VARCHAR(20),
    comentarios TEXT,
    validado_por UUID,
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    nombre_validador VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.plan_id,
        pv.estado_validacion,
        pv.comentarios,
        pv.validado_por,
        pv.fecha_validacion,
        COALESCE(u.nombre, au.email) as nombre_validador
    FROM plan_validaciones pv
    LEFT JOIN usuarios u ON pv.validado_por = u.uuid
    LEFT JOIN auth.users au ON pv.validado_por = au.id
    WHERE pv.plan_id = plan_uuid
    ORDER BY pv.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 5. Crear una vista para obtener planes con su estado de validación
CREATE OR REPLACE VIEW planes_con_validacion AS
SELECT 
    pa.*,
    COALESCE(pv.estado_validacion, 'pendiente') as estado_validacion,
    pv.comentarios as comentarios_validacion,
    pv.validado_por,
    pv.fecha_validacion,
    COALESCE(u.nombre, au.email) as nombre_validador,
    pv.id as validacion_id
FROM plan_accion pa
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
LEFT JOIN usuarios u ON pv.validado_por = u.uuid
LEFT JOIN auth.users au ON pv.validado_por = au.id;

-- 6. Configurar RLS (Row Level Security)
ALTER TABLE plan_validaciones ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de seguridad
-- Política para que todos los usuarios autenticados puedan leer validaciones
CREATE POLICY "Users can read all validations" ON plan_validaciones
    FOR SELECT
    TO authenticated
    USING (true);

-- Política para que solo los admins puedan insertar/actualizar validaciones
CREATE POLICY "Only admins can insert validations" ON plan_validaciones
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

CREATE POLICY "Only admins can update validations" ON plan_validaciones
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- 8. Crear función para obtener estadísticas de validaciones
CREATE OR REPLACE FUNCTION get_validation_stats()
RETURNS TABLE(
    total_planes BIGINT,
    aprobados BIGINT,
    rechazados BIGINT,
    en_revision BIGINT,
    pendientes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_planes,
        COUNT(CASE WHEN pv.estado_validacion = 'aprobado' THEN 1 END) as aprobados,
        COUNT(CASE WHEN pv.estado_validacion = 'rechazado' THEN 1 END) as rechazados,
        COUNT(CASE WHEN pv.estado_validacion = 'en_revision' THEN 1 END) as en_revision,
        COUNT(CASE WHEN pv.estado_validacion IS NULL OR pv.estado_validacion = 'pendiente' THEN 1 END) as pendientes
    FROM plan_accion pa
    LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id;
END;
$$ LANGUAGE plpgsql;

-- 9. Crear función para obtener el historial de validaciones de un plan
CREATE OR REPLACE FUNCTION get_plan_validation_history(plan_uuid UUID)
RETURNS TABLE(
    id UUID,
    estado_validacion VARCHAR(20),
    comentarios TEXT,
    validado_por UUID,
    nombre_validador VARCHAR(255),
    fecha_validacion TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pv.id,
        pv.estado_validacion,
        pv.comentarios,
        pv.validado_por,
        COALESCE(u.nombre, au.email) as nombre_validador,
        pv.fecha_validacion,
        pv.created_at
    FROM plan_validaciones pv
    LEFT JOIN usuarios u ON pv.validado_por = u.uuid
    LEFT JOIN auth.users au ON pv.validado_por = au.id
    WHERE pv.plan_id = plan_uuid
    ORDER BY pv.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- 10. Insertar validaciones por defecto para planes existentes (opcional)
-- Esta query crea validaciones pendientes para todos los planes que no tienen validación
INSERT INTO plan_validaciones (plan_id, estado_validacion)
SELECT pa.id, 'pendiente'
FROM plan_accion pa
LEFT JOIN plan_validaciones pv ON pa.id = pv.plan_id
WHERE pv.id IS NULL;

-- 11. Crear función para notificar cambios en validaciones (opcional)
CREATE OR REPLACE FUNCTION notify_validation_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Notificar cambios a través de PostgreSQL NOTIFY
    PERFORM pg_notify('validation_changed', 
        json_build_object(
            'plan_id', NEW.plan_id,
            'estado', NEW.estado_validacion,
            'validado_por', NEW.validado_por
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para notificaciones
CREATE TRIGGER validation_change_notify
    AFTER INSERT OR UPDATE ON plan_validaciones
    FOR EACH ROW
    EXECUTE FUNCTION notify_validation_change();

-- 12. Crear función para validar masivamente planes por área (opcional)
CREATE OR REPLACE FUNCTION validate_plans_by_area(
    area_uuid UUID,
    new_estado VARCHAR(20),
    admin_id UUID,
    comentarios_bulk TEXT DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER := 0;
BEGIN
    -- Verificar que el usuario sea admin (desde auth.users o usuarios)
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE id = admin_id 
        AND raw_user_meta_data->>'role' = 'admin'
    ) AND NOT EXISTS (
        SELECT 1 FROM usuarios 
        WHERE uuid = admin_id 
        AND rol = 'admin'
    ) THEN
        RAISE EXCEPTION 'Solo los administradores pueden validar planes';
    END IF;

    -- Validar que el estado sea válido
    IF new_estado NOT IN ('pendiente', 'aprobado', 'rechazado', 'en_revision') THEN
        RAISE EXCEPTION 'Estado de validación inválido';
    END IF;

    -- Actualizar o insertar validaciones para todos los planes del área
    INSERT INTO plan_validaciones (plan_id, estado_validacion, comentarios, validado_por, fecha_validacion)
    SELECT pa.id, new_estado, comentarios_bulk, admin_id, NOW()
    FROM plan_accion pa
    WHERE pa.area_id = area_uuid
    ON CONFLICT (plan_id) DO UPDATE SET
        estado_validacion = EXCLUDED.estado_validacion,
        comentarios = EXCLUDED.comentarios,
        validado_por = EXCLUDED.validado_por,
        fecha_validacion = EXCLUDED.fecha_validacion,
        updated_at = NOW();

    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE plpgsql;

-- 13. Comentarios informativos
COMMENT ON TABLE plan_validaciones IS 'Tabla para almacenar las validaciones de los planes de acción por parte de los administradores';
COMMENT ON COLUMN plan_validaciones.estado_validacion IS 'Estado de validación: pendiente, aprobado, rechazado, en_revision';
COMMENT ON COLUMN plan_validaciones.comentarios IS 'Comentarios del administrador sobre la validación';
COMMENT ON COLUMN plan_validaciones.validado_por IS 'ID del usuario administrador que realizó la validación';
COMMENT ON COLUMN plan_validaciones.fecha_validacion IS 'Fecha y hora cuando se realizó la validación';

-- Verificar que todo se creó correctamente
SELECT 
    'Tabla plan_validaciones creada correctamente' as mensaje,
    COUNT(*) as total_registros
FROM plan_validaciones;
