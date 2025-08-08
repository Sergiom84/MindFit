-- Eliminar tablas incorrectas si existen
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;

-- Crear tabla users según el proyecto MindFit
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

-- Crear tabla injuries (lesiones) si no existe
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

-- Insertar usuario de prueba
-- Nota: el hash de la contraseña fue generado previamente con bcrypt
INSERT INTO users (nombre, apellido, email, password)
VALUES ('Test', 'User', 'test@example.com', '$2b$10$NAJZ2eTBc55cf4/l61.CsOhVXNH1Mzers9p63tbA4IC1/tzwanh/q');

-- Para crear usuarios adicionales, usar el endpoint /api/register