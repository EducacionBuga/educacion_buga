-- Crear tabla de carpetas
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  date TEXT,
  category TEXT NOT NULL,
  area_id UUID NOT NULL REFERENCES areas(id),
  module_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de documentos
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT NOT NULL,
  file_path TEXT,
  folder_id UUID NOT NULL REFERENCES folders(id),
  area_id UUID NOT NULL REFERENCES areas(id),
  module_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de informes de ejecución
CREATE TABLE IF NOT EXISTS informes_ejecucion (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT NOT NULL,
  file_path TEXT,
  area_id UUID NOT NULL REFERENCES areas(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear tabla de registros fotográficos
CREATE TABLE IF NOT EXISTS registros_fotograficos (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size BIGINT NOT NULL,
  file_path TEXT,
  thumbnail_url TEXT,
  area_id UUID NOT NULL REFERENCES areas(id),
  date DATE NOT NULL,
  location TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_folders_area_module ON folders(area_id, module_type);
CREATE INDEX IF NOT EXISTS idx_documents_folder ON documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_documents_area_module ON documents(area_id, module_type);
CREATE INDEX IF NOT EXISTS idx_informes_area ON informes_ejecucion(area_id);
CREATE INDEX IF NOT EXISTS idx_informes_date ON informes_ejecucion(date);
CREATE INDEX IF NOT EXISTS idx_registros_area ON registros_fotograficos(area_id);
CREATE INDEX IF NOT EXISTS idx_registros_date ON registros_fotograficos(date);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON folders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_informes_updated_at BEFORE UPDATE ON informes_ejecucion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registros_updated_at BEFORE UPDATE ON registros_fotograficos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- POLÍTICAS DE ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE informes_ejecucion ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_fotograficos ENABLE ROW LEVEL SECURITY;

-- Crear políticas para la tabla folders
-- Política para SELECT: Todos los usuarios autenticados pueden ver carpetas
CREATE POLICY folders_select_policy ON folders
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT: Usuarios autenticados pueden crear carpetas
CREATE POLICY folders_insert_policy ON folders
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: Usuarios autenticados pueden actualizar carpetas
CREATE POLICY folders_update_policy ON folders
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE: Usuarios autenticados pueden eliminar carpetas
CREATE POLICY folders_delete_policy ON folders
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para la tabla documents
-- Política para SELECT: Todos los usuarios autenticados pueden ver documentos
CREATE POLICY documents_select_policy ON documents
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT: Usuarios autenticados pueden crear documentos
CREATE POLICY documents_insert_policy ON documents
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: Usuarios autenticados pueden actualizar documentos
CREATE POLICY documents_update_policy ON documents
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE: Usuarios autenticados pueden eliminar documentos
CREATE POLICY documents_delete_policy ON documents
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para la tabla informes_ejecucion
-- Política para SELECT: Todos los usuarios autenticados pueden ver informes
CREATE POLICY informes_select_policy ON informes_ejecucion
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT: Usuarios autenticados pueden crear informes
CREATE POLICY informes_insert_policy ON informes_ejecucion
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: Usuarios autenticados pueden actualizar informes
CREATE POLICY informes_update_policy ON informes_ejecucion
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE: Usuarios autenticados pueden eliminar informes
CREATE POLICY informes_delete_policy ON informes_ejecucion
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear políticas para la tabla registros_fotograficos
-- Política para SELECT: Todos los usuarios autenticados pueden ver registros
CREATE POLICY registros_select_policy ON registros_fotograficos
  FOR SELECT USING (auth.role() = 'authenticated');

-- Política para INSERT: Usuarios autenticados pueden crear registros
CREATE POLICY registros_insert_policy ON registros_fotograficos
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para UPDATE: Usuarios autenticados pueden actualizar registros
CREATE POLICY registros_update_policy ON registros_fotograficos
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para DELETE: Usuarios autenticados pueden eliminar registros
CREATE POLICY registros_delete_policy ON registros_fotograficos
  FOR DELETE USING (auth.role() = 'authenticated');

-- Crear política para acceso de servicio (para APIs del servidor)
-- Esta política permite que el rol de servicio acceda a todas las tablas sin restricciones
CREATE POLICY service_role_policy ON folders
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY service_role_policy ON documents
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY service_role_policy ON informes_ejecucion
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY service_role_policy ON registros_fotograficos
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Política para administradores (opcional, si tienes un campo de rol en los usuarios)
-- Ejemplo: Si tienes un campo 'is_admin' en la tabla de perfiles de usuario
-- CREATE POLICY admin_policy ON folders
--   FOR ALL USING ((SELECT is_admin FROM profiles WHERE user_id = auth.uid()));
