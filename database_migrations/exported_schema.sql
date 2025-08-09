
-- Secuencia: injuries_id_seq
DROP SEQUENCE IF EXISTS injuries_id_seq CASCADE;
CREATE SEQUENCE injuries_id_seq;

-- Secuencia: users_id_seq
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
CREATE SEQUENCE users_id_seq;

-- Tabla: injuries
DROP TABLE IF EXISTS injuries CASCADE;
CREATE TABLE injuries (
    id INTEGER NOT NULL DEFAULT nextval('injuries_id_seq'::regclass),
    user_id INTEGER NOT NULL,
    titulo VARCHAR(120),
    zona VARCHAR(120),
    severidad VARCHAR(30),
    fecha DATE,
    estado VARCHAR(30) DEFAULT 'activo'::character varying,
    tratamiento TEXT,
    limitacion_actual TEXT,
    notas TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo TEXT,
    gravedad TEXT,
    fecha_inicio TIMESTAMP,
    fecha_fin TIMESTAMP
);

-- Tabla: users
DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    id INTEGER NOT NULL DEFAULT nextval('users_id_seq'::regclass),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    iniciales VARCHAR(5),
    nivel VARCHAR(50),
    edad INTEGER,
    sexo VARCHAR(20),
    peso DECIMAL(5,2),
    altura DECIMAL(5,2),
    imc DECIMAL(4,1),
    nivel_actividad VARCHAR(50),
    experiencia VARCHAR(100),
    años_entrenando INTEGER,
    metodologia_preferida VARCHAR(100),
    frecuencia_semanal INTEGER,
    grasa_corporal DECIMAL(5,2),
    masa_muscular DECIMAL(5,2),
    agua_corporal DECIMAL(5,2),
    metabolismo_basal INTEGER,
    cintura DECIMAL(5,2),
    pecho DECIMAL(5,2),
    brazos DECIMAL(5,2),
    muslos DECIMAL(5,2),
    cuello DECIMAL(5,2),
    antebrazos DECIMAL(5,2),
    historial_medico TEXT,
    limitaciones JSONB DEFAULT '[]'::jsonb,
    alergias TEXT,
    medicamentos TEXT,
    objetivo_principal VARCHAR(100),
    meta_peso DECIMAL(5,2),
    meta_grasa DECIMAL(5,2),
    enfoque VARCHAR(100),
    horario_preferido VARCHAR(50),
    comidas_diarias INTEGER,
    suplementacion TEXT,
    alimentos_excluidos TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Clave primaria para injuries
ALTER TABLE injuries ADD CONSTRAINT injuries_pkey PRIMARY KEY (id);

-- Clave primaria para users
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);

-- Clave foránea para injuries
ALTER TABLE injuries ADD CONSTRAINT injuries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Índice para users
CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);

-- Índice para injuries
CREATE INDEX idx_injuries_user ON public.injuries USING btree (user_id);

-- Índice para injuries
CREATE INDEX idx_injuries_estado ON public.injuries USING btree (estado);
