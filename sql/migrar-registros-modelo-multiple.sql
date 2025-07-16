-- Script para migrar registros existentes al nuevo modelo
-- Ejecutar solo si hay registros con categoria_id que necesitan migración

DO $$
DECLARE
    record_count INTEGER;
BEGIN
    -- Verificar si hay registros con categoria_id (modelo antiguo)
    SELECT COUNT(*) INTO record_count 
    FROM information_schema.columns 
    WHERE table_name = 'lista_chequeo_registros' 
    AND column_name = 'categoria_id';
    
    IF record_count > 0 THEN
        RAISE NOTICE 'Encontrada columna categoria_id, iniciando migración...';
        
        -- Eliminar la columna categoria_id si existe (ya no la necesitamos)
        -- Los contratos ahora pueden tener múltiples apartados
        ALTER TABLE lista_chequeo_registros DROP COLUMN IF EXISTS categoria_id;
        
        -- Asegurar que tenemos las columnas correctas
        ALTER TABLE lista_chequeo_registros 
        ADD COLUMN IF NOT EXISTS contrato VARCHAR(255),
        ADD COLUMN IF NOT EXISTS contratista VARCHAR(255),
        ADD COLUMN IF NOT EXISTS valor DECIMAL(15,2) DEFAULT 0,
        ADD COLUMN IF NOT EXISTS objeto TEXT DEFAULT '';
        
        -- Migrar datos si existen campos antiguos
        UPDATE lista_chequeo_registros 
        SET contrato = COALESCE(numero_contrato, contrato),
            contratista = COALESCE(contratista, contratista),
            valor = COALESCE(valor_contrato, valor)
        WHERE numero_contrato IS NOT NULL OR valor_contrato IS NOT NULL;
        
        -- Eliminar columnas antiguas (pero conservar fecha_creacion y fecha_actualizacion)
        ALTER TABLE lista_chequeo_registros 
        DROP COLUMN IF EXISTS numero_contrato,
        DROP COLUMN IF EXISTS valor_contrato,
        DROP COLUMN IF EXISTS estado,
        DROP COLUMN IF EXISTS porcentaje_completado;
        
        -- Asegurar que tenemos las columnas de fecha correctas
        ALTER TABLE lista_chequeo_registros 
        ADD COLUMN IF NOT EXISTS fecha_creacion TIMESTAMP DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP DEFAULT NOW();
        
        RAISE NOTICE 'Migración completada exitosamente';
    ELSE
        RAISE NOTICE 'No se requiere migración, estructura ya actualizada';
    END IF;
END $$;

-- Verificar estructura final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lista_chequeo_registros'
ORDER BY ordinal_position;
