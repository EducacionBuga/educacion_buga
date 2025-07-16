-- Migration script to add multiple contract support
-- Add new columns to lista_chequeo_registros table

-- Check if columns exist and add them if they don't
DO $$
BEGIN
    -- Add contrato column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='contrato') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN contrato VARCHAR(255) DEFAULT 'Sin contrato';
        RAISE NOTICE 'Added contrato column';
    END IF;

    -- Add contratista column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='contratista') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN contratista VARCHAR(255) DEFAULT 'Sin contratista';
        RAISE NOTICE 'Added contratista column';
    END IF;

    -- Add valor column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='valor') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN valor DECIMAL(15,2) DEFAULT 0;
        RAISE NOTICE 'Added valor column';
    END IF;

    -- Add objeto column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='objeto') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN objeto TEXT DEFAULT 'Sin descripción';
        RAISE NOTICE 'Added objeto column';
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='created_at') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added created_at column';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='lista_chequeo_registros' AND column_name='updated_at') THEN
        ALTER TABLE lista_chequeo_registros ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column';
    END IF;

END $$;
