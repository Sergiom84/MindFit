-- =====================================================
-- SETUP COMPLETO PARA DBEAVER - MINDFIT
-- Base de datos completa con todas las tablas necesarias
-- =====================================================

-- Eliminar tablas existentes si existen (para empezar limpio)
DROP TABLE IF EXISTS routine_exercises CASCADE;
DROP TABLE IF EXISTS user_routines CASCADE;
DROP TABLE IF EXISTS active_methodologies CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =====================================================
-- TABLA USERS (completa con todos los campos)
-- =====================================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    -- Datos básicos de autenticación
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Información personal
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100),
    edad INTEGER,
    sexo VARCHAR(20),
    iniciales VARCHAR(5),
    
    -- Datos físicos
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    imc DECIMAL(4,1),
    
    -- Composición corporal
    grasa_corporal DECIMAL(5,2),
    masa_muscular DECIMAL(5,2),
    agua_corporal DECIMAL(5,2),
    metabolismo_basal INTEGER,
    
    -- Medidas corporales
    cintura DECIMAL(5,2),
    pecho DECIMAL(5,2),
    brazos DECIMAL(5,2),
    muslos DECIMAL(5,2),
    cuello DECIMAL(5,2),
    antebrazos DECIMAL(5,2),
    
    -- Experiencia y nivel
    nivel VARCHAR(50),
    nivel_actividad VARCHAR(50),
    experiencia VARCHAR(100),
    años_entrenando INTEGER,
    metodologia_preferida VARCHAR(100),
    frecuencia_semanal INTEGER,
    
    -- Salud y limitaciones
    historial_medico TEXT,
    limitaciones JSONB DEFAULT '[]',
    alergias TEXT,
    medicamentos TEXT,
    
    -- Objetivos
    objetivo_principal VARCHAR(200),
    meta_peso DECIMAL(5,2),
    meta_grasa DECIMAL(5,2),
    
    -- Nutrición y estilo de vida
    enfoque VARCHAR(100),
    horario_preferido VARCHAR(100),
    comidas_diarias INTEGER,
    suplementacion TEXT,
    alimentos_excluidos TEXT,
    
    -- Datos adicionales para IA
    panelIA JSONB DEFAULT '{}',
    metodologiaActiva JSONB DEFAULT NULL,
    progreso JSONB DEFAULT '{}',
    rutinas JSONB DEFAULT '{}',
    entrenamientoCasa JSONB DEFAULT '{}',
    videoCorreccion JSONB DEFAULT '{}',
    
    -- Metadatos
    avatar_url VARCHAR(500),
    fecha_inicio_objetivo DATE,
    fecha_meta_objetivo DATE,
    notas_progreso TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA ACTIVE_METHODOLOGIES (metodologías activas)
