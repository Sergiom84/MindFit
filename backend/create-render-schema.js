import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de la base de datos de Render
const getRenderDbConfig = () => {
  return {
    user: process.env.RENDER_PGUSER,
    host: process.env.RENDER_PGHOST,
    database: process.env.RENDER_PGDATABASE,
    password: process.env.RENDER_PGPASSWORD,
    port: process.env.RENDER_PGPORT || 5432,
    ssl: {
      rejectUnauthorized: false
    }
  }
}

async function createRenderSchema () {
  console.log('🚀 Creando esquema en base de datos de Render...')

  const renderConfig = getRenderDbConfig()
  const pool = new Pool(renderConfig)
  let client

  try {
    client = await pool.connect()
    console.log('✅ Conectado a Render')

    // Crear esquema basado en el CSV que proporcionaste
    const schemaSQL = `
-- Eliminar tablas si existen
DROP TABLE IF EXISTS injuries CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Crear secuencias
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
CREATE SEQUENCE users_id_seq;

DROP SEQUENCE IF EXISTS injuries_id_seq CASCADE;
CREATE SEQUENCE injuries_id_seq;

-- Crear tabla users
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

-- Crear tabla injuries
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

-- Agregar claves primarias
ALTER TABLE users ADD CONSTRAINT users_pkey PRIMARY KEY (id);
ALTER TABLE injuries ADD CONSTRAINT injuries_pkey PRIMARY KEY (id);

-- Agregar claves foráneas
ALTER TABLE injuries ADD CONSTRAINT injuries_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id);

-- Agregar constraints únicos
ALTER TABLE users ADD CONSTRAINT users_email_key UNIQUE (email);

-- Agregar checks constraints
ALTER TABLE injuries ADD CONSTRAINT injuries_estado_check 
    CHECK (estado IN ('activo', 'en recuperación', 'recuperado'));

ALTER TABLE injuries ADD CONSTRAINT injuries_severidad_check 
    CHECK (severidad IN ('leve', 'moderada', 'grave'));

-- Crear índices
CREATE INDEX idx_injuries_user ON injuries(user_id);
CREATE INDEX idx_injuries_estado ON injuries(estado);

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
`

    console.log('🔄 Ejecutando script de creación de esquema...')

    // Dividir en statements y ejecutar uno por uno
    const statements = schemaSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    let executedCount = 0

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement)
          executedCount++
        } catch (error) {
          console.log(`⚠️ Error en statement: ${error.message}`)
          console.log(`Statement: ${statement.substring(0, 100)}...`)
        }
      }
    }

    console.log(`✅ Esquema creado exitosamente (${executedCount} statements ejecutados)`)

    // Verificar tablas creadas
    const tablesResult = await client.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `)

    console.log('📊 Tablas creadas en Render:')
    for (const table of tablesResult.rows) {
      console.log(`  📄 ${table.table_name}: ${table.column_count} columnas`)
    }
  } catch (error) {
    console.error('❌ Error creando esquema:', error)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('create-render-schema.js')) {
  createRenderSchema()
}

export { createRenderSchema }
