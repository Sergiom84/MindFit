-- =====================================================
-- SCRIPT COMPLETO PARA ENTRENAMIENTOS EN CASA - MINDFIT
-- Para ejecutar en DBeaver o cualquier cliente PostgreSQL
-- =====================================================

-- 1. TABLA PRINCIPAL: Programas de entrenamiento en casa
CREATE TABLE IF NOT EXISTS home_training_programs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    equipamiento VARCHAR(50) NOT NULL CHECK (equipamiento IN ('minimal', 'basic', 'advanced')),
    tipo_entrenamiento VARCHAR(50) NOT NULL CHECK (tipo_entrenamiento IN ('functional', 'hiit', 'strength')),
    duracion_total VARCHAR(20) DEFAULT '30-45 min',
    frecuencia VARCHAR(30) DEFAULT '4-5 días/semana',
    enfoque VARCHAR(100) DEFAULT 'Fuerza funcional y movilidad',
    fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_fin DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
    estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pausado', 'cancelado')),
    progreso_porcentaje INTEGER DEFAULT 0 CHECK (progreso_porcentaje >= 0 AND progreso_porcentaje <= 100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA: Ejercicios de cada programa
CREATE TABLE IF NOT EXISTS home_training_exercises (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    nombre VARCHAR(200) NOT NULL,
    descripcion TEXT,
    series INTEGER NOT NULL DEFAULT 3 CHECK (series > 0),
    repeticiones VARCHAR(20), -- '12-15' o NULL si es por tiempo
    duracion INTEGER, -- segundos, NULL si es por repeticiones
    descanso INTEGER NOT NULL DEFAULT 60 CHECK (descanso >= 0), -- segundos
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('repeticiones', 'tiempo')),
    consejos JSONB DEFAULT '[]'::jsonb,
    orden INTEGER NOT NULL CHECK (orden > 0), -- orden en el programa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TABLA: Días de entrenamiento (calendario semanal)
CREATE TABLE IF NOT EXISTS home_training_days (
    id SERIAL PRIMARY KEY,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    dia_semana VARCHAR(20) NOT NULL CHECK (dia_semana IN ('lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo')),
    fecha DATE NOT NULL,
    dia_numero INTEGER NOT NULL CHECK (dia_numero >= 1 AND dia_numero <= 7), -- 1=lunes, 7=domingo
    es_descanso BOOLEAN DEFAULT FALSE,
    ejercicios_asignados JSONB DEFAULT '[]'::jsonb, -- IDs de ejercicios para este día
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completado', 'perdido')),
    ejercicios_completados INTEGER DEFAULT 0 CHECK (ejercicios_completados >= 0),
    tiempo_total_minutos INTEGER DEFAULT 0 CHECK (tiempo_total_minutos >= 0),
    fecha_completado TIMESTAMP,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. TABLA: Sesiones de entrenamiento completadas (para estadísticas)
CREATE TABLE IF NOT EXISTS home_training_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
    day_id INTEGER NOT NULL REFERENCES home_training_days(id) ON DELETE CASCADE,
    fecha_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0),
    ejercicios_completados INTEGER NOT NULL CHECK (ejercicios_completados >= 0),
    ejercicios_totales INTEGER NOT NULL CHECK (ejercicios_totales > 0),
    calorias_estimadas INTEGER CHECK (calorias_estimadas >= 0),
    dificultad_percibida INTEGER CHECK (dificultad_percibida >= 1 AND dificultad_percibida <= 10), -- 1=muy fácil, 10=muy difícil
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ÍNDICES para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_home_programs_user ON home_training_programs(user_id);
CREATE INDEX IF NOT EXISTS idx_home_programs_estado ON home_training_programs(estado);
CREATE INDEX IF NOT EXISTS idx_home_programs_fecha ON home_training_programs(fecha_inicio, fecha_fin);

CREATE INDEX IF NOT EXISTS idx_home_exercises_program ON home_training_exercises(program_id);
CREATE INDEX IF NOT EXISTS idx_home_exercises_orden ON home_training_exercises(program_id, orden);

CREATE INDEX IF NOT EXISTS idx_home_days_program ON home_training_days(program_id);
CREATE INDEX IF NOT EXISTS idx_home_days_fecha ON home_training_days(fecha);
CREATE INDEX IF NOT EXISTS idx_home_days_estado ON home_training_days(estado);

CREATE INDEX IF NOT EXISTS idx_home_sessions_user ON home_training_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_home_sessions_program ON home_training_sessions(program_id);
CREATE INDEX IF NOT EXISTS idx_home_sessions_fecha ON home_training_sessions(fecha_sesion);

-- 6. FUNCIÓN para actualizar progreso del programa automáticamente
CREATE OR REPLACE FUNCTION update_home_program_progress()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar progreso del programa cuando se completa un día
    IF NEW.estado = 'completado' AND (OLD.estado IS NULL OR OLD.estado != 'completado') THEN
        UPDATE home_training_programs 
        SET progreso_porcentaje = (
            SELECT ROUND(
                (COUNT(*) FILTER (WHERE estado = 'completado')::float / 
                 NULLIF(COUNT(*) FILTER (WHERE NOT es_descanso), 0)::float) * 100
            )
            FROM home_training_days 
            WHERE program_id = NEW.program_id
        ),
        updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.program_id;
        
        -- Marcar programa como completado si todos los días están completados
        UPDATE home_training_programs 
        SET estado = 'completado',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.program_id 
        AND progreso_porcentaje = 100
        AND estado = 'activo';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. TRIGGER para actualizar progreso automáticamente
DROP TRIGGER IF EXISTS trigger_update_home_program_progress ON home_training_days;
CREATE TRIGGER trigger_update_home_program_progress
    AFTER UPDATE ON home_training_days
    FOR EACH ROW
    EXECUTE FUNCTION update_home_program_progress();

-- 8. FUNCIÓN para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. TRIGGERS para updated_at automático
DROP TRIGGER IF EXISTS trigger_home_programs_updated_at ON home_training_programs;
CREATE TRIGGER trigger_home_programs_updated_at
    BEFORE UPDATE ON home_training_programs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_home_days_updated_at ON home_training_days;
CREATE TRIGGER trigger_home_days_updated_at
    BEFORE UPDATE ON home_training_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 10. DATOS DE EJEMPLO (opcional - comentar si no se desea)
/*
-- Insertar programa de ejemplo para usuario ID 1
INSERT INTO home_training_programs (user_id, titulo, descripcion, equipamiento, tipo_entrenamiento) 
VALUES (1, 'HIIT Doméstico Intensivo', 'Entrenamiento de alta intensidad adaptado para casa', 'minimal', 'hiit');

-- Obtener el ID del programa recién creado
WITH new_program AS (
    SELECT id FROM home_training_programs WHERE user_id = 1 ORDER BY created_at DESC LIMIT 1
)
-- Insertar ejercicios de ejemplo
INSERT INTO home_training_exercises (program_id, nombre, descripcion, series, repeticiones, descanso, tipo, orden)
SELECT np.id, 'Burpees', 'Ejercicio completo de cuerpo', 3, '10-12', 60, 'repeticiones', 1 FROM new_program np
UNION ALL
SELECT np.id, 'Mountain Climbers', 'Cardio intenso', 3, '30', 45, 'tiempo', 2 FROM new_program np
UNION ALL
SELECT np.id, 'Jumping Jacks', 'Calentamiento dinámico', 3, '20', 30, 'repeticiones', 3 FROM new_program np;
*/

-- =====================================================
-- VERIFICACIÓN: Consultas para verificar la instalación
-- =====================================================

-- Verificar tablas creadas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name LIKE 'home_training%' 
ORDER BY table_name, ordinal_position;

-- Verificar índices creados
SELECT indexname, tablename 
FROM pg_indexes 
WHERE tablename LIKE 'home_training%' 
ORDER BY tablename, indexname;

-- Verificar funciones creadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%home%' OR routine_name LIKE '%update_updated_at%';

-- =====================================================
-- SCRIPT COMPLETADO EXITOSAMENTE
-- =====================================================
