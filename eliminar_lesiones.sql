-- =====================================================
-- ELIMINAR LESIONES DEL USUARIO PARA TESTING LIMPIO
-- =====================================================

-- 1. Mostrar lesiones antes de eliminar
SELECT 
    'ANTES DE ELIMINAR - Total lesiones:' as info,
    COUNT(*) as total
FROM injuries 
WHERE user_id = 1;

-- 2. Eliminar todas las lesiones del usuario ID 1
DELETE FROM injuries WHERE user_id = 1;

-- 3. Verificar que se eliminaron
SELECT 
    'DESPUÉS DE ELIMINAR - Total lesiones:' as info,
    COUNT(*) as total
FROM injuries 
WHERE user_id = 1;

-- 4. Mensaje de confirmación
SELECT 
    '✅ Lesiones eliminadas correctamente' as resultado,
    'Ahora puedes probar la IA sin limitaciones' as siguiente_paso;

COMMIT;
