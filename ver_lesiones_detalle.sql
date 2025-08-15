-- =====================================================
-- VER DETALLES EXACTOS DE LAS LESIONES
-- =====================================================

-- 1. Mostrar TODAS las lesiones sin filtros
SELECT 
    'TODAS LAS LESIONES EN LA TABLA:' as info;

SELECT 
    id,
    user_id,
    titulo,
    zona,
    tipo,
    gravedad,
    estado,
    fecha_inicio,
    fecha_fin,
    causa,
    tratamiento,
    notas,
    created_at
FROM injuries
ORDER BY id;

-- 2. Mostrar lesiones específicas del usuario ID 1
SELECT 
    'LESIONES DEL USUARIO ID 1:' as info;

SELECT 
    id,
    user_id,
    titulo,
    zona,
    tipo,
    gravedad,
    estado,
    fecha_inicio,
    fecha_fin,
    causa,
    tratamiento,
    notas,
    created_at
FROM injuries
WHERE user_id = 1
ORDER BY id;

-- 3. Contar lesiones por estado
SELECT 
    'CONTEO POR ESTADO:' as info;

SELECT 
    estado,
    COUNT(*) as cantidad
FROM injuries
WHERE user_id = 1
GROUP BY estado;

-- 4. Ver estructura completa de la tabla
SELECT 
    'ESTRUCTURA DE LA TABLA INJURIES:' as info;

SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'injuries'
ORDER BY ordinal_position;

-- 5. ELIMINAR las lesiones si quieres empezar limpio
-- DESCOMENTA las siguientes líneas si quieres borrar las lesiones:

-- DELETE FROM injuries WHERE user_id = 1;
-- SELECT 'Lesiones eliminadas para el usuario ID 1' as resultado;

-- 6. Verificar después de eliminar (si ejecutaste el DELETE)
SELECT 
    'VERIFICACIÓN FINAL:' as info,
    COUNT(*) as total_lesiones_restantes
FROM injuries
WHERE user_id = 1;
