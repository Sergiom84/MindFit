-- =====================================================
-- SCRIPT DE VERIFICACIÓN DE ESQUEMA DE BASE DE DATOS
-- Ejecutar en DBeaver para confirmar que solo existe 'users'
-- =====================================================

-- 1. VERIFICAR QUE TABLAS EXISTEN
SELECT '=== VERIFICACIÓN DE TABLAS EXISTENTES ===' as seccion;

SELECT 
    table_name,
    table_type,
    CASE 
        WHEN table_name = 'users' THEN '✅ CORRECTO - Tabla principal'
        WHEN table_name = 'user_profiles' THEN '❌ ERROR - Esta tabla NO debería existir'
        ELSE '📋 Otra tabla'
    END as estado
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND (table_name LIKE '%user%' OR table_name LIKE '%profile%')
ORDER BY table_name;

-- 2. VERIFICAR ESTRUCTURA DE LA TABLA USERS
SELECT '=== ESTRUCTURA DE LA TABLA USERS ===' as seccion;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN column_name IN ('id', 'nombre', 'apellido', 'email', 'password') THEN '🔑 Campo básico'
        WHEN column_name IN ('edad', 'peso', 'altura', 'sexo', 'imc') THEN '👤 Datos físicos'
        WHEN column_name IN ('nivel_actividad', 'experiencia', 'años_entrenando') THEN '🏋️ Datos de entrenamiento'
        WHEN column_name IN ('objetivo_principal', 'metodologia_preferida') THEN '🎯 Objetivos'
        WHEN column_name LIKE '%corporal%' OR column_name IN ('cintura', 'pecho', 'brazos', 'muslos') THEN '📏 Medidas corporales'
        WHEN column_name IN ('limitaciones', 'alergias', 'medicamentos', 'historial_medico') THEN '🏥 Datos médicos'
        ELSE '📋 Otro campo'
    END as categoria
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. VERIFICAR DATOS DE USUARIO EXISTENTES
SELECT '=== DATOS DE USUARIOS EXISTENTES ===' as seccion;

SELECT 
    COUNT(*) as total_usuarios,
    COUNT(CASE WHEN edad IS NOT NULL THEN 1 END) as con_edad,
    COUNT(CASE WHEN peso IS NOT NULL THEN 1 END) as con_peso,
    COUNT(CASE WHEN altura IS NOT NULL THEN 1 END) as con_altura,
    COUNT(CASE WHEN nivel_actividad IS NOT NULL THEN 1 END) as con_nivel_actividad,
    COUNT(CASE WHEN objetivo_principal IS NOT NULL THEN 1 END) as con_objetivo,
    ROUND(
        (COUNT(CASE WHEN edad IS NOT NULL AND peso IS NOT NULL AND altura IS NOT NULL THEN 1 END) * 100.0 / COUNT(*)), 2
    ) as porcentaje_perfil_completo
FROM users;

-- 4. MOSTRAR USUARIOS DE EJEMPLO (SIN CONTRASEÑAS)
SELECT '=== USUARIOS DE EJEMPLO ===' as seccion;

SELECT 
    id,
    nombre,
    apellido,
    email,
    edad,
    sexo,
    peso,
    altura,
    imc,
    nivel_actividad,
    objetivo_principal,
    CASE 
        WHEN edad IS NOT NULL AND peso IS NOT NULL AND altura IS NOT NULL THEN '✅ Perfil completo'
        ELSE '⚠️ Perfil incompleto'
    END as estado_perfil
FROM users
ORDER BY id
LIMIT 5;

-- 5. VERIFICAR FOREIGN KEYS Y REFERENCIAS
SELECT '=== VERIFICACIÓN DE FOREIGN KEYS ===' as seccion;

SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    CASE 
        WHEN ccu.table_name = 'users' THEN '✅ Referencia correcta a users'
        WHEN ccu.table_name = 'user_profiles' THEN '❌ ERROR - Referencia a user_profiles'
        ELSE '📋 Otra referencia'
    END as estado
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND (ccu.table_name LIKE '%user%' OR tc.table_name LIKE '%user%');

-- 6. VERIFICAR ÍNDICES EN TABLA USERS
SELECT '=== ÍNDICES EN TABLA USERS ===' as seccion;

SELECT 
    indexname,
    indexdef,
    CASE 
        WHEN indexname LIKE '%email%' THEN '📧 Índice de email'
        WHEN indexname LIKE '%pkey%' THEN '🔑 Clave primaria'
        ELSE '📋 Otro índice'
    END as tipo
FROM pg_indexes 
WHERE tablename = 'users' 
    AND schemaname = 'public';

-- 7. VERIFICAR TRIGGERS EN TABLA USERS
SELECT '=== TRIGGERS EN TABLA USERS ===' as seccion;

SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    CASE 
        WHEN trigger_name LIKE '%imc%' THEN '🧮 Cálculo automático de IMC'
        WHEN trigger_name LIKE '%update%' THEN '🔄 Actualización automática'
        ELSE '⚙️ Otro trigger'
    END as proposito
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
    AND trigger_schema = 'public';

-- 8. RESUMEN FINAL
SELECT '=== RESUMEN FINAL ===' as seccion;

SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public') 
        THEN '❌ ERROR: La tabla user_profiles AÚN EXISTE - debe eliminarse'
        ELSE '✅ CORRECTO: No existe tabla user_profiles'
    END as estado_user_profiles,
    
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') 
        THEN '✅ CORRECTO: La tabla users existe'
        ELSE '❌ ERROR: La tabla users NO existe'
    END as estado_users,
    
    (SELECT COUNT(*) FROM users) as total_usuarios_registrados,
    
    CASE 
        WHEN (SELECT COUNT(*) FROM users WHERE edad IS NOT NULL AND peso IS NOT NULL AND altura IS NOT NULL) > 0
        THEN '✅ CORRECTO: Hay usuarios con datos de perfil'
        ELSE '⚠️ ADVERTENCIA: No hay usuarios con perfil completo'
    END as estado_datos_perfil;

-- 9. COMANDOS DE LIMPIEZA (SI ES NECESARIO)
SELECT '=== COMANDOS DE LIMPIEZA (EJECUTAR SOLO SI ES NECESARIO) ===' as seccion;

SELECT 
    'DROP TABLE IF EXISTS user_profiles CASCADE;' as comando_limpieza,
    'Solo ejecutar si la tabla user_profiles existe incorrectamente' as nota;

-- =====================================================
-- FIN DEL SCRIPT DE VERIFICACIÓN
-- =====================================================
