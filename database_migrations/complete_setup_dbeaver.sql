-- =====================================================
-- SETUP COMPLETO PARA DBEAVER - MINDFIT
-- Incluye tabla users + metodologías
-- =====================================================

-- TABLA USERS (requerida para login)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    edad INTEGER,
    sexo VARCHAR(20),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    imc DECIMAL(5,2),
    nivel_actividad VARCHAR(50),
    objetivo VARCHAR(100),
    limitaciones JSONB DEFAULT '{}',
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TABLA 1: Metodologías seleccionadas por usuario
CREATE TABLE IF NOT EXISTS user_selected_methodologies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    methodology_name VARCHAR(100) NOT NULL,
    methodology_description TEXT,
    methodology_icon VARCHAR(50),
    methodology_version VARCHAR(20) DEFAULT 'adapted',
    selection_mode VARCHAR(20) NOT NULL,
    program_duration VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL,
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    progreso_porcentaje INTEGER DEFAULT 0,
    methodology_data JSONB DEFAULT '{}',
    ai_recommendation_data JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP
);

-- TABLA 2: Progreso semanal de metodologías
CREATE TABLE IF NOT EXISTS methodology_weekly_progress (
    id SERIAL PRIMARY KEY,
    methodology_id INTEGER NOT NULL,
    semana_numero INTEGER NOT NULL,
    fecha_inicio_semana DATE NOT NULL,
    fecha_fin_semana DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'pendiente',
    entrenamientos_completados INTEGER DEFAULT 0,
    entrenamientos_totales INTEGER NOT NULL,
    porcentaje_completado INTEGER DEFAULT 0,
    tiempo_total_minutos INTEGER DEFAULT 0,
    peso_promedio_usado DECIMAL(5,2),
    repeticiones_totales INTEGER DEFAULT 0,
    dificultad_percibida INTEGER,
    energia_nivel INTEGER,
    motivacion_nivel INTEGER,
    notas_semana TEXT,
    logros_destacados TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- TABLA 3: Sesiones de entrenamiento de metodologías
CREATE TABLE IF NOT EXISTS methodology_training_sessions (
    id SERIAL PRIMARY KEY,
    methodology_id INTEGER NOT NULL,
    week_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inicio TIME,
    hora_fin TIME,
    duracion_minutos INTEGER NOT NULL,
    ejercicios_completados INTEGER NOT NULL,
    ejercicios_totales INTEGER NOT NULL,
    peso_usado DECIMAL(5,2),
    repeticiones_totales INTEGER DEFAULT 0,
    series_totales INTEGER DEFAULT 0,
    dificultad_percibida INTEGER,
    energia_antes INTEGER,
    energia_despues INTEGER,
    satisfaccion INTEGER,
    calorias_estimadas INTEGER,
    frecuencia_cardiaca_promedio INTEGER,
    notas_sesion TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ÍNDICES para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_methodologies_user ON user_selected_methodologies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_methodologies_estado ON user_selected_methodologies(estado);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_methodology ON methodology_weekly_progress(methodology_id);
CREATE INDEX IF NOT EXISTS idx_methodology_sessions_user ON methodology_training_sessions(user_id);

-- INSERTAR USUARIO DE PRUEBA (password: 1234)
-- Nota: El hash corresponde a la contraseña '1234' con bcrypt
INSERT INTO users (
    email, password, nombre, apellido, edad, sexo, 
    peso, altura, nivel_actividad, objetivo
) VALUES (
    'sergiohernandezlara07@gmail.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 1234
    'Sergio',
    'Hernández',
    30,
    'masculino',
    75.0,
    175.0,
    'intermedio',
    'Ganar músculo'
) ON CONFLICT (email) DO NOTHING;

-- VERIFICAR que las tablas se crearon correctamente
SELECT 'Setup completo - Tablas creadas correctamente' as resultado;

-- Ver las tablas creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('users', 'user_selected_methodologies', 'methodology_weekly_progress', 'methodology_training_sessions')
ORDER BY table_name;

-- Verificar usuario creado
SELECT id, email, nombre, apellido FROM users WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- SETUP COMPLETADO - LISTO PARA LOGIN
-- =====================================================
