-- Script para corregir las políticas RLS (Row Level Security)

-- 1. Verificar las políticas existentes en plan_accion
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'plan_accion';

-- 2. Eliminar políticas existentes que puedan estar causando problemas
DROP POLICY IF EXISTS "plan_accion_select_policy" ON plan_accion;
DROP POLICY IF EXISTS "plan_accion_insert_policy" ON plan_accion;
DROP POLICY IF EXISTS "plan_accion_update_policy" ON plan_accion;
DROP POLICY IF EXISTS "plan_accion_delete_policy" ON plan_accion;

-- 3. Crear políticas más permisivas para usuarios autenticados
CREATE POLICY "plan_accion_select_policy" ON plan_accion
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "plan_accion_insert_policy" ON plan_accion
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "plan_accion_update_policy" ON plan_accion
    FOR UPDATE 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "plan_accion_delete_policy" ON plan_accion
    FOR DELETE 
    TO authenticated 
    USING (true);

-- 4. Verificar que RLS esté habilitado
ALTER TABLE plan_accion ENABLE ROW LEVEL SECURITY;

-- 5. Verificar las políticas de la tabla usuarios también
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'usuarios';

-- 6. Asegurar que los usuarios puedan acceder a sus propios datos
DROP POLICY IF EXISTS "usuarios_select_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_insert_policy" ON usuarios;
DROP POLICY IF EXISTS "usuarios_update_policy" ON usuarios;

CREATE POLICY "usuarios_select_policy" ON usuarios
    FOR SELECT 
    TO authenticated 
    USING (true);

CREATE POLICY "usuarios_insert_policy" ON usuarios
    FOR INSERT 
    TO authenticated 
    WITH CHECK (true);

CREATE POLICY "usuarios_update_policy" ON usuarios
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = uuid) 
    WITH CHECK (auth.uid() = uuid);

-- 7. Habilitar RLS en usuarios
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- 8. Verificar otras tablas importantes
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('plan_accion', 'usuarios', 'documentos', 'registros_fotograficos');
