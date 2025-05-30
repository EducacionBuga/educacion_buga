-- Políticas RLS para la tabla plan_accion
-- Estas políticas permiten operaciones básicas manteniendo seguridad

-- Primero, verificar si RLS está habilitado
ALTER TABLE public.plan_accion ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "plan_accion_insert_policy" ON public.plan_accion;
DROP POLICY IF EXISTS "plan_accion_select_policy" ON public.plan_accion;
DROP POLICY IF EXISTS "plan_accion_update_policy" ON public.plan_accion;
DROP POLICY IF EXISTS "plan_accion_delete_policy" ON public.plan_accion;

-- Política para SELECT - permitir a usuarios autenticados ver todos los registros
CREATE POLICY "plan_accion_select_policy" 
ON public.plan_accion 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Política para INSERT - permitir a usuarios autenticados insertar registros
CREATE POLICY "plan_accion_insert_policy" 
ON public.plan_accion 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE - permitir a usuarios autenticados actualizar registros
CREATE POLICY "plan_accion_update_policy" 
ON public.plan_accion 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Política para DELETE - permitir a usuarios autenticados eliminar registros
CREATE POLICY "plan_accion_delete_policy" 
ON public.plan_accion 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- También asegurar políticas para otras tablas importantes

-- Tabla usuarios
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "usuarios_select_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON public.usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON public.usuarios;

CREATE POLICY "usuarios_select_policy" 
ON public.usuarios 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "usuarios_insert_policy" 
ON public.usuarios 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "usuarios_update_policy" 
ON public.usuarios 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

-- Tabla matriz_seguimiento
ALTER TABLE public.matriz_seguimiento ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "matriz_seguimiento_select_policy" ON public.matriz_seguimiento;
DROP POLICY IF EXISTS "matriz_seguimiento_insert_policy" ON public.matriz_seguimiento;
DROP POLICY IF EXISTS "matriz_seguimiento_update_policy" ON public.matriz_seguimiento;
DROP POLICY IF EXISTS "matriz_seguimiento_delete_policy" ON public.matriz_seguimiento;

CREATE POLICY "matriz_seguimiento_select_policy" 
ON public.matriz_seguimiento 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "matriz_seguimiento_insert_policy" 
ON public.matriz_seguimiento 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "matriz_seguimiento_update_policy" 
ON public.matriz_seguimiento 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "matriz_seguimiento_delete_policy" 
ON public.matriz_seguimiento 
FOR DELETE 
USING (auth.role() = 'authenticated');

-- Tabla registros_fotograficos
ALTER TABLE public.registros_fotograficos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "registros_fotograficos_select_policy" ON public.registros_fotograficos;
DROP POLICY IF EXISTS "registros_fotograficos_insert_policy" ON public.registros_fotograficos;
DROP POLICY IF EXISTS "registros_fotograficos_update_policy" ON public.registros_fotograficos;
DROP POLICY IF EXISTS "registros_fotograficos_delete_policy" ON public.registros_fotograficos;

CREATE POLICY "registros_fotograficos_select_policy" 
ON public.registros_fotograficos 
FOR SELECT 
USING (auth.role() = 'authenticated');

CREATE POLICY "registros_fotograficos_insert_policy" 
ON public.registros_fotograficos 
FOR INSERT 
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "registros_fotograficos_update_policy" 
ON public.registros_fotograficos 
FOR UPDATE 
USING (auth.role() = 'authenticated')
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "registros_fotograficos_delete_policy" 
ON public.registros_fotograficos 
FOR DELETE 
USING (auth.role() = 'authenticated');
