import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function getRenderDbConfig() {
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
}

async function createHomeTables() {
  console.log('🚀 Creando tablas de entrenamiento en casa...');
  
  const renderConfig = getRenderDbConfig();
  const pool = new Pool(renderConfig);
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Conectado a Render');
    
    // Crear tablas una por una
    const tables = [
      {
        name: 'home_training_programs',
        sql: `
          CREATE TABLE IF NOT EXISTS home_training_programs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            titulo VARCHAR(200) NOT NULL,
            descripcion TEXT,
            equipamiento VARCHAR(50) NOT NULL,
            tipo_entrenamiento VARCHAR(50) NOT NULL,
            duracion_total VARCHAR(20),
            frecuencia VARCHAR(30),
            enfoque VARCHAR(100),
            fecha_inicio DATE NOT NULL,
            fecha_fin DATE NOT NULL,
            estado VARCHAR(20) DEFAULT 'activo',
            progreso_porcentaje INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'home_training_exercises',
        sql: `
          CREATE TABLE IF NOT EXISTS home_training_exercises (
            id SERIAL PRIMARY KEY,
            program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
            nombre VARCHAR(200) NOT NULL,
            descripcion TEXT,
            series INTEGER NOT NULL,
            repeticiones VARCHAR(20),
            duracion INTEGER,
            descanso INTEGER NOT NULL,
            tipo VARCHAR(20) NOT NULL,
            consejos JSONB DEFAULT '[]'::jsonb,
            orden INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'home_training_days',
        sql: `
          CREATE TABLE IF NOT EXISTS home_training_days (
            id SERIAL PRIMARY KEY,
            program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
            dia_semana VARCHAR(20) NOT NULL,
            fecha DATE NOT NULL,
            dia_numero INTEGER NOT NULL,
            es_descanso BOOLEAN DEFAULT FALSE,
            ejercicios_asignados JSONB DEFAULT '[]'::jsonb,
            estado VARCHAR(20) DEFAULT 'pendiente',
            ejercicios_completados INTEGER DEFAULT 0,
            tiempo_total_minutos INTEGER DEFAULT 0,
            fecha_completado TIMESTAMP,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      },
      {
        name: 'home_training_sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS home_training_sessions (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            program_id INTEGER NOT NULL REFERENCES home_training_programs(id) ON DELETE CASCADE,
            day_id INTEGER NOT NULL REFERENCES home_training_days(id) ON DELETE CASCADE,
            fecha_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            duracion_minutos INTEGER NOT NULL,
            ejercicios_completados INTEGER NOT NULL,
            ejercicios_totales INTEGER NOT NULL,
            calorias_estimadas INTEGER,
            notas TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `
      }
    ];
    
    for (const table of tables) {
      try {
        await client.query(table.sql);
        console.log(`✅ Tabla ${table.name} creada`);
      } catch (error) {
        console.log(`⚠️ Error creando ${table.name}: ${error.message}`);
      }
    }
    
    // Crear índices
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_home_programs_user ON home_training_programs(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_home_exercises_program ON home_training_exercises(program_id)',
      'CREATE INDEX IF NOT EXISTS idx_home_days_program ON home_training_days(program_id)',
      'CREATE INDEX IF NOT EXISTS idx_home_sessions_user ON home_training_sessions(user_id)'
    ];
    
    for (const indexSQL of indexes) {
      try {
        await client.query(indexSQL);
        console.log('✅ Índice creado');
      } catch (error) {
        console.log(`⚠️ Error creando índice: ${error.message}`);
      }
    }
    
    console.log('🎉 Tablas de entrenamiento en casa creadas exitosamente');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

createHomeTables();
