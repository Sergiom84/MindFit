-- =====================================================
-- SCRIPT PARA PERSISTENCIA DE METODOLOGÍAS - MINDFIT
-- Para ejecutar en DBeaver o cualquier cliente PostgreSQL
-- =====================================================

-- 1. TABLA: Metodologías seleccionadas por usuario
CREATE TABLE IF NOT EXISTS user_selected_methodologies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE (agregar cuando exista tabla users)
    methodology_name VARCHAR(100) NOT NULL,
    methodology_description TEXT,
    methodology_icon VARCHAR(50), -- nombre del icono de lucide-react
    methodology_version VARCHAR(20) DEFAULT 'adapted', -- 'adapted' o 'strict'
    selection_mode VARCHAR(20) NOT NULL CHECK (selection_mode IN ('automatic', 'manual')), -- IA o manual
    program_duration VARCHAR(50) NOT NULL, -- '4-6 semanas', '8-12 semanas', etc.
    difficulty_level VARCHAR(20) NOT NULL, -- 'beginner', 'intermediate', 'advanced'
    
    -- Fechas del programa
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL,
    
    -- Estado y progreso
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pausado', 'cancelado')),
    progreso_porcentaje INTEGER DEFAULT 0 CHECK (progreso_porcentaje >= 0 AND progreso_porcentaje <= 100),
    
    -- Datos adicionales de la metodología
    methodology_data JSONB DEFAULT '{}'::jsonb, -- datos específicos de la metodología
    ai_recommendation_data JSONB DEFAULT '{}'::jsonb, -- datos de la recomendación de IA si aplica
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    
    -- Constraint: solo una metodología activa por usuario (comentado por compatibilidad)
    -- CONSTRAINT unique_active_methodology_per_user
    --     EXCLUDE (user_id WITH =)
    --     WHERE (estado = 'activo')
);

-- 2. TABLA: Progreso semanal de metodologías
CREATE TABLE IF NOT EXISTS methodology_weekly_progress (
    id SERIAL PRIMARY KEY,
    methodology_id INTEGER NOT NULL REFERENCES user_selected_methodologies(id) ON DELETE CASCADE,
    semana_numero INTEGER NOT NULL CHECK (semana_numero > 0),
    fecha_inicio_semana DATE NOT NULL,
    fecha_fin_semana DATE NOT NULL,
    
    -- Estado de la semana
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'perdida')),
    
    -- Progreso de la semana
    entrenamientos_completados INTEGER DEFAULT 0 CHECK (entrenamientos_completados >= 0),
    entrenamientos_totales INTEGER NOT NULL CHECK (entrenamientos_totales > 0),
    porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
    
    -- Métricas de la semana
    tiempo_total_minutos INTEGER DEFAULT 0 CHECK (tiempo_total_minutos >= 0),
    peso_promedio_usado DECIMAL(5,2), -- kg
    repeticiones_totales INTEGER DEFAULT 0,
    
    -- Evaluación subjetiva
    dificultad_percibida INTEGER CHECK (dificultad_percibida >= 1 AND dificultad_percibida <= 10),
    energia_nivel INTEGER CHECK (energia_nivel >= 1 AND energia_nivel <= 10),
    motivacion_nivel INTEGER CHECK (motivacion_nivel >= 1 AND motivacion_nivel <= 10),
    
    -- Notas y observaciones
    notas_semana TEXT,
    logros_destacados TEXT,
    
    -- Metadatos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Constraint: una semana por número en cada metodología
    CONSTRAINT unique_week_per_methodology UNIQUE (methodology_id, semana_numero)
);

-- 3. TABLA: Sesiones de entrenamiento de metodologías
CREATE TABLE IF NOT EXISTS methodology_training_sessions (
    id SERIAL PRIMARY KEY,
    methodology_id INTEGER NOT NULL REFERENCES user_selected_methodologies(id) ON DELETE CASCADE,
    week_id INTEGER NOT NULL REFERENCES methodology_weekly_progress(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL, -- REFERENCES users(id) ON DELETE CASCADE (agregar cuando exista tabla users)
    
    -- Información de la sesión
    fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_inicio TIME,
    hora_fin TIME,
    duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0),
    
    -- Datos del entrenamiento
    ejercicios_completados INTEGER NOT NULL CHECK (ejercicios_completados >= 0),
    ejercicios_totales INTEGER NOT NULL CHECK (ejercicios_totales > 0),
    peso_usado DECIMAL(5,2), -- kg promedio usado en la sesión
    repeticiones_totales INTEGER DEFAULT 0,
    series_totales INTEGER DEFAULT 0,
    
    -- Evaluación de la sesión
    dificultad_percibida INTEGER CHECK (dificultad_percibida >= 1 AND dificultad_percibida <= 10),
    energia_antes INTEGER CHECK (energia_antes >= 1 AND energia_antes <= 10),
    energia_despues INTEGER CHECK (energia_despues >= 1 AND energia_despues <= 10),
    satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 10),
    
    -- Datos adicionales
    calorias_estimadas INTEGER CHECK (calorias_estimadas >= 0),
    frecuencia_cardiaca_promedio INTEGER CHECK (frecuencia_cardiaca_promedio > 0),
    notas_sesion TEXT,
    
    -- Metadatos
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

