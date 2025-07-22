-- SQL SIMPLIFICADO PARA CREAR USUARIOS ADMIN
-- Sistema Educativo - Secretaría de Educación Guadalajara de Buga
-- Usar este script si el completo presenta problemas de permisos

-- ========================================
-- OPCIÓN ALTERNATIVA: SOLO TABLA usuarios
-- ========================================

-- IMPORTANTE: Los usuarios deben ser creados primero en Supabase Auth Dashboard
-- o usando las credenciales que se muestran abajo

-- ========================================
-- 1. INSERTAR PERFILES EN LA TABLA usuarios
-- ========================================

-- Nota: Reemplazar los UUIDs con los IDs reales de auth.users
-- o usar las consultas SELECT si ya existen los usuarios

-- Usuario 1: Juan Manuel Rubio
INSERT INTO public.usuarios (
    id,
    nombre,
    area_id,
    rol,
    cargo,
    avatar_url,
    ultimo_acceso,
    estado,
    created_at,
    updated_at
) VALUES (
    'uuid-juan-manuel-rubio', -- Reemplazar con UUID real
    'Juan Manuel Rubio',
    NULL,
    'ADMIN',
    'Administrador del Sistema',
    NULL,
    NOW(),
    'activo',
    NOW(),
    NOW()
);

-- Usuario 2: Sebastián David Vida
INSERT INTO public.usuarios (
    id,
    nombre,
    area_id,
    rol,
    cargo,
    avatar_url,
    ultimo_acceso,
    estado,
    created_at,
    updated_at
) VALUES (
    'uuid-sebastian-david-vida', -- Reemplazar con UUID real
    'Sebastián David Vida',
    NULL,
    'ADMIN',
    'Administrador del Sistema',
    NULL,
    NOW(),
    'activo',
    NOW(),
    NOW()
);

-- Usuario 3: Jaime Diego Gutiérrez
INSERT INTO public.usuarios (
    id,
    nombre,
    area_id,
    rol,
    cargo,
    avatar_url,
    ultimo_acceso,
    estado,
    created_at,
    updated_at
) VALUES (
    'uuid-jaime-diego-gutierrez', -- Reemplazar con UUID real
    'Jaime Diego Gutiérrez',
    NULL,
    'ADMIN',
    'Administrador del Sistema',
    NULL,
    NOW(),
    'activo',
    NOW(),
    NOW()
);

-- ========================================
-- 2. CREDENCIALES PARA CREAR EN SUPABASE AUTH DASHBOARD
-- ========================================

/*
Crear estos usuarios manualmente en Supabase Auth Dashboard:

USUARIO 1:
- Email: rubioverajuanmanuel@gmail.com
- Nombre: Juan Manuel Rubio
- Contraseña: SistemaEducativo2025!
- Email confirmado: ✓

USUARIO 2:
- Email: gestiondecalidadsem@gmail.com
- Nombre: Sebastián David Vida
- Contraseña: SistemaEducativo2025!
- Email confirmado: ✓

USUARIO 3:
- Email: gerencia@edux.digital
- Nombre: Jaime Diego Gutiérrez
- Contraseña: SistemaEducativo2025!
- Email confirmado: ✓

PASOS:
1. Ir a Supabase Dashboard > Authentication > Users
2. Crear cada usuario con "Add user"
3. Copiar el UUID generado
4. Ejecutar los INSERT de arriba reemplazando los UUIDs
*/

-- ========================================
-- 3. SQL PARA OBTENER UUIDs EXISTENTES
-- ========================================

-- Si los usuarios ya existen en auth.users, usar esta consulta para obtener sus UUIDs:
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
WHERE email IN (
    'rubioverajuanmanuel@gmail.com',
    'gestiondecalidadsem@gmail.com',
    'gerencia@edux.digital'
);

-- ========================================
-- 4. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que los usuarios están correctamente creados:
SELECT 
    u.id,
    u.nombre,
    u.rol,
    u.cargo,
    u.estado,
    au.email,
    au.email_confirmed_at
FROM public.usuarios u
LEFT JOIN auth.users au ON u.id = au.id
WHERE u.rol = 'ADMIN'
ORDER BY u.created_at DESC;
