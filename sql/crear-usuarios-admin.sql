-- SQL COMPLETO PARA CREAR USUARIOS ADMIN Y SUS PERFILES
-- Sistema Educativo - Secretaría de Educación Guadalajara de Buga
-- Fecha: 16 de Julio 2025

-- ========================================
-- 1. INSERTAR USUARIOS EN auth.users (Tabla de Supabase Authentication)
-- ========================================

-- Usuario 1: Juan Manuel Rubio
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rubioverajuanmanuel@gmail.com',
    crypt('SistemaEducativo2025!', gen_salt('bf')), -- Contraseña temporal
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Juan Manuel Rubio"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
);

-- Usuario 2: Sebastián David Vida
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gestiondecalidadsem@gmail.com',
    crypt('SistemaEducativo2025!', gen_salt('bf')), -- Contraseña temporal
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Sebastián David Vida"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
);

-- Usuario 3: Jaime Diego Gutiérrez
INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    invited_at,
    confirmation_token,
    confirmation_sent_at,
    recovery_token,
    recovery_sent_at,
    email_change_token_new,
    email_change,
    email_change_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    phone,
    phone_confirmed_at,
    phone_change,
    phone_change_token,
    phone_change_sent_at,
    email_change_token_current,
    email_change_confirm_status,
    banned_until,
    reauthentication_token,
    reauthentication_sent_at,
    is_sso_user,
    deleted_at
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gerencia@edux.digital',
    crypt('SistemaEducativo2025!', gen_salt('bf')), -- Contraseña temporal
    NOW(),
    NULL,
    '',
    NULL,
    '',
    NULL,
    '',
    '',
    NULL,
    NULL,
    '{"provider": "email", "providers": ["email"]}',
    '{"full_name": "Jaime Diego Gutiérrez"}',
    FALSE,
    NOW(),
    NOW(),
    NULL,
    NULL,
    '',
    '',
    NULL,
    '',
    0,
    NULL,
    '',
    NULL,
    FALSE,
    NULL
);

-- ========================================
-- 2. INSERTAR PERFILES EN LA TABLA usuarios (Tabla personalizada del sistema)
-- ========================================

-- Perfil Usuario 1: Juan Manuel Rubio
INSERT INTO public.usuarios (
    uuid,
    id,
    nombre,
    area_id,
    rol,
    cargo,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'rubioverajuanmanuel@gmail.com'),
    (SELECT id FROM auth.users WHERE email = 'rubioverajuanmanuel@gmail.com'),
    'Juan Manuel Rubio',
    NULL, -- Se puede asignar un área específica posteriormente
    'ADMIN',
    'Administrador del Sistema',
    NOW(),
    NOW()
);

-- Perfil Usuario 2: Sebastián David Vida
INSERT INTO public.usuarios (
    uuid,
    id,
    nombre,
    area_id,
    rol,
    cargo,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'gestiondecalidadsem@gmail.com'),
    (SELECT id FROM auth.users WHERE email = 'gestiondecalidadsem@gmail.com'),
    'Sebastián David Vida',
    NULL, -- Se puede asignar un área específica posteriormente
    'ADMIN',
    'Administrador del Sistema',
    NOW(),
    NOW()
);

-- Perfil Usuario 3: Jaime Diego Gutiérrez
INSERT INTO public.usuarios (
    uuid,
    id,
    nombre,
    area_id,
    rol,
    cargo,
    created_at,
    updated_at
) VALUES (
    (SELECT id FROM auth.users WHERE email = 'gerencia@edux.digital'),
    (SELECT id FROM auth.users WHERE email = 'gerencia@edux.digital'),
    'Jaime Diego Gutiérrez',
    NULL, -- Se puede asignar un área específica posteriormente
    'ADMIN',
    'Administrador del Sistema',
    NOW(),
    NOW()
);

-- ========================================
-- 3. VERIFICACIÓN DE LOS USUARIOS CREADOS
-- ========================================

-- Verificar usuarios en auth.users
SELECT 
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data->>'full_name' as full_name
FROM auth.users 
WHERE email IN (
    'rubioverajuanmanuel@gmail.com',
    'gestiondecalidadsem@gmail.com',
    'gerencia@edux.digital'
)
ORDER BY created_at DESC;

-- Verificar perfiles en tabla usuarios
SELECT 
    u.id,
    u.nombre,
    u.rol,
    u.cargo,
    u.created_at,
    au.email
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
WHERE au.email IN (
    'rubioverajuanmanuel@gmail.com',
    'gestiondecalidadsem@gmail.com',
    'gerencia@edux.digital'
)
ORDER BY u.created_at DESC;

-- ========================================
-- 4. NOTAS IMPORTANTES
-- ========================================

/*
CREDENCIALES TEMPORALES:
- Email: rubioverajuanmanuel@gmail.com
  Contraseña: SistemaEducativo2025!
  
- Email: gestiondecalidadsem@gmail.com
  Contraseña: SistemaEducativo2025!
  
- Email: gerencia@edux.digital
  Contraseña: SistemaEducativo2025!

ACCIONES POST-EJECUCIÓN:
1. Informar a cada usuario su email y contraseña temporal
2. Solicitar que cambien la contraseña en el primer login
3. Asignar áreas específicas si es necesario
4. Configurar permisos adicionales según rol

SEGURIDAD:
- Las contraseñas están encriptadas con bcrypt
- Los usuarios tienen email confirmado automáticamente
- Estado activo por defecto
- Rol ADMIN para acceso completo al sistema

COMPATIBILIDAD:
- Compatible con Supabase Authentication
- Compatible con el sistema de roles del proyecto
- Mantiene integridad referencial entre auth.users y usuarios
*/
