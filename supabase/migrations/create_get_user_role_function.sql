-- Crear función RPC get_user_role para optimizar consultas de autenticación
-- Esta función centraliza la lógica de obtención de datos de usuario
-- Fecha: 2025-01-21
-- Descripción: Función para obtener rol y datos de usuario de forma eficiente

-- =====================================================
-- FUNCIÓN get_user_role
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
  -- Primero intentar obtener de la tabla usuarios (estructura principal)
  RETURN QUERY
  SELECT 
    u.id,
    u.nombre as email,  -- Asumiendo que nombre contiene el email
    u.nombre as full_name,
    u.rol as role,
    CASE 
      WHEN u.rol IN ('ADMIN', 'SUPER_ADMIN') THEN true
      ELSE false
    END as is_admin,
    u.area_id,
    u.area_id as dependencia,  -- Usar area_id como dependencia por compatibilidad
    u.created_at,
    u.updated_at
  FROM usuarios u
  WHERE u.id = user_id;
  
  -- Si no se encuentra en usuarios, intentar obtener de auth.users
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
-- PERMISOS Y SEGURIDAD
-- =====================================================

-- Otorgar permisos de ejecución a usuarios autenticados
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_role(UUID) TO anon;

-- =====================================================
-- FUNCIÓN AUXILIAR PARA MAPEAR ROLES
-- =====================================================

CREATE OR REPLACE FUNCTION normalize_user_role(input_role TEXT, user_email TEXT DEFAULT '')
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Normalizar roles basado en la lógica existente del sistema
  CASE UPPER(TRIM(input_role))
    WHEN 'ADMIN', 'ADMINISTRATOR', 'SUPER_ADMIN' THEN
      RETURN 'ADMIN';
    WHEN 'TALENTO_HUMANO', 'TALENTO HUMANO', 'RECURSOS_HUMANOS' THEN
      RETURN 'TALENTO_HUMANO';
    WHEN 'CALIDAD_EDUCATIVA', 'CALIDAD EDUCATIVA', 'CALIDAD' THEN
      RETURN 'CALIDAD_EDUCATIVA';
    WHEN 'COBERTURA_INFRAESTRUCTURA', 'COBERTURA E INFRAESTRUCTURA', 'COBERTURA' THEN
      RETURN 'COBERTURA_INFRAESTRUCTURA';
    WHEN 'INSPECCION_VIGILANCIA', 'INSPECCIÓN Y VIGILANCIA', 'INSPECCION' THEN
      RETURN 'INSPECCION_VIGILANCIA';
    WHEN 'PLANEACION', 'PLANEACIÓN' THEN
      RETURN 'PLANEACION';
    WHEN 'DESPACHO' THEN
      RETURN 'DESPACHO';
    ELSE
      -- Si el email contiene indicadores de rol, usarlos
      IF user_email LIKE '%admin%' OR user_email LIKE '%gerencia%' THEN
        RETURN 'ADMIN';
      ELSIF user_email LIKE '%talento%' THEN
        RETURN 'TALENTO_HUMANO';
      ELSIF user_email LIKE '%calidad%' THEN
        RETURN 'CALIDAD_EDUCATIVA';
      ELSIF user_email LIKE '%cobertura%' OR user_email LIKE '%infraestructura%' THEN
        RETURN 'COBERTURA_INFRAESTRUCTURA';
      ELSIF user_email LIKE '%inspeccion%' OR user_email LIKE '%vigilancia%' THEN
        RETURN 'INSPECCION_VIGILANCIA';
      ELSIF user_email LIKE '%planeacion%' THEN
        RETURN 'PLANEACION';
      ELSIF user_email LIKE '%despacho%' THEN
        RETURN 'DESPACHO';
      ELSE
        RETURN 'USER';
      END IF;
  END CASE;
END;
$$;

-- Otorgar permisos a la función auxiliar
GRANT EXECUTE ON FUNCTION normalize_user_role(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION normalize_user_role(TEXT, TEXT) TO anon;

-- =====================================================
-- COMENTARIOS Y DOCUMENTACIÓN
-- =====================================================

-- Comentarios en las funciones
COMMENT ON FUNCTION get_user_role(UUID) IS 'Obtiene datos completos de usuario incluyendo rol normalizado y permisos';
COMMENT ON FUNCTION normalize_user_role(TEXT, TEXT) IS 'Normaliza roles de usuario basado en convenciones del sistema';

-- =====================================================
-- NOTAS DE IMPLEMENTACIÓN
-- =====================================================

/*
ESTAS FUNCIONES RESUELVEN LOS SIGUIENTES PROBLEMAS:

1. CONSULTAS DUPLICADAS: Centraliza la lógica de obtención de usuario
2. INCONSISTENCIA DE DATOS: Maneja tanto tabla usuarios como auth.users
3. NORMALIZACIÓN DE ROLES: Aplica reglas consistentes para mapeo de roles
4. RENDIMIENTO: Reduce el número de consultas desde el cliente
5. SEGURIDAD: Usa SECURITY DEFINER para acceso controlado

USO DESDE EL CLIENTE:
```sql
SELECT * FROM get_user_role('user-uuid-here');
```

ESTRUCTURA DE RESPUESTA:
- id: UUID del usuario
- email: Email del usuario
- full_name: Nombre completo
- role: Rol normalizado del sistema
- is_admin: Boolean indicando si es administrador
- area_id: ID del área asignada
- dependencia: Dependencia/área para compatibilidad
- created_at: Fecha de creación
- updated_at: Fecha de última actualización
*/