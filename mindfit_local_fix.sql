-- =====================================================
-- FIX ESPECÍFICO PARA BASE DE DATOS LOCAL
-- Evita el error de columna "objetivo" que no existe
-- =====================================================

-- =====================================================
-- 1. AÑADIR CAMPOS JSONB NECESARIOS (si no existen)
-- =====================================================
DO $$ 
BEGIN
    -- Campos JSONB necesarios para el contexto UserContext
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='panelia') THEN
        ALTER TABLE users ADD COLUMN panelIA JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo panelIA';
    ELSE
        RAISE NOTICE 'Campo panelIA ya existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologiaactiva') THEN
        ALTER TABLE users ADD COLUMN metodologiaActiva JSONB DEFAULT NULL;
        RAISE NOTICE 'Añadido campo metodologiaActiva';
    ELSE
        RAISE NOTICE 'Campo metodologiaActiva ya existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='progreso') THEN
        ALTER TABLE users ADD COLUMN progreso JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo progreso';
    ELSE
        RAISE NOTICE 'Campo progreso ya existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='rutinas') THEN
        ALTER TABLE users ADD COLUMN rutinas JSONB DEFAULT '{}';
        RAISE NOTICE 'Añadido campo rutinas';
    ELSE
        RAISE NOTICE 'Campo rutinas ya existe';
    END IF;
    
    -- Campos adicionales para IA
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='años_entrenando') THEN
        ALTER TABLE users ADD COLUMN años_entrenando INTEGER;
        RAISE NOTICE 'Añadido campo años_entrenando';
    ELSE
        RAISE NOTICE 'Campo años_entrenando ya existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='metodologia_preferida') THEN
        ALTER TABLE users ADD COLUMN metodologia_preferida VARCHAR(100);
        RAISE NOTICE 'Añadido campo metodologia_preferida';
    ELSE
        RAISE NOTICE 'Campo metodologia_preferida ya existe';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='objetivo_principal') THEN
        ALTER TABLE users ADD COLUMN objetivo_principal VARCHAR(200);
        RAISE NOTICE 'Añadido campo objetivo_principal';
    ELSE
        RAISE NOTICE 'Campo objetivo_principal ya existe';
    END IF;
    
END $$;

-- =====================================================
-- 2. ACTUALIZAR USUARIO SIN REFERENCIAR COLUMNA "objetivo"
-- =====================================================
UPDATE users SET 
    panelIA = COALESCE(panelIA, '{"estadoMetabolico": "Bueno", "recuperacionNeural": "75%", "eficienciaAdaptativa": "+5%", "proximaRevision": "7 días", "alertas": []}'),
    progreso = COALESCE(progreso, '{"peso": [], "medidas": [], "fotos": []}'),
    rutinas = COALESCE(rutinas, '{"rutinasGuardadas": [], "favoritas": []}'),
    años_entrenando = COALESCE(años_entrenando, 2),
    metodologia_preferida = COALESCE(metodologia_preferida, 'hipertrofia'),
    objetivo_principal = COALESCE(objetivo_principal, 'Ganar masa muscular')
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- 3. VERIFICAR CONFIGURACIÓN
-- =====================================================
SELECT 
    '✅ Usuario configurado para IA local' as mensaje,
    id, email, nombre, apellido, edad, sexo, peso, altura,
    años_entrenando, metodologia_preferida, objetivo_principal,
    CASE WHEN panelIA IS NOT NULL THEN '✅ Configurado' ELSE '❌ Falta' END as panelIA_status,
    CASE WHEN metodologiaActiva IS NOT NULL THEN '✅ Activa' ELSE 'ℹ️ Sin metodología (normal)' END as metodologia_status
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- 4. VERIFICAR CAMPOS PARA IA (9 parámetros)
-- =====================================================
SELECT 
    'Verificación de 9 parámetros para IA:' as info,
    CASE WHEN id IS NOT NULL THEN '✅ userId' ELSE '❌ userId' END as param1,
    CASE WHEN edad IS NOT NULL THEN '✅ age' ELSE '❌ age' END as param2,
    CASE WHEN sexo IS NOT NULL THEN '✅ sex' ELSE '❌ sex' END as param3,
    CASE WHEN altura IS NOT NULL THEN '✅ heightCm' ELSE '❌ heightCm' END as param4,
    CASE WHEN peso IS NOT NULL THEN '✅ weightKg' ELSE '❌ weightKg' END as param5,
    CASE WHEN nivel_actividad IS NOT NULL THEN '✅ level' ELSE '❌ level' END as param6,
    CASE WHEN años_entrenando IS NOT NULL THEN '✅ experienceYears' ELSE '❌ experienceYears' END as param7,
    CASE WHEN metodologia_preferida IS NOT NULL THEN '✅ methodology' ELSE '❌ methodology' END as param8,
    CASE WHEN objetivo_principal IS NOT NULL THEN '✅ goals' ELSE '❌ goals' END as param9
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- 5. MOSTRAR ESTRUCTURA ACTUAL DE LA TABLA
-- =====================================================
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND column_name IN ('panelia', 'metodologiaactiva', 'progreso', 'rutinas', 'años_entrenando', 'metodologia_preferida', 'objetivo_principal')
ORDER BY column_name;

-- =====================================================
-- 6. INSTRUCCIONES FINALES
-- =====================================================
SELECT 
    'PRÓXIMOS PASOS:' as titulo,
    '1. Inicia la aplicación en local' as paso1,
    '2. Inicia sesión con: sergiohernandezlara07@gmail.com / 1234' as paso2,
    '3. Ve a Metodologías y pulsa "Activar IA"' as paso3,
    '4. La IA analizará los 9 parámetros de tu perfil' as paso4,
    '5. Ve a Rutinas para ver los ejercicios generados' as paso5;

COMMIT;
