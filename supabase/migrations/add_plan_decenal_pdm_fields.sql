-- Agregar campos del Plan Decenal y PDM a la tabla plan_accion
ALTER TABLE plan_accion 
ADD COLUMN meta_decenal TEXT,
ADD COLUMN macroobjetivo_decenal TEXT,
ADD COLUMN objetivo_decenal TEXT,
ADD COLUMN programa_pdm TEXT,
ADD COLUMN subprograma_pdm TEXT,
ADD COLUMN proyecto_pdm TEXT;