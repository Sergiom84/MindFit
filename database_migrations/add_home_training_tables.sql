-- Migración: Agregar tablas para entrenamientos en casa
-- Fecha: 2025-08-09

-- Tabla para programas de entrenamiento en casa
CREATE TABLE IF NOT EXISTS home_training_programs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    equipamiento VARCHAR(50) NOT NULL, -- 'minimal', 'basic', 'advanced'
    tipo_entrenamiento VARCHAR(50) NOT NULL, -- 'functional', 'hiit', 'strength'
    duracion_total VARCHAR(20), -- '30-45 min'
    frecuencia VARCHAR(30), -- '4-5 días/semana'
    enfoque VARCHAR(100), -- 'Fuerza funcional y movilidad'
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pausado')),
    progreso_porcentaje INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para ejercicios de un programa
CREATE TABLE IF NOT EXISTS home_training_exercises (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    series INTEGER NOT NULL,
    repeticiones VARCHAR(20), -- '12-15' o NULL si es por tiempo
    duracion INTEGER, -- segundos, NULL si es por repeticiones
    descanso INTEGER NOT NULL, -- segundos
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('repeticiones', 'tiempo')),
    consejos JSONB DEFAULT '[]'::jsonb,
    orden INTEGER NOT NULL, -- orden en el programa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para días de entrenamiento (calendario semanal)
CREATE TABLE IF NOT EXISTS home_training_days (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL, -- 'lunes', 'martes', etc.
    fecha DATE NOT NULL,
    dia_numero INTEGER NOT NULL, -- 1-7
    es_descanso BOOLEAN DEFAULT FALSE,
    ejercicios_asignados JSONB DEFAULT '[]'::jsonb, -- IDs de ejercicios para este día
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'perdido')),
    ejercicios_completados INTEGER DEFAULT 0,
    tiempo_total_minutos INTEGER DEFAULT 0,
    fecha_completado TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para registrar sesiones de entrenamiento completadas
CREATE TABLE IF NOT EXISTS home_training_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    day_id INTEGER NOT NULL REFERENCES home_training_days(id) ON DELETE CASCADE,
    fecha_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_minutos INTEGER NOT NULL,
    ejercicios_completados INTEGER NOT NULL,
    ejercicios_totales INTEGER NOT NULL,
    calorias_estimadas INTEGER,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_home_programs_user ON home_training_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_home_programs_estado ON home_training_programs(estado);
CREATE INDEX IF NOT EXISTS idx_home_exercises_program ON home_training_exercises(program_id);
CREATE INDEX IF NOT EXISTS idx_home_days_program ON home_training_days(program_id);
CREATE INDEX IF NOT EXISTS idx_home_days_fecha ON home_training_days(fecha);
CREATE INDEX IF NOT EXISTS idx_home_sessions_user ON home_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_sessions_program ON home_training_sessions(program_id);

-- Función para actualizar progreso del programa
CREATE OR REPLACE FUNCTION update_program_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar progreso del programa cuando se completa un día
    IF NEW.estado = 'completado' AND OLD.estado != 'completado' THEN
        UPDATE home_training_programs 
        SET progreso_porcentaje = (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE estado = 'completado')::float / COUNT(*)::float) * 100
            )
            FROM home_training_days 
            WHERE program_id = NEW.program_id AND NOT es_descanso
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.program_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar progreso automáticamente
CREATE TRIGGER trigger_update_program_progress
    AFTER UPDATE ON home_training_days
    FOR EACH ROW
    EXECUTE FUNCTION update_program_progress();
