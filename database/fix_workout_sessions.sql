-- Script para arreglar la tabla workout_sessions
-- Ejecutar en DBeaver si hay problemas

-- Eliminar tabla si existe con estructura incorrecta
DROP TABLE IF EXISTS workout_sessions;

-- Crear tabla con estructura correcta
CREATE TABLE workout_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
    plan_json JSONB NOT NULL,
    duration_sec INTEGER DEFAULT 0,
    exercises_done INTEGER DEFAULT 0,
    total_exercises INTEGER DEFAULT 0,
    series_completed JSONB,
    started_at TIMESTAMP NULL,
    finished_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Crear índice
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_fecha
    ON workout_sessions (user_id, fecha_sesion);

-- Verificar que se creó correctamente
SELECT 'Tabla workout_sessions creada correctamente' as resultado;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'workout_sessions' 
ORDER BY ordinal_position;
