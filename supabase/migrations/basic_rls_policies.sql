-- Políticas RLS específicas para datos demográficos
-- Estas políticas permiten operaciones básicas para campos demográficos
-- Fecha: 2024-01-XX
-- Descripción: Políticas de seguridad para campos demográficos en plan_accion

-- =====================================================
-- POLÍTICAS PARA DATOS DEMOGRÁFICOS EN plan_accion
-- =====================================================

-- Habilitar RLS en la tabla plan_accion (si no está habilitado)
ALTER TABLE plan_accion ENABLE ROW LEVEL SECURITY;

-- Política específica para INSERT de datos demográficos
CREATE POLICY "plan_accion_demographic_insert_policy" ON plan_accion
    FOR INSERT
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            grupo_etareo IS NOT NULL OR
            grupo_poblacion IS NOT NULL OR
            zona IS NOT NULL OR
            grupo_etnico IS NOT NULL OR
            cantidad IS NOT NULL
        )
    );

-- Política específica para UPDATE de datos demográficos
CREATE POLICY "plan_accion_demographic_update_policy" ON plan_accion
    FOR UPDATE
    USING (auth.role() = 'authenticated')
    WITH CHECK (
        auth.role() = 'authenticated' AND
        (
            grupo_etareo IS NOT NULL OR
            grupo_poblacion IS NOT NULL OR
            zona IS NOT NULL OR
            grupo_etnico IS NOT NULL OR
            cantidad IS NOT NULL
        )
    );

-- Política para SELECT que incluye datos demográficos
CREATE POLICY "plan_accion_demographic_select_policy" ON plan_accion
    FOR SELECT
    USING (auth.role() = 'authenticated');



-- =====================================================
-- VERIFICACIÓN DE POLÍTICAS DEMOGRÁFICAS
-- =====================================================

-- Consultar las políticas aplicadas específicamente para datos demográficos
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'plan_accion'
  AND policyname LIKE '%demographic%'
ORDER BY policyname;

-- =====================================================
-- NOTAS IMPORTANTES PARA DATOS DEMOGRÁFICOS
-- =====================================================

/*
ESTAS POLÍTICAS SON ESPECÍFICAS PARA DATOS DEMOGRÁFICOS:

1. Permiten INSERT/UPDATE solo cuando al menos un campo demográfico tiene valor
2. Los campos demográficos incluidos son:
   - grupo_etareo (text)
   - grupo_poblacion (text) 
   - zona (text)
   - grupo_etnico (text)
   - cantidad (integer)

3. Estas políticas resuelven problemas de permisos específicos para datos demográficos
4. Son compatibles con políticas existentes para otros campos

CAMPOS DEMOGRÁFICOS CUBIERTOS:
- grupo_etareo: Clasificación por edad
- grupo_poblacion: Tipo de población objetivo
- zona: Ubicación geográfica
- grupo_etnico: Clasificación étnica
- cantidad: Número de beneficiarios

SI EL PROBLEMA PERSISTE:
1. Verificar que los campos se envían con valores no nulos
2. Revisar logs de Supabase para errores específicos
3. Confirmar que el usuario está autenticado correctamente
*/