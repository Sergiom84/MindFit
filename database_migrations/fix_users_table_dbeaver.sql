-- =====================================================
-- SCRIPT PARA CORREGIR TABLA USERS - DBEAVER
-- Agrega columnas faltantes sin borrar datos
-- =====================================================

-- Verificar estructura actual de la tabla users
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Agregar columnas faltantes si no existen
DO $$
BEGIN
    -- Agregar columna nombre si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'nombre') THEN
        ALTER TABLE users ADD COLUMN nombre VARCHAR(100);
    END IF;
    
    -- Agregar columna apellido si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'apellido') THEN
        ALTER TABLE users ADD COLUMN apellido VARCHAR(100);
    END IF;
    
    -- Agregar columna edad si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'edad') THEN
        ALTER TABLE users ADD COLUMN edad INTEGER;
    END IF;
    
    -- Agregar columna sexo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'sexo') THEN
        ALTER TABLE users ADD COLUMN sexo VARCHAR(20);
    END IF;
    
    -- Agregar columna peso si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'peso') THEN
        ALTER TABLE users ADD COLUMN peso DECIMAL(5,2);
    END IF;
    
    -- Agregar columna altura si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'altura') THEN
        ALTER TABLE users ADD COLUMN altura DECIMAL(5,2);
    END IF;
    
    -- Agregar columna imc si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'imc') THEN
        ALTER TABLE users ADD COLUMN imc DECIMAL(5,2);
    END IF;
    
    -- Agregar columna nivel_actividad si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'nivel_actividad') THEN
        ALTER TABLE users ADD COLUMN nivel_actividad VARCHAR(50);
    END IF;
    
    -- Agregar columna objetivo si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'objetivo') THEN
        ALTER TABLE users ADD COLUMN objetivo VARCHAR(100);
    END IF;
    
    -- Agregar columna limitaciones si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'limitaciones') THEN
        ALTER TABLE users ADD COLUMN limitaciones JSONB DEFAULT '{}';
    END IF;
    
    -- Agregar columna avatar_url si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar_url') THEN
        ALTER TABLE users ADD COLUMN avatar_url VARCHAR(500);
    END IF;
    
    -- Agregar columna created_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'created_at') THEN
        ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
    
    -- Agregar columna updated_at si no existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'updated_at') THEN
        ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Verificar que el usuario de prueba existe, si no, crearlo
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'sergiohernandezlara07@gmail.com') THEN
        INSERT INTO users (
            email, password, nombre, apellido, edad, sexo, 
            peso, altura, nivel_actividad, objetivo
        ) VALUES (
            'sergiohernandezlara07@gmail.com',
            '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password: 1234
            'Sergio',
            'Hernández',
            30,
            'masculino',
            75.0,
            175.0,
            'intermedio',
            'Ganar músculo'
        );
    ELSE
        -- Si existe, actualizar los campos que puedan estar vacíos
        UPDATE users SET 
            nombre = COALESCE(nombre, 'Sergio'),
            apellido = COALESCE(apellido, 'Hernández'),
            edad = COALESCE(edad, 30),
            sexo = COALESCE(sexo, 'masculino'),
            peso = COALESCE(peso, 75.0),
            altura = COALESCE(altura, 175.0),
            nivel_actividad = COALESCE(nivel_actividad, 'intermedio'),
            objetivo = COALESCE(objetivo, 'Ganar músculo')
        WHERE email = 'sergiohernandezlara07@gmail.com';
    END IF;
END $$;

-- Crear índice en email si no existe
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Verificar estructura final
SELECT 'Tabla users corregida exitosamente' as resultado;

-- Ver estructura actualizada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Verificar usuario de prueba
SELECT id, email, nombre, apellido, edad, sexo, peso, altura, nivel_actividad, objetivo
FROM users 
WHERE email = 'sergiohernandezlara07@gmail.com';

-- =====================================================
-- TABLA USERS CORREGIDA - LISTO PARA LOGIN
-- =====================================================
