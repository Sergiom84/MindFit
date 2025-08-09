-- =====================================================
-- SCRIPT SIMPLE PARA METODOLOGÍAS - MINDFIT
-- Para ejecutar en DBeaver - SIN ERRORES
-- =====================================================

-- 1. TABLA: Metodologías seleccionadas por usuario
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

-- 2. TABLA: Progreso semanal de metodologías
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

-- 3. TABLA: Sesiones de entrenamiento de metodologías
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

-- 4. ÍNDICES para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_user_methodologies_user ON user_selected_methodologies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_methodologies_estado ON user_selected_methodologies(estado);
CREATE INDEX IF NOT EXISTS idx_user_methodologies_fechas ON user_selected_methodologies(fecha_inicio, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_weekly_progress_methodology ON methodology_weekly_progress(methodology_id);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_semana ON methodology_weekly_progress(semana_numero);
CREATE INDEX IF NOT EXISTS idx_weekly_progress_estado ON methodology_weekly_progress(estado);

CREATE INDEX IF NOT EXISTS idx_methodology_sessions_user ON methodology_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_methodology_sessions_methodology ON methodology_training_sessions(methodology_id);
CREATE INDEX IF NOT EXISTS idx_methodology_sessions_fecha ON methodology_training_sessions(fecha_sesion);

-- 5. CONSTRAINTS adicionales (ejecutar después de crear tablas)
ALTER TABLE user_selected_methodologies 
ADD CONSTRAINT check_selection_mode 
CHECK (selection_mode IN ('automatic', 'manual'));

ALTER TABLE user_selected_methodologies 
ADD CONSTRAINT check_estado 
CHECK (estado IN ('activo', 'completado', 'pausado', 'cancelado'));

ALTER TABLE user_selected_methodologies 
ADD CONSTRAINT check_progreso_porcentaje 
CHECK (progreso_porcentaje >= 0 AND progreso_porcentaje <= 100);

ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT check_semana_numero 
CHECK (semana_numero > 0);

ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT check_estado_semana 
CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'perdida'));

ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT check_entrenamientos_completados 
CHECK (entrenamientos_completados >= 0);

ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT check_entrenamientos_totales 
CHECK (entrenamientos_totales > 0);

ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT check_porcentaje_completado 
CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100);

ALTER TABLE methodology_training_sessions 
ADD CONSTRAINT check_duracion_minutos 
CHECK (duracion_minutos > 0);

ALTER TABLE methodology_training_sessions 
ADD CONSTRAINT check_ejercicios_completados 
CHECK (ejercicios_completados >= 0);

ALTER TABLE methodology_training_sessions 
ADD CONSTRAINT check_ejercicios_totales 
CHECK (ejercicios_totales > 0);

-- 6. UNIQUE CONSTRAINTS
ALTER TABLE methodology_weekly_progress 
ADD CONSTRAINT unique_week_per_methodology 
UNIQUE (methodology_id, semana_numero);

-- =====================================================
-- CONSULTAS DE VERIFICACIÓN
-- =====================================================

-- Verificar tablas creadas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE '%methodology%' OR table_name LIKE 'user_selected%'
ORDER BY table_name, ordinal_position;

-- Verificar índices creados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename LIKE '%methodology%' OR tablename LIKE 'user_selected%'
ORDER BY tablename, indexname;

-- =====================================================
-- DATOS DE EJEMPLO (opcional)
-- =====================================================

-- Insertar metodología de ejemplo para usuario ID 1
-- INSERT INTO user_selected_methodologies (
--     user_id, methodology_name, methodology_description, methodology_icon,
--     methodology_version, selection_mode, program_duration, difficulty_level,
--     fecha_inicio, fecha_fin, methodology_data
-- ) VALUES (
--     1, 
--     'Heavy Duty', 
--     'Entrenamiento de alta intensidad con bajo volumen y máximo descanso',
--     'Dumbbell',
--     'adapted',
--     'manual',
--     '6-8 semanas',
--     'advanced',
--     CURRENT_DATE,
--     CURRENT_DATE + INTERVAL '8 weeks',
--     '{"frequency": "3-4 días/semana", "focus": "Fuerza máxima", "equipment": "Básico"}'
-- );

-- =====================================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =====================================================
