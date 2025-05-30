-- Crear tabla para adjuntos de plan de acción
CREATE TABLE IF NOT EXISTS public.plan_accion_adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    tipo_archivo VARCHAR(100) NOT NULL,
    tamano BIGINT NOT NULL,
    ruta_archivo TEXT NOT NULL,
    url_publica TEXT NOT NULL,
    actividad_id VARCHAR(255) NOT NULL,
    area_id UUID NOT NULL REFERENCES public.areas(id) ON DELETE CASCADE,
    estado VARCHAR(50) DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.plan_accion_adjuntos ENABLE ROW LEVEL SECURITY;

-- Crear políticas permisivas
CREATE POLICY "plan_accion_adjuntos_select_policy" ON public.plan_accion_adjuntos
    FOR SELECT TO authenticated, anon USING (true);

CREATE POLICY "plan_accion_adjuntos_insert_policy" ON public.plan_accion_adjuntos
    FOR INSERT TO authenticated, anon WITH CHECK (true);

CREATE POLICY "plan_accion_adjuntos_update_policy" ON public.plan_accion_adjuntos
    FOR UPDATE TO authenticated, anon USING (true) WITH CHECK (true);

CREATE POLICY "plan_accion_adjuntos_delete_policy" ON public.plan_accion_adjuntos
    FOR DELETE TO authenticated, anon USING (true);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_area_id ON public.plan_accion_adjuntos(area_id);
CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_actividad_id ON public.plan_accion_adjuntos(actividad_id);
CREATE INDEX IF NOT EXISTS idx_plan_accion_adjuntos_estado ON public.plan_accion_adjuntos(estado);

-- Comentarios
COMMENT ON TABLE public.plan_accion_adjuntos IS 'Adjuntos de actividades del plan de acción';
COMMENT ON COLUMN public.plan_accion_adjuntos.actividad_id IS 'ID de la actividad del plan de acción';
COMMENT ON COLUMN public.plan_accion_adjuntos.area_id IS 'ID del área responsable';
