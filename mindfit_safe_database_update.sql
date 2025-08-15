-- =====================================================
-- ACTUALIZACIÓN SEGURA PARA DBEAVER - MINDFIT
-- NO BORRA DATOS EXISTENTES, SOLO AÑADE LO QUE FALTA
-- =====================================================

-- =====================================================
-- AÑADIR COLUMNAS FALTANTES A LA TABLA USERS (si no existen)
-- =====================================================

-- Añadir campos JSONB para datos dinámicos (si no existen)
DO $$ 
BEGIN
    -- panelIA
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='panelIA') THEN
        ALTER TABLE users ADD COLUMN panelIA JSONB DEFAULT '{}';
    END IF;
    
    -- metodologiaActiva
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologiaActiva') THEN
        ALTER TABLE users ADD COLUMN metodologiaActiva JSONB DEFAULT NULL;
    END IF;
    
    -- progreso
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='progreso') THEN
        ALTER TABLE users ADD COLUMN progreso JSONB DEFAULT '{}';
    END IF;
    
    -- rutinas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rutinas') THEN
        ALTER TABLE users ADD COLUMN rutinas JSONB DEFAULT '{}';
    END IF;
    
    -- entrenamientoCasa
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='entrenamientoCasa') THEN
        ALTER TABLE users ADD COLUMN entrenamientoCasa JSONB DEFAULT '{}';
    END IF;
    
    -- videoCorreccion
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='videoCorreccion') THEN
        ALTER TABLE users ADD COLUMN videoCorreccion JSONB DEFAULT '{}';
    END IF;
    
    -- Campos adicionales que podrían faltar
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='años_entrenando') THEN
        ALTER TABLE users ADD COLUMN años_entrenando INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologia_preferida') THEN
        ALTER TABLE users ADD COLUMN metodologia_preferida VARCHAR(100);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='objetivo_principal') THEN
        ALTER TABLE users ADD COLUMN objetivo_principal VARCHAR(200);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='nivel') THEN
        ALTER TABLE users ADD COLUMN nivel VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='iniciales') THEN
        ALTER TABLE users ADD COLUMN iniciales VARCHAR(5);
    END IF;
    
END $$;

-- =====================================================
-- CREAR TABLAS ADICIONALES (solo si no existen)
-- =====================================================

-- Tabla para metodologías activas
CREATE TABLE IF NOT EXISTS active_methodologies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    methodology_name VARCHAR(100) NOT NULL,
    methodology_data JSONB NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    generada_por_ia BOOLEAN DEFAULT FALSE,
    respuesta_completa JSONB DEFAULT NULL,
    progreso DECIMAL(5,2) DEFAULT 0,
    entrenamientos_completados INTEGER DEFAULT 0,
    modo_ia VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para rutinas semanales
CREATE TABLE IF NOT EXISTS user_routines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    methodology_id INTEGER REFERENCES active_methodologies(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    routine_data JSONB NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para ejercicios individuales
CREATE TABLE IF NOT EXISTS routine_exercises (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER REFERENCES user_routines(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    series INTEGER,
    repetitions VARCHAR(50),
    weight DECIMAL(5,2),
    rest_seconds INTEGER,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- CREAR ÍNDICES (solo si no existen)
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_active_methodologies_user_id ON active_methodologies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routines_methodology_id ON user_routines(methodology_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercises_routine_id ON routine_exercises(routine_id);

-- =====================================================
-- ACTUALIZAR USUARIO EXISTENTE CON DATOS FALTANTES
-- =====================================================
UPDATE users SET 
    panelIA = COALESCE(panelIA, '{"estadoMetabolico": "Bueno", "recuperacionNeural": "75%", "eficienciaAdaptativa": "+5%", "proximaRevision": "7 días", "alertas": []}'),
    progreso = COALESCE(progreso, '{"peso": [], "medidas": [], "fotos": []}'),
    rutinas = COALESCE(rutinas, '{"rutinasGuardadas": [], "favoritas": []}'),
    entrenamientoCasa = COALESCE(entrenamientoCasa, '{"equipamiento": "basico", "espacio": "medio", "preferencias": {}}'),
    videoCorreccion = COALESCE(videoCorreccion, '{"analisisCompletados": 0, "mejoras": []}'),
    años_entrenando = COALESCE(años_entrenando, 2),
    metodologia_preferida = COALESCE(metodologia_preferida, 'hipertrofia'),
    objetivo_principal = COALESCE(objetivo_principal, objetivo),
    nivel = COALESCE(nivel, nivel_actividad),
    iniciales = COALESCE(iniciales, UPPER(LEFT(nombre, 1) || LEFT(COALESCE(apellido, ''), 1)))
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- CREAR FUNCIONES Y TRIGGERS (solo si no existen)
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers solo si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_active_methodologies_updated_at') THEN
        CREATE TRIGGER update_active_methodologies_updated_at BEFORE UPDATE ON active_methodologies
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
SELECT 'Actualización completada sin borrar datos existentes!' as mensaje;

-- Mostrar usuario actualizado
SELECT 
    id, email, nombre, apellido, edad, sexo, peso, altura, nivel, 
    metodologia_preferida, objetivo_principal,
    CASE WHEN panelIA IS NOT NULL THEN 'Configurado' ELSE 'No configurado' END as panelIA_status,
    CASE WHEN metodologiaActiva IS NOT NULL THEN 'Activa' ELSE 'Sin metodología' END as metodologia_status
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- Mostrar tablas creadas
SELECT table_name, 
       (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as total_columns
FROM information_schema.tables t
WHERE t.table_name IN ('users', 'active_methodologies', 'user_routines', 'routine_exercises')
  AND t.table_schema = 'public'
ORDER BY t.table_name;

COMMIT;
