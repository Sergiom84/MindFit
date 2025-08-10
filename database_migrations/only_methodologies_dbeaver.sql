-- =====================================================
-- SOLO METODOLOGÍAS PARA DBEAVER - MINDFIT
-- Para usar cuando la tabla users ya existe
-- =====================================================

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
CREATE INDEX IF NOT EXISTS idx_user_methodologies_user ON user_selected_methodologies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_methodologies_estado ON user_selected_methodologies(estado);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_methodology ON methodology_weekly_progress(methodology_id);
CREATE INDEX IF NOT EXISTS idx_methodology_sessions_user ON methodology_training_sessions(user_id);

-- VERIFICAR que las tablas se crearon correctamente
SELECT 'Tablas de metodologías creadas correctamente' as resultado;

-- Ver las tablas de metodologías creadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('user_selected_methodologies', 'methodology_weekly_progress', 'methodology_training_sessions')
ORDER BY table_name;

-- =====================================================
-- METODOLOGÍAS LISTAS - SIN TOCAR TABLA USERS
-- =====================================================
