-- =====================================================
-- SCRIPT SIMPLE PARA VERIFICAR PERFIL DE USUARIO
-- Ejecutar en DBeaver para ver datos del usuario
-- =====================================================

-- 1. DATOS BÁSICOS DEL USUARIO
SELECT 
    '=== DATOS BÁSICOS ===' as seccion,
    id,
    nombre,
    apellido, 
    email,
    edad,
    sexo
FROM users 
WHERE id = 1;

-- 2. DATOS FÍSICOS PARA LA IA
SELECT 
    '=== DATOS FÍSICOS PARA IA ===' as seccion,
    peso,
    altura,
    imc,
    grasa_corporal,
    masa_muscular,
    agua_corporal,
    metabolismo_basal
FROM users 
WHERE id = 1;

-- 3. DATOS DE ENTRENAMIENTO
SELECT 
    '=== DATOS DE ENTRENAMIENTO ===' as seccion,
    nivel_actividad,
    experiencia,
    años_entrenando,
    metodologia_preferida,
    frecuencia_semanal,
    objetivo_principal
FROM users 
WHERE id = 1;

-- 4. MEDIDAS CORPORALES
SELECT 
    '=== MEDIDAS CORPORALES ===' as seccion,
    cintura,
    pecho,
    brazos,
    muslos,
    cuello,
    antebrazos,
    cadera
FROM users 
WHERE id = 1;

-- 5. DATOS MÉDICOS Y LIMITACIONES
SELECT 
    '=== DATOS MÉDICOS ===' as seccion,
    limitaciones,
    historial_medico,
    alergias,
    medicamentos
FROM users 
WHERE id = 1;

-- 6. VERIFICACIÓN PARA LA IA - CAMPOS CLAVE
SELECT 
    '=== VERIFICACIÓN PARA IA ===' as seccion,
    CASE WHEN edad IS NOT NULL THEN edad ELSE 0 END as edad_para_ia,
    CASE WHEN peso IS NOT NULL THEN peso ELSE 0 END as peso_para_ia,
    CASE WHEN altura IS NOT NULL THEN altura ELSE 0 END as altura_para_ia,
    CASE WHEN nivel_actividad IS NOT NULL THEN nivel_actividad ELSE 'principiante' END as nivel_para_ia,
    CASE WHEN imc IS NOT NULL THEN imc ELSE 0 END as imc_para_ia,
    CASE 
        WHEN limitaciones IS NOT NULL AND limitaciones != '[]' AND limitaciones != '{}' 
        THEN limitaciones::text 
        ELSE 'Ninguna' 
    END as lesiones_para_ia
FROM users 
WHERE id = 1;

-- 7. RESUMEN FINAL - ¿ESTÁ LISTO PARA LA IA?
SELECT 
    '=== RESUMEN PARA IA ===' as seccion,
    CASE 
        WHEN edad IS NOT NULL AND peso IS NOT NULL AND altura IS NOT NULL 
        THEN '✅ PERFIL COMPLETO - IA puede generar entrenamiento'
        ELSE '❌ PERFIL INCOMPLETO - Faltan datos básicos'
    END as estado_perfil,
    
    CASE 
        WHEN edad IS NULL THEN 'Falta edad, '
        ELSE ''
    END ||
    CASE 
        WHEN peso IS NULL THEN 'Falta peso, '
        ELSE ''
    END ||
    CASE 
        WHEN altura IS NULL THEN 'Falta altura, '
        ELSE ''
    END ||
    CASE 
        WHEN nivel_actividad IS NULL THEN 'Falta nivel_actividad'
        ELSE ''
    END as campos_faltantes
FROM users 
WHERE id = 1;
