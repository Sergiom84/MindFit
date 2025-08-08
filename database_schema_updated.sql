-- Eliminar tablas incorrectas si existen
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- Crear tabla users según el proyecto MindFit (ACTUALIZADA)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    iniciales VARCHAR(5),
    nivel VARCHAR(50),
    edad INT,
    sexo VARCHAR(20),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    imc DECIMAL(4,1),
    nivel_actividad VARCHAR(50),
    experiencia VARCHAR(100),
    años_entrenando INT,
    metodologia_preferida VARCHAR(100),
    frecuencia_semanal INT,
    grasa_corporal DECIMAL(5,2),
    masa_muscular DECIMAL(5,2),
    agua_corporal DECIMAL(5,2),
    metabolismo_basal INT,
    cintura DECIMAL(5,2),
    pecho DECIMAL(5,2),
    brazos DECIMAL(5,2),
    muslos DECIMAL(5,2),
    cuello DECIMAL(5,2),
    antebrazos DECIMAL(5,2),
    historial_medico TEXT,
    limitaciones TEXT,
    alergias TEXT,
    medicamentos TEXT,
    objetivo_principal VARCHAR(100),
    meta_peso DECIMAL(5,2),
    meta_grasa DECIMAL(5,2),
    enfoque VARCHAR(100),
    horario_preferido VARCHAR(50),
    comidas_diarias INT,
    suplementacion TEXT,
    alimentos_excluidos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de lesiones (injuries)
CREATE TABLE IF NOT EXISTS injuries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    zona TEXT,
    tipo TEXT,
    gravedad TEXT,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP,
    causa TEXT,
    tratamiento TEXT,
    estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'en recuperación', 'recuperado')),
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_injuries_user ON injuries(user_id);
CREATE INDEX IF NOT EXISTS idx_injuries_estado ON injuries(estado);

-- Crear función para calcular IMC automáticamente
CREATE OR REPLACE FUNCTION calculate_imc()
RETURNS TRIGGER AS $$
BEGIN
    -- Calcular IMC si peso y altura están disponibles
    IF NEW.peso IS NOT NULL AND NEW.altura IS NOT NULL AND NEW.altura > 0 THEN
        NEW.imc = ROUND((NEW.peso / POWER(NEW.altura / 100.0, 2))::numeric, 1);
    END IF;
    
    -- Generar iniciales si no están definidas
    IF NEW.iniciales IS NULL OR NEW.iniciales = '' THEN
        NEW.iniciales = UPPER(LEFT(NEW.nombre, 1) || LEFT(NEW.apellido, 1));
    END IF;
    
    -- Actualizar timestamp
    NEW.updated_at = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para calcular IMC automáticamente
CREATE TRIGGER trigger_calculate_imc
    BEFORE INSERT OR UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION calculate_imc();

-- Crear usuario de prueba
INSERT INTO users (
    nombre, apellido, email, password, edad, sexo, peso, altura, objetivo_principal
) VALUES (
    'Test', 'User', 'test@example.com', '$2b$10$YwszKkIK29Clon.cozgLce727RideFQ83Y27PfUscTbUkukxwIAXK', 25, 'masculino', 75.5, 175, 'mantener_forma'
);

-- Verificar que el IMC se calculó correctamente
SELECT nombre, apellido, peso, altura, imc, iniciales FROM users WHERE email = 'test@example.com';
