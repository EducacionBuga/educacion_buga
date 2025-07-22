-- CONSULTA PARA DEBUG DE ROLES
-- Ejecutar en Supabase para verificar roles de usuarios

-- Ver todos los usuarios y sus roles en la tabla usuarios
SELECT 
    u.uuid,
    u.id,
    u.nombre,
    u.rol,
    u.cargo,
    u.created_at,
    au.email,
    au.raw_user_meta_data
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
ORDER BY u.created_at DESC;

-- Ver usuarios que tienen roles específicos
SELECT 
    u.nombre,
    u.rol,
    au.email,
    'ROL ESPECÍFICO' as estado
FROM public.usuarios u
JOIN auth.users au ON u.id = au.id
WHERE u.rol IN (
    'CALIDAD_EDUCATIVA',
    'INSPECCION_VIGILANCIA', 
    'COBERTURA_INFRAESTRUCTURA',
    'TALENTO_HUMANO'
)
ORDER BY u.rol;

-- Ver estructura de la tabla usuarios para verificar columnas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'usuarios'
ORDER BY ordinal_position;
