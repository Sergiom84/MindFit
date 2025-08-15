-- =====================================================
-- ACTUALIZACIÓN INCREMENTAL MINDFIT - SOLO LO QUE FALTA
-- NO BORRA NADA, SOLO AÑADE CAMPOS Y TABLAS NECESARIAS
-- =====================================================

-- =====================================================
-- 1. AÑADIR CAMPOS JSONB A TABLA USERS (si no existen)
-- =====================================================
DO $$ 
BEGIN
    -- Campos JSONB necesarios para el contexto UserContext
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='panelia') THEN
        ALTER TABLE users ADD COLUMN panelIA JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo panelIA';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologiaactiva') THEN
        ALTER TABLE users ADD COLUMN metodologiaActiva JSONB DEFAULT NULL;
        RAISE NOTICE 'Añadido campo metodologiaActiva';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='progreso') THEN
        ALTER TABLE users ADD COLUMN progreso JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo progreso';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rutinas') THEN
        ALTER TABLE users ADD COLUMN rutinas JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo rutinas';
    END IF;
    
    -- Campos adicionales que podrían faltar para la IA
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='años_entrenando') THEN
        ALTER TABLE users ADD COLUMN años_entrenando INTEGER;
        RAISE NOTICE 'Añadido campo años_entrenando';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologia_preferida') THEN
        ALTER TABLE users ADD COLUMN metodologia_preferida VARCHAR(100);
        RAISE NOTICE 'Añadido campo metodologia_preferida';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='objetivo_principal') THEN
        ALTER TABLE users ADD COLUMN objetivo_principal VARCHAR(200);
        RAISE NOTICE 'Añadido campo objetivo_principal';
    END IF;
    
    RAISE NOTICE 'Verificación de campos completada';
END $$;

-- =====================================================
-- 2. ACTUALIZAR USUARIO EXISTENTE CON DATOS PARA IA
-- =====================================================
-- Actualizar con verificación segura de columnas
DO $$
BEGIN
    -- Verificar si existe la columna 'objetivo' antes de usarla
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='objetivo') THEN
        -- Si existe 'objetivo', usarla como fallback
        UPDATE users SET
            panelIA = COALESCE(panelIA, '{"estadoMetabolico": "Bueno", "recuperacionNeural": "75%", "eficienciaAdaptativa": "+5%", "proximaRevision": "7 días", "alertas": []}'),
            progreso = COALESCE(progreso, '{"peso": [], "medidas": [], "fotos": []}'),
            rutinas = COALESCE(rutinas, '{"rutinasGuardadas": [], "favoritas": []}'),
            años_entrenando = COALESCE(años_entrenando, 2),
            metodologia_preferida = COALESCE(metodologia_preferida, 'hipertrofia'),
            objetivo_principal = COALESCE(objetivo_principal, objetivo, 'Ganar masa muscular')
        WHERE email = 'sergiohernandezlara07@gmail.com';
    ELSE
        -- Si no existe 'objetivo', usar solo valores por defecto
        UPDATE users SET
            panelIA = COALESCE(panelIA, '{"estadoMetabolico": "Bueno", "recuperacionNeural": "75%", "eficienciaAdaptativa": "+5%", "proximaRevision": "7 días", "alertas": []}'),
            progreso = COALESCE(progreso, '{"peso": [], "medidas": [], "fotos": []}'),
            rutinas = COALESCE(rutinas, '{"rutinasGuardadas": [], "favoritas": []}'),
            años_entrenando = COALESCE(años_entrenando, 2),
            metodologia_preferida = COALESCE(metodologia_preferida, 'hipertrofia'),
            objetivo_principal = COALESCE(objetivo_principal, 'Ganar masa muscular')
        WHERE email = 'sergiohernandezlara07@gmail.com';
    END IF;

    RAISE NOTICE 'Usuario actualizado correctamente';
END $$;

-- =====================================================
-- 3. VERIFICAR QUE EL USUARIO TIENE TODOS LOS DATOS
-- =====================================================
SELECT 
    'Usuario actualizado correctamente para IA' as mensaje,
    id, email, nombre, apellido, edad, sexo, peso, altura,
    años_entrenando, metodologia_preferida, objetivo_principal,
    CASE WHEN panelIA IS NOT NULL THEN '✅ Configurado' ELSE '❌ Falta' END as panelIA_status,
    CASE WHEN metodologiaActiva IS NOT NULL THEN '✅ Activa' ELSE 'ℹ️ Sin metodología (normal)' END as metodologia_status
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- 4. MOSTRAR CAMPOS DISPONIBLES PARA IA
-- =====================================================
SELECT 
    'Campos disponibles para IA:' as info,
    CASE WHEN edad IS NOT NULL THEN '✅' ELSE '❌' END as age,
    CASE WHEN sexo IS NOT NULL THEN '✅' ELSE '❌' END as sex,
    CASE WHEN altura IS NOT NULL THEN '✅' ELSE '❌' END as heightCm,
    CASE WHEN peso IS NOT NULL THEN '✅' ELSE '❌' END as weightKg,
    CASE WHEN nivel IS NOT NULL THEN '✅' ELSE '❌' END as level,
    CASE WHEN años_entrenando IS NOT NULL THEN '✅' ELSE '❌' END as experienceYears,
    CASE WHEN metodologia_preferida IS NOT NULL THEN '✅' ELSE '❌' END as methodology,
    CASE WHEN objetivo_principal IS NOT NULL THEN '✅' ELSE '❌' END as goals
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- 5. INSTRUCCIONES FINALES
-- =====================================================
SELECT 
    'INSTRUCCIONES:' as titulo,
    '1. Inicia sesión con: sergiohernandezlara07@gmail.com / 1234' as paso1,
    '2. Ve a Metodologías y pulsa "Activar IA"' as paso2,
    '3. Los datos se guardarán en el campo metodologiaActiva' as paso3,
    '4. Ve a Rutinas para ver los ejercicios generados' as paso4;

COMMIT;