-- =====================================================
CREATE TABLE active_methodologies (
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

-- =====================================================
-- TABLA USER_ROUTINES (rutinas semanales)
-- =====================================================
CREATE TABLE user_routines (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    methodology_id INTEGER REFERENCES active_methodologies(id) ON DELETE CASCADE,
    week_number INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    routine_data JSONB NOT NULL, -- Array de 7 días con ejercicios
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABLA ROUTINE_EXERCISES (ejercicios individuales)
-- =====================================================
CREATE TABLE routine_exercises (
    id SERIAL PRIMARY KEY,
    routine_id INTEGER REFERENCES user_routines(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL, -- 1-7
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
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_active_methodologies_user_id ON active_methodologies(user_id);
CREATE INDEX idx_user_routines_user_id ON user_routines(user_id);
CREATE INDEX idx_user_routines_methodology_id ON user_routines(methodology_id);
CREATE INDEX idx_routine_exercises_routine_id ON routine_exercises(routine_id);

-- =====================================================
-- USUARIO DE PRUEBA CON DATOS COMPLETOS
-- =====================================================
INSERT INTO users (
    email, password, nombre, apellido, edad, sexo, iniciales,
    peso, altura, imc, grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,
    cintura, pecho, brazos, muslos, cuello, antebrazos,
    nivel, nivel_actividad, experiencia, años_entrenando, metodologia_preferida, frecuencia_semanal,
    historial_medico, limitaciones, alergias, medicamentos,
    objetivo_principal, meta_peso, meta_grasa,
    enfoque, horario_preferido, comidas_diarias, suplementacion, alimentos_excluidos,
    panelIA, metodologiaActiva, progreso, rutinas, entrenamientoCasa, videoCorreccion
) VALUES (
    'sergiohernandezlara07@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 1234
    'Sergio', 'Hernández', 30, 'masculino', 'SH',
    75.0, 175.0, 24.5, 15.0, 45.0, 60.0, 1800,
    85.0, 100.0, 35.0, 55.0, 38.0, 28.0,
    'intermedio', 'moderado', 'gimnasio', 3, 'hipertrofia', 4,
    'Sin antecedentes relevantes', '[]', 'Ninguna conocida', 'Ninguno',
    'Ganar masa muscular', 80.0, 12.0,
    'equilibrado', 'mañana', 4, 'Proteína en polvo', 'Ninguno',
    '{"estadoMetabolico": "Bueno", "recuperacionNeural": "75%", "eficienciaAdaptativa": "+5%", "proximaRevision": "7 días", "alertas": []}',
    NULL,
    '{"peso": [], "medidas": [], "fotos": []}',
    '{"rutinasGuardadas": [], "favoritas": []}',
    '{"equipamiento": "basico", "espacio": "medio", "preferencias": {}}',
    '{"analisisCompletados": 0, "mejoras": []}'
) ON CONFLICT (email) DO NOTHING;

-- =====================================================
-- VERIFICACIÓN DE DATOS
-- =====================================================
-- Mostrar el usuario creado
SELECT 
    id, email, nombre, apellido, edad, sexo, peso, altura, nivel, 
    metodologia_preferida, objetivo_principal
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- Mostrar estructura de tablas
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name IN ('users', 'active_methodologies', 'user_routines', 'routine_exercises')
ORDER BY table_name, ordinal_position;

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at automáticamente
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_active_methodologies_updated_at BEFORE UPDATE ON active_methodologies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DATOS DE EJEMPLO PARA TESTING
-- =====================================================

-- Ejemplo de metodología activa generada por IA
INSERT INTO active_methodologies (
    user_id, methodology_name, methodology_data, fecha_inicio, fecha_fin,
    generada_por_ia, modo_ia, respuesta_completa
) 
SELECT 
    u.id, 
    'Hipertrofia IA', 
    '{"dias": [
        {"dia": 1, "fecha": "2025-08-15", "nombre_sesion": "Empuje Superior", "ejercicios": [
            {"nombre": "Press Banca", "series": 4, "repeticiones": "8-12"},
            {"nombre": "Press Inclinado", "series": 3, "repeticiones": "10-15"},
            {"nombre": "Elevaciones Laterales", "series": 3, "repeticiones": "12-15"}
        ]},
        {"dia": 2, "fecha": "2025-08-16", "nombre_sesion": "Tirón Superior", "ejercicios": [
            {"nombre": "Dominadas", "series": 4, "repeticiones": "8-12"},
            {"nombre": "Remo con Barra", "series": 3, "repeticiones": "8-12"},
            {"nombre": "Curl Bíceps", "series": 3, "repeticiones": "10-15"}
        ]}
    ]}',
    '2025-08-15',
    '2025-08-22',
    true,
    'automatico',
    '{"success": true, "modo": "automatico", "metodologia": "hipertrofia", "respuestaIA": {"estadoMetabolico": "Óptimo", "recuperacionNeural": "85%"}}'
FROM users u 
WHERE u.email = 'sergiohernandezlara07@gmail.com'
ON CONFLICT DO NOTHING;

COMMIT;

-- =====================================================
-- MENSAJE FINAL
-- =====================================================
SELECT 'Base de datos MindFit configurada correctamente!' as mensaje;
SELECT 'Usuario de prueba: sergiohernandezlara07@gmail.com / 1234' as credenciales;
SELECT COUNT(*) as total_usuarios FROM users;
SELECT COUNT(*) as total_metodologias FROM active_methodologies;
