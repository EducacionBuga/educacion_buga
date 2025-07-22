-- SQL PARA CREAR USUARIOS CON ROLES ESPECÍFICOS
-- Sistema Educativo - Secretaría de Educación Guadalajara de Buga
-- Fecha: 22 de Julio 2025

-- ========================================
-- USUARIOS CON ROLES ESPECÍFICOS POR ÁREA
-- ========================================

-- IMPORTANTE: Los usuarios deben ser creados primero en Supabase Auth Dashboard
-- Luego ejecutar estos INSERT reemplazando los UUIDs reales

-- ========================================
-- 1. USUARIO CALIDAD EDUCATIVA
-- ========================================

-- Crear en Supabase Auth Dashboard:
-- Email: calidadeducativa@educacionbuga.gov.co
-- Nombre: Usuario Calidad Educativa
-- Contraseña: CalidadEducativa2025!

-- ========================================
-- CONSULTAR USUARIOS EXISTENTES PARA ASIGNAR ROLES
-- ========================================

-- PASO 1: Ver todos los usuarios existentes en auth.users
SELECT 
    id,
    email,
    raw_user_meta_data->>'full_name' as full_name,
    created_at
FROM auth.users 
ORDER BY created_at DESC;

-- PASO 2: Ver usuarios que ya tienen perfil en la tabla usuarios
SELECT 
    u.uuid,
    u.id,
    u.nombre,
    u.rol,
    u.cargo,
    au.email
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- PASO 3: Ver usuarios que están en auth.users pero NO en usuarios (candidatos para asignar rol)
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name' as full_name,
    au.created_at,
    'SIN ROL ASIGNADO' as estado
FROM auth.users au
LEFT JOIN public.usuarios u ON au.id = u.id
WHERE u.id IS NULL
ORDER BY au.created_at DESC;

-- PASO 4: INSERTAR USUARIOS DE DEPENDENCIAS
-- Primero crear estos usuarios en Supabase Auth Dashboard, luego ejecutar los INSERT

-- USUARIO CALIDAD EDUCATIVA
-- Crear en Supabase: calidadeducativa@educacionbuga.gov.co / CalidadEducativa2025!
-- Luego reemplazar 'UUID_CALIDAD_EDUCATIVA' con el UUID real:
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
    'UUID_CALIDAD_EDUCATIVA', -- Reemplazar con UUID real
    'UUID_CALIDAD_EDUCATIVA', -- Reemplazar con UUID real
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

-- Crear en Supabase Auth Dashboard:
-- Email: inspeccionvigilancia@educacionbuga.gov.co
-- Nombre: Usuario Inspección y Vigilancia
-- Contraseña: InspeccionVigilancia2025!

-- USUARIO INSPECCIÓN Y VIGILANCIA
-- Crear en Supabase: inspeccionvigilancia@educacionbuga.gov.co / InspeccionVigilancia2025!
-- Luego reemplazar 'UUID_INSPECCION_VIGILANCIA' con el UUID real:
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
    'UUID_INSPECCION_VIGILANCIA', -- Reemplazar con UUID real
    'UUID_INSPECCION_VIGILANCIA', -- Reemplazar con UUID real
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

-- Crear en Supabase Auth Dashboard:
-- Email: coberturainfraestructura@educacionbuga.gov.co
-- Nombre: Usuario Cobertura e Infraestructura
-- Contraseña: CoberturaInfraestructura2025!

-- USUARIO COBERTURA E INFRAESTRUCTURA
-- Crear en Supabase: coberturainfraestructura@educacionbuga.gov.co / CoberturaInfraestructura2025!
-- Luego reemplazar 'UUID_COBERTURA_INFRAESTRUCTURA' con el UUID real:
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
    'UUID_COBERTURA_INFRAESTRUCTURA', -- Reemplazar con UUID real
    'UUID_COBERTURA_INFRAESTRUCTURA', -- Reemplazar con UUID real
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

-- Crear en Supabase Auth Dashboard:
-- Email: talentohumano@educacionbuga.gov.co
-- Nombre: Usuario Talento Humano
-- Contraseña: TalentoHumano2025!

-- USUARIO TALENTO HUMANO
-- Crear en Supabase: talentohumano@educacionbuga.gov.co / TalentoHumano2025!
-- Luego reemplazar 'UUID_TALENTO_HUMANO' con el UUID real:
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
    'UUID_TALENTO_HUMANO', -- Reemplazar con UUID real
    'UUID_TALENTO_HUMANO', -- Reemplazar con UUID real
    'Usuario Talento Humano',
    NULL,
    'TALENTO_HUMANO',
    'Coordinador Talento Humano',
    NOW(),
    NOW()
);

-- ========================================
-- 5. CONSULTA PARA OBTENER UUIDs EXISTENTES
-- ========================================

-- Si ya creaste los usuarios en Supabase, usa esta consulta para obtener sus UUIDs:
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

-- ========================================
-- 6. VERIFICACIÓN FINAL
-- ========================================

-- Verificar que los usuarios están correctamente creados:
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
ORDER BY u.rol;

-- ========================================
-- 7. CREDENCIALES Y INSTRUCCIONES
-- ========================================

/*
PASOS PARA CREAR LOS USUARIOS:

1. Ir a Supabase Dashboard > Authentication > Users
2. Hacer clic en "Add user"
3. Crear cada usuario con estos datos:

USUARIO 1 - CALIDAD EDUCATIVA:
- Email: calidadeducativa@educacionbuga.gov.co
- Password: CalidadEducativa2025!
- Confirm email: ✓
- Full name: Usuario Calidad Educativa

USUARIO 2 - INSPECCIÓN Y VIGILANCIA:
- Email: inspeccionvigilancia@educacionbuga.gov.co  
- Password: InspeccionVigilancia2025!
- Confirm email: ✓
- Full name: Usuario Inspección y Vigilancia

USUARIO 3 - COBERTURA E INFRAESTRUCTURA:
- Email: coberturainfraestructura@educacionbuga.gov.co
- Password: CoberturaInfraestructura2025!
- Confirm email: ✓
- Full name: Usuario Cobertura e Infraestructura

USUARIO 4 - TALENTO HUMANO:
- Email: talentohumano@educacionbuga.gov.co
- Password: TalentoHumano2025!
- Confirm email: ✓
- Full name: Usuario Talento Humano

4. Copiar el UUID generado para cada usuario
5. Reemplazar los 'uuid-xxx' en los INSERT de arriba con los UUIDs reales
6. Ejecutar los INSERT en el SQL Editor
7. Ejecutar la verificación final

PERMISOS POR ROL:
- CALIDAD_EDUCATIVA: Acceso a módulos de calidad educativa
- INSPECCION_VIGILANCIA: Acceso a módulos de inspección y vigilancia
- COBERTURA_INFRAESTRUCTURA: Acceso a módulos de cobertura e infraestructura  
- TALENTO_HUMANO: Acceso a módulos de talento humano
- Cada usuario solo puede acceder a su área específica + funciones comunes

SEGURIDAD:
- Contraseñas temporales que deben cambiar en el primer login
- Roles específicos con permisos limitados a su área
- Email confirmado automáticamente
*/
