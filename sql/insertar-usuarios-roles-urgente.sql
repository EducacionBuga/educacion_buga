-- ========================================
-- INSERTAR USUARIOS CON ROLES ESPECÍFICOS - URGENTE
-- Sistema Educativo - Secretaría de Educación Guadalajara de Buga
-- Fecha: 22 de Julio 2025
-- ========================================

-- IMPORTANTE: Este script crea usuarios en auth.users Y en la tabla usuarios
-- con UUIDs consistentes para cumplir con las restricciones de clave foránea

-- ========================================
-- 1. USUARIO CALIDAD EDUCATIVA
-- ========================================

-- 1.1 Crear usuario en auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'calidadeducativa@educacionbuga.gov.co',
    crypt('CalidadEducativa2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Calidad Educativa"}',
    'authenticated',
    'authenticated'
);

-- 1.2 Insertar en tabla usuarios usando el mismo UUID
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
    (SELECT id FROM auth.users WHERE email = 'calidadeducativa@educacionbuga.gov.co'),
    (SELECT id FROM auth.users WHERE email = 'calidadeducativa@educacionbuga.gov.co'),
    'Usuario Calidad Educativa',
    NULL,
    'CALIDAD_EDUCATIVA',
    'Coordinador Calidad Educativa',
    NOW(),
    NOW()
);

-- ========================================
-- 2. USUARIO INSPECCIÓN Y VIGILANCIA  
-- ========================================

-- 2.1 Crear usuario en auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'inspeccionvigilancia@educacionbuga.gov.co',
    crypt('InspeccionVigilancia2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Inspección y Vigilancia"}',
    'authenticated',
    'authenticated'
);

-- 2.2 Insertar en tabla usuarios usando el mismo UUID
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
    (SELECT id FROM auth.users WHERE email = 'inspeccionvigilancia@educacionbuga.gov.co'),
    (SELECT id FROM auth.users WHERE email = 'inspeccionvigilancia@educacionbuga.gov.co'),
    'Usuario Inspección y Vigilancia',
    NULL,
    'INSPECCION_VIGILANCIA',
    'Coordinador Inspección y Vigilancia',
    NOW(),
    NOW()
);

-- ========================================
-- 3. USUARIO COBERTURA E INFRAESTRUCTURA
-- ========================================

-- 3.1 Crear usuario en auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'coberturainfraestructura@educacionbuga.gov.co',
    crypt('CoberturaInfraestructura2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Cobertura e Infraestructura"}',
    'authenticated',
    'authenticated'
);

-- 3.2 Insertar en tabla usuarios usando el mismo UUID
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
    (SELECT id FROM auth.users WHERE email = 'coberturainfraestructura@educacionbuga.gov.co'),
    (SELECT id FROM auth.users WHERE email = 'coberturainfraestructura@educacionbuga.gov.co'),
    'Usuario Cobertura e Infraestructura',
    NULL,
    'COBERTURA_INFRAESTRUCTURA',
    'Coordinador Cobertura e Infraestructura',
    NOW(),
    NOW()
);

-- ========================================
-- 4. USUARIO TALENTO HUMANO
-- ========================================

-- 4.1 Crear usuario en auth.users
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data,
    aud,
    role
) VALUES (
    gen_random_uuid(),
    'talentohumano@educacionbuga.gov.co',
    crypt('TalentoHumano2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Talento Humano"}',
    'authenticated',
    'authenticated'
);

-- 4.2 Insertar en tabla usuarios usando el mismo UUID
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
    (SELECT id FROM auth.users WHERE email = 'talentohumano@educacionbuga.gov.co'),
    (SELECT id FROM auth.users WHERE email = 'talentohumano@educacionbuga.gov.co'),
    'Usuario Talento Humano',
    NULL,
    'TALENTO_HUMANO',
    'Coordinador Talento Humano',
    NOW(),
    NOW()
);

-- ========================================
-- VERIFICACIÓN DE USUARIOS CREADOS
-- ========================================

-- Verificar usuarios en auth.users:
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
WHERE email IN (
    'calidadeducativa@educacionbuga.gov.co',
    'inspeccionvigilancia@educacionbuga.gov.co',
    'coberturainfraestructura@educacionbuga.gov.co',
    'talentohumano@educacionbuga.gov.co'
)
ORDER BY email;

-- Verificar usuarios en tabla usuarios:
SELECT 
    u.uuid,
    u.id,
    u.nombre,
    u.rol,
    u.cargo,
    u.created_at,
    au.email
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
WHERE u.rol IN (
    'CALIDAD_EDUCATIVA',
    'INSPECCION_VIGILANCIA', 
    'COBERTURA_INFRAESTRUCTURA',
    'TALENTO_HUMANO'
)
ORDER BY u.created_at DESC;

-- ========================================
-- CONTEO DE USUARIOS POR ROL
-- ========================================

-- Verificar conteo total:
SELECT 
    rol,
    COUNT(*) as cantidad
FROM public.usuarios 
GROUP BY rol
ORDER BY rol;