-- 5. FUNCIÓN para actualizar progreso de metodología automáticamente
CREATE OR REPLACE FUNCTION update_methodology_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar progreso de la semana cuando se completa una sesión
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE methodology_weekly_progress 
        SET porcentaje_completado = (
            SELECT ROUND(
                (COUNT(*)::float / entrenamientos_totales::float) * 100
            )
            FROM methodology_training_sessions mts
            WHERE mts.week_id = NEW.week_id
        ),
        tiempo_total_minutos = (
            SELECT COALESCE(SUM(duracion_minutos), 0)
            FROM methodology_training_sessions mts
            WHERE mts.week_id = NEW.week_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.week_id;
        
        -- Marcar semana como completada si se alcanza 100%
        UPDATE methodology_weekly_progress 
        SET estado = 'completada',
            completed_at = CURRENT_TIMESTAMP
        WHERE id = NEW.week_id 
        AND porcentaje_completado = 100
        AND estado != 'completada';
        
        -- Actualizar progreso general de la metodología
        UPDATE user_selected_methodologies 
        SET progreso_porcentaje = (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE estado = 'completada')::float / COUNT(*)::float) * 100
            )
            FROM methodology_weekly_progress 
            WHERE methodology_id = (
                SELECT methodology_id FROM methodology_weekly_progress WHERE id = NEW.week_id
            )
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = (
            SELECT methodology_id FROM methodology_weekly_progress WHERE id = NEW.week_id
        );
        
        -- Marcar metodología como completada si todas las semanas están completadas
        UPDATE user_selected_methodologies 
        SET estado = 'completado',
            completed_at = CURRENT_TIMESTAMP
        WHERE progreso_porcentaje = 100
        AND estado = 'activo';
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 6. TRIGGER para actualizar progreso automáticamente
DROP TRIGGER IF EXISTS trigger_update_methodology_progress ON methodology_training_sessions;
CREATE TRIGGER trigger_update_methodology_progress
    AFTER INSERT OR UPDATE ON methodology_training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_methodology_progress();

-- 7. FUNCIÓN para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_methodology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGERS para updated_at automático
DROP TRIGGER IF EXISTS trigger_methodology_updated_at ON user_selected_methodologies;
CREATE TRIGGER trigger_methodology_updated_at
    BEFORE UPDATE ON user_selected_methodologies
    FOR EACH ROW
    EXECUTE FUNCTION update_methodology_updated_at();

DROP TRIGGER IF EXISTS trigger_weekly_progress_updated_at ON methodology_weekly_progress;
CREATE TRIGGER trigger_weekly_progress_updated_at
    BEFORE UPDATE ON methodology_weekly_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_methodology_updated_at();

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

-- Verificar funciones y triggers
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%methodology%';

-- =====================================================
-- DATOS DE EJEMPLO (opcional - descomentar si se desea)
-- =====================================================

/*
-- Insertar metodología de ejemplo para usuario ID 1
INSERT INTO user_selected_methodologies (
    user_id, methodology_name, methodology_description, methodology_icon,
    methodology_version, selection_mode, program_duration, difficulty_level,
    fecha_inicio, fecha_fin, methodology_data
) VALUES (
    1,
    'Heavy Duty',
    'Entrenamiento de alta intensidad con bajo volumen y máximo descanso',
    'Dumbbell',
    'adapted',
    'manual',
    '6-8 semanas',
    'advanced',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '8 weeks',
    '{"frequency": "3-4 días/semana", "focus": "Fuerza máxima", "equipment": "Básico"}'::jsonb
);

-- Obtener el ID de la metodología recién creada
WITH new_methodology AS (
    SELECT id FROM user_selected_methodologies WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1
)
-- Insertar semanas de ejemplo (8 semanas)
INSERT INTO methodology_weekly_progress (methodology_id, semana_numero, fecha_inicio_semana, fecha_fin_semana, entrenamientos_totales)
SELECT nm.id, generate_series(1, 8),
       CURRENT_DATE + (generate_series(0, 7) * INTERVAL '7 days'),
       CURRENT_DATE + (generate_series(0, 7) * INTERVAL '7 days') + INTERVAL '6 days',
       3
FROM new_methodology nm;
*/

-- =====================================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =====================================================
