-- Migración: convertir limitaciones a JSONB y crear tabla de lesiones normalizada
-- 1) Cambiar tipo de columna `limitaciones` a JSONB (si actualmente es TEXT)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'limitaciones' AND data_type <> 'jsonb'
  ) THEN
    -- Intentar castear el contenido existente a JSON, o envolver en array si es texto plano
    BEGIN
      ALTER TABLE users ALTER COLUMN limitaciones TYPE jsonb USING (
        CASE
          WHEN limitaciones IS NULL OR trim(limitaciones) = '' THEN '[]'::jsonb
          WHEN limitaciones::jsonb IS NOT NULL THEN limitaciones::jsonb
        END
      );
    EXCEPTION WHEN others THEN
      -- Si falla el cast directo, convertir texto a array JSON con un único elemento
      ALTER TABLE users ALTER COLUMN limitaciones TYPE jsonb USING (
        jsonb_build_array(limitaciones)
      );
    END;
  END IF;
END$$;

-- Asegurar default y no-null opcional
ALTER TABLE users ALTER COLUMN limitaciones SET DEFAULT '[]'::jsonb;

-- 2) Crear tabla injuries
CREATE TABLE IF NOT EXISTS injuries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  titulo VARCHAR(120),
  zona VARCHAR(120),
  severidad VARCHAR(30) CHECK (severidad IN ('leve','moderada','grave')),
  fecha DATE,
  estado VARCHAR(30) CHECK (estado IN ('activo','recuperado','en_seguimiento')) DEFAULT 'activo',
  tratamiento TEXT,
  limitacion_actual TEXT,
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3) (Opcional) Volcar datos desde users.limitaciones al tabla injuries
-- Este bloque intenta leer el JSONB array y crear rows por cada elemento
DO $$
DECLARE
  u RECORD;
  item JSONB;
BEGIN
  FOR u IN SELECT id, limitaciones FROM users LOOP
    IF u.limitaciones IS NOT NULL THEN
      FOR item IN SELECT jsonb_array_elements(u.limitaciones) LOOP
        INSERT INTO injuries (user_id, titulo, zona, severidad, fecha, estado, tratamiento, limitacion_actual, notas)
        VALUES (
          u.id,
          COALESCE(item->>'titulo', NULL),
          COALESCE(item->>'zona', NULL),
          COALESCE(item->>'severidad', NULL),
          COALESCE((item->>'fecha')::date, NULL),
          COALESCE(item->>'estado', 'activo'),
          COALESCE(item->>'tratamiento', NULL),
          COALESCE(item->>'limitacion_actual', NULL),
          COALESCE(item->>'notas', NULL)
        );
      END LOOP;
    END IF;
  END LOOP;
END$$;

-- 4) Índices útiles
CREATE INDEX IF NOT EXISTS idx_injuries_user ON injuries(user_id);
CREATE INDEX IF NOT EXISTS idx_injuries_estado ON injuries(estado);
