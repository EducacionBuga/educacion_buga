-- Crear tabla de carpetas
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  date TEXT,
  category TEXT NOT NULL,
  area_slug TEXT NOT NULL,
  module_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER NOT NULL,
  file_path TEXT,
  folder_id UUID NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  area_slug TEXT NOT NULL,
  module_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS folders_area_module_idx ON folders(area_slug, module_type);
CREATE INDEX IF NOT EXISTS documents_folder_idx ON documents(folder_id);
CREATE INDEX IF NOT EXISTS documents_area_module_idx ON documents(area_slug, module_type);
