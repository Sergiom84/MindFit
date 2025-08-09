-- =====================================================
-- FUNCIONES Y TRIGGERS PARA METODOLOGÍAS - MINDFIT
-- Ejecutar DESPUÉS del script principal
-- =====================================================

-- 1. FUNCIÓN para actualizar progreso de metodología automáticamente
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

-- 2. TRIGGER para actualizar progreso automáticamente
DROP TRIGGER IF EXISTS trigger_update_methodology_progress ON methodology_training_sessions;
CREATE TRIGGER trigger_update_methodology_progress
    AFTER INSERT OR UPDATE ON methodology_training_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_methodology_progress();

-- 3. FUNCIÓN para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_methodology_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGERS para updated_at automático
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

-- Verificar funciones creadas
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name LIKE '%methodology%';

-- Verificar triggers creados
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers 
WHERE trigger_name LIKE '%methodology%';

-- =====================================================
-- FUNCIONES Y TRIGGERS COMPLETADOS
-- =====================================================
