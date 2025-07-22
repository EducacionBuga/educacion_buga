-- CREAR USUARIOS DIRECTAMENTE EN AUTH.USERS
-- Solo ejecutar si no existen en auth.users

-- Verificar si ya existen
SELECT email, 'YA EXISTE' as estado
FROM auth.users 
WHERE email IN (
    'calidadeducativa@educacionbuga.gov.co',
    'inspeccionvigilancia@educacionbuga.gov.co',
    'coberturainfraestructura@educacionbuga.gov.co',
    'talentohumano@educacionbuga.gov.co'
);

-- Si no existen, crear usuarios en auth.users
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
) VALUES 
(
    '58ed8b80-0710-443f-b00a-bd0e188a4a7c',
    'calidadeducativa@educacionbuga.gov.co',
    crypt('CalidadEducativa2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Calidad Educativa"}',
    'authenticated',
    'authenticated'
),
(
    '2f3d5512-d7e7-4b63-a4a3-1767081d32eb',
    'inspeccionvigilancia@educacionbuga.gov.co',
    crypt('InspeccionVigilancia2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Inspección y Vigilancia"}',
    'authenticated',
    'authenticated'
),
(
    '7a278d65-8028-400a-a710-b690d2c44317',
    'coberturainfraestructura@educacionbuga.gov.co',
    crypt('CoberturaInfraestructura2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Cobertura e Infraestructura"}',
    'authenticated',
    'authenticated'
),
(
    '7715127e-2304-4344-8e1d-525b15f16401',
    'talentohumano@educacionbuga.gov.co',
    crypt('TalentoHumano2025!', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"full_name": "Usuario Talento Humano"}',
    'authenticated',
    'authenticated'
);

-- Verificar que se crearon
SELECT 
    email,
    email_confirmed_at IS NOT NULL as confirmed,
    encrypted_password IS NOT NULL as has_password,
    raw_user_meta_data->>'full_name' as name
FROM auth.users 
WHERE email IN (
    'calidadeducativa@educacionbuga.gov.co',
    'inspeccionvigilancia@educacionbuga.gov.co',
    'coberturainfraestructura@educacionbuga.gov.co',
    'talentohumano@educacionbuga.gov.co'
);
