-- Script para verificar el usuario de TALENTO_HUMANO
-- Ejecutar en Supabase Dashboard > SQL Editor

-- =====================================================
-- 1. VERIFICAR USUARIO EN TABLA PROFILES
-- =====================================================

-- Buscar usuario por email
SELECT 'Usuario en tabla profiles:' as info;
SELECT id, email, full_name, role, is_admin, created_at, updated_at 
FROM profiles 
WHERE email = 'talentohumano2@educacionbuga.gov.co';

-- =====================================================
-- 2. VERIFICAR USUARIO EN AUTH.USERS
-- =====================================================

-- Buscar usuario en auth.users
SELECT 'Usuario en auth.users:' as info;
SELECT id, email, raw_user_meta_data, created_at, updated_at 
FROM auth.users 
WHERE email = 'talentohumano2@educacionbuga.gov.co';

-- =====================================================
-- 3. PROBAR FUNCIÓN RPC CON ESTE USUARIO
-- =====================================================

-- Obtener ID del usuario primero
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Obtener UUID del usuario
    SELECT id INTO user_uuid FROM auth.users WHERE email = 'talentohumano2@educacionbuga.gov.co';
    
    IF user_uuid IS NOT NULL THEN
        RAISE NOTICE 'Probando función RPC con usuario: %', user_uuid;
        -- No podemos usar RETURN QUERY en un bloque DO, así que solo mostramos el ID
    ELSE
        RAISE NOTICE 'Usuario no encontrado en auth.users';
    END IF;
END
$$;

-- Probar función RPC manualmente (reemplazar con ID real)
-- SELECT * FROM get_user_role('UUID-DEL-USUARIO-AQUI');

-- =====================================================
-- 4. VERIFICAR TODOS LOS USUARIOS CON ROL TALENTO_HUMANO
-- =====================================================

SELECT 'Todos los usuarios con rol TALENTO_HUMANO:' as info;
SELECT id, email, full_name, role, is_admin 
FROM profiles 
WHERE role ILIKE '%TALENTO%' OR role ILIKE '%HUMANO%';

-- =====================================================
-- 5. CREAR USUARIO SI NO EXISTE
-- =====================================================

-- Verificar si necesitamos crear el usuario en profiles
DO $$
DECLARE
    user_exists BOOLEAN;
    auth_user_id UUID;
BEGIN
    -- Verificar si existe en profiles
    SELECT EXISTS(SELECT 1 FROM profiles WHERE email = 'talentohumano2@educacionbuga.gov.co') INTO user_exists;
    
    IF NOT user_exists THEN
        -- Obtener ID de auth.users
        SELECT id INTO auth_user_id FROM auth.users WHERE email = 'talentohumano2@educacionbuga.gov.co';
        
        IF auth_user_id IS NOT NULL THEN
            -- Crear usuario en profiles
            INSERT INTO profiles (id, email, full_name, role, is_admin, created_at, updated_at)
            VALUES (
                auth_user_id,
                'talentohumano2@educacionbuga.gov.co',
                'Usuario Talento Humano',
                'TALENTO_HUMANO',
                false,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Usuario creado en tabla profiles con rol TALENTO_HUMANO';
        ELSE
            RAISE NOTICE 'Usuario no existe en auth.users - debe ser creado primero';
        END IF;
    ELSE
        RAISE NOTICE 'Usuario ya existe en tabla profiles';
    END IF;
END
$$;

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================

SELECT 'Verificación final:' as info;
SELECT id, email, full_name, role, is_admin 
FROM profiles 
WHERE email = 'talentohumano2@educacionbuga.gov.co';

-- =====================================================
-- INSTRUCCIONES
-- =====================================================

/*
PARA RESOLVER EL PROBLEMA:

1. Ejecutar este script en Supabase Dashboard > SQL Editor
2. Verificar si el usuario existe en la tabla profiles
3. Si no existe, el script lo creará automáticamente
4. Si existe pero tiene rol incorrecto, actualizar manualmente:
   
   UPDATE profiles 
   SET role = 'TALENTO_HUMANO', updated_at = NOW()
   WHERE email = 'talentohumano2@educacionbuga.gov.co';

5. Probar login nuevamente

POSIBLES PROBLEMAS:
- Usuario no existe en tabla profiles
- Usuario tiene rol diferente (ej: 'TALENTO HUMANO' con espacio)
- Usuario no existe en auth.users (debe crearse primero)
- Función RPC no encuentra el usuario
*/