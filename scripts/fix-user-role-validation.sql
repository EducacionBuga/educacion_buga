-- Script para corregir la validación de roles de usuario
-- Ejecutar en Supabase Dashboard > SQL Editor

-- =====================================================
-- 1. ELIMINAR FUNCIÓN EXISTENTE
-- =====================================================

DROP FUNCTION IF EXISTS get_user_role(UUID);

-- =====================================================
-- 2. CREAR FUNCIÓN get_user_role CORREGIDA
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  is_admin BOOLEAN,
  area_id TEXT,
  dependencia TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Consultar la tabla profiles primero
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.is_admin,
    CAST(NULL AS TEXT) as area_id,  -- profiles no tiene area_id
    CAST(NULL AS TEXT) as dependencia,  -- profiles no tiene dependencia
    p.created_at,
    p.updated_at
  FROM profiles p
  WHERE p.id = user_id;
  
  -- Si no se encuentra en profiles, usar auth.users como fallback
  IF NOT FOUND THEN
    RETURN QUERY
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', split_part(au.email, '@', 1)) as full_name,
      COALESCE(au.raw_user_meta_data->>'role', 'USER') as role,
      CASE 
        WHEN COALESCE(au.raw_user_meta_data->>'role', 'USER') IN ('ADMIN', 'SUPER_ADMIN') THEN true
        ELSE false
      END as is_admin,
      au.raw_user_meta_data->>'area_id' as area_id,
      au.raw_user_meta_data->>'area' as dependencia,
      au.created_at,
      au.updated_at
    FROM auth.users au
    WHERE au.id = user_id;
  END IF;
END;
$$;

-- =====================================================
-- 3. OTORGAR PERMISOS
-- =====================================================

GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;

-- =====================================================
-- 4. VERIFICAR FUNCIÓN
-- =====================================================

-- Verificar que la función existe
SELECT proname, proargnames 
FROM pg_proc 
WHERE proname = 'get_user_role';

-- Mostrar usuarios en profiles para referencia
SELECT id, email, role, is_admin FROM profiles ORDER BY email;

-- =====================================================
-- 5. PROBAR FUNCIÓN CON USUARIOS REALES
-- =====================================================

-- Probar con usuario de calidad educativa
SELECT 'Test Calidad Educativa:' as test_name;
SELECT * FROM get_user_role('7f2015c3-4d93-477f-8268-ddb79f7fcac8');

-- Probar con usuario admin
SELECT 'Test Admin:' as test_name;
SELECT * FROM get_user_role('67f0c4b1-8e4c-4711-ac44-c657418972d5');

-- Probar con usuario de inspección y vigilancia
SELECT 'Test Inspección y Vigilancia:' as test_name;
SELECT * FROM get_user_role('fc89f611-c8f7-411e-8508-f3ae794e3508');

-- =====================================================
-- 6. COMENTARIOS
-- =====================================================

COMMENT ON FUNCTION get_user_role(UUID) IS 'Función para obtener rol y datos de usuario desde tabla profiles con fallback a auth.users';

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================

/*
PARA APLICAR ESTA CORRECCIÓN:

1. Ejecutar este script completo en Supabase Dashboard > SQL Editor
2. Verificar que no hay errores en la ejecución
3. Probar la función con: SELECT * FROM get_user_role('user-id-aqui');
4. Verificar que devuelve los roles correctos de la tabla profiles
5. Probar el login en la aplicación

ESTRUCTURA DE RESPUESTA:
- id: UUID del usuario
- email: Email del usuario
- full_name: Nombre completo
- role: Rol del usuario (ADMIN, CALIDAD_EDUCATIVA, etc.)
- is_admin: Boolean indicando si es administrador
- area_id: NULL (no usado en profiles)
- dependencia: NULL (no usado en profiles)
- created_at: Fecha de creación
- updated_at: Fecha de última actualización
*/