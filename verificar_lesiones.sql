-- =====================================================
-- VERIFICAR LESIONES EN LA BASE DE DATOS
-- =====================================================

-- 1. Verificar si existe la tabla injuries
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'injuries') 
        THEN '✅ Tabla injuries existe' 
        ELSE '❌ Tabla injuries NO existe' 
    END as tabla_injuries;

-- 2. Si existe la tabla, mostrar su estructura
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'injuries'
ORDER BY ordinal_position;

-- 3. Buscar el usuario de prueba
SELECT 
    id, email, nombre, apellido
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- 4. Verificar si hay lesiones para este usuario
SELECT 
    COUNT(*) as total_lesiones,
    COUNT(CASE WHEN estado = 'activo' THEN 1 END) as lesiones_activas,
    COUNT(CASE WHEN estado = 'recuperado' THEN 1 END) as lesiones_recuperadas
FROM injuries i
JOIN users u ON u.id = i.user_id
WHERE u.email = 'sergiohernandezlara07@gmail.com';

-- 5. Mostrar todas las lesiones del usuario (si las hay)
SELECT 
    i.id,
    i.titulo,
    i.zona,
    i.tipo,
    i.gravedad,
    i.estado,
    i.fecha_inicio,
    i.fecha_fin,
    i.causa,
    i.tratamiento,
    i.notas,
    i.created_at
FROM injuries i
JOIN users u ON u.id = i.user_id
WHERE u.email = 'sergiohernandezlara07@gmail.com'
ORDER BY i.created_at DESC;

-- 6. Si no hay tabla injuries, mostrar cómo crearla
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'injuries') THEN
        RAISE NOTICE '⚠️ La tabla injuries no existe. Ejecuta este comando para crearla:';
        RAISE NOTICE 'CREATE TABLE injuries (';
        RAISE NOTICE '    id SERIAL PRIMARY KEY,';
        RAISE NOTICE '    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,';
        RAISE NOTICE '    titulo VARCHAR(200) NOT NULL,';
        RAISE NOTICE '    zona VARCHAR(100),';
        RAISE NOTICE '    tipo VARCHAR(100),';
        RAISE NOTICE '    gravedad VARCHAR(50),';
        RAISE NOTICE '    fecha_inicio DATE,';
        RAISE NOTICE '    fecha_fin DATE,';
        RAISE NOTICE '    causa TEXT,';
        RAISE NOTICE '    tratamiento TEXT,';
        RAISE NOTICE '    estado VARCHAR(50) DEFAULT ''activo'',';
        RAISE NOTICE '    notas TEXT,';
        RAISE NOTICE '    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,';
        RAISE NOTICE '    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP';
        RAISE NOTICE ');';
    END IF;
END $$;

-- 7. Verificar endpoints disponibles (simulación)
SELECT 
    'Endpoints de lesiones disponibles:' as info,
    'GET /api/users/{id}/injuries - Listar lesiones del usuario' as endpoint1,
    'POST /api/users/{id}/injuries - Crear nueva lesión' as endpoint2,
    'PATCH /api/injuries/{injuryId} - Actualizar lesión' as endpoint3,
    'DELETE /api/injuries/{injuryId} - Eliminar lesión' as endpoint4;
