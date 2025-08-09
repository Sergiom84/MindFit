import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function createSimpleTables() {
  console.log('🚀 Creando tablas básicas de entrenamiento en casa...');
  
  try {
    const client = await pool.connect();
    console.log('✅ Conectado a base de datos');
    
    // 1. Tabla principal de programas
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_training_programs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        equipamiento VARCHAR(50) NOT NULL,
        tipo_entrenamiento VARCHAR(50) NOT NULL,
        duracion_total VARCHAR(20) DEFAULT '30-45 min',
        frecuencia VARCHAR(30) DEFAULT '4-5 días/semana',
        enfoque VARCHAR(100) DEFAULT 'Entrenamiento funcional',
        fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
        fecha_fin DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '7 days'),
        estado VARCHAR(20) DEFAULT 'activo',
        progreso_porcentaje INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_training_programs creada');
    
    // 2. Tabla de ejercicios
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_training_exercises (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL,
        nombre VARCHAR(200) NOT NULL,
        descripcion TEXT,
        series INTEGER NOT NULL DEFAULT 3,
        repeticiones VARCHAR(20),
        duracion INTEGER,
        descanso INTEGER NOT NULL DEFAULT 60,
        tipo VARCHAR(20) NOT NULL,
        consejos JSONB DEFAULT '[]'::jsonb,
        orden INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_training_exercises creada');
    
    // 3. Tabla de días
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_training_days (
        id SERIAL PRIMARY KEY,
        program_id INTEGER NOT NULL,
        dia_semana VARCHAR(20) NOT NULL,
        fecha DATE NOT NULL,
        dia_numero INTEGER NOT NULL,
        es_descanso BOOLEAN DEFAULT FALSE,
        ejercicios_asignados JSONB DEFAULT '[]'::jsonb,
        estado VARCHAR(20) DEFAULT 'pendiente',
        ejercicios_completados INTEGER DEFAULT 0,
        tiempo_total_minutos INTEGER DEFAULT 0,
        fecha_completado TIMESTAMP,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_training_days creada');
    
    // 4. Tabla de sesiones
    await client.query(`
      CREATE TABLE IF NOT EXISTS home_training_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        day_id INTEGER NOT NULL,
        fecha_sesion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        duracion_minutos INTEGER NOT NULL,
        ejercicios_completados INTEGER NOT NULL,
        ejercicios_totales INTEGER NOT NULL,
        calorias_estimadas INTEGER,
        dificultad_percibida INTEGER,
        notas TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla home_training_sessions creada');
    
    // 5. Crear índices básicos
    await client.query('CREATE INDEX IF NOT EXISTS idx_home_programs_user ON home_training_programs(user_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_home_exercises_program ON home_training_exercises(program_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_home_days_program ON home_training_days(program_id)');
    await client.query('CREATE INDEX IF NOT EXISTS idx_home_sessions_user ON home_training_sessions(user_id)');
    console.log('✅ Índices básicos creados');
    
    // Verificar tablas
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name LIKE 'home_training%'
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas creadas:');
    result.rows.forEach(row => {
      console.log(`  📄 ${row.table_name}`);
    });
    
    client.release();
    console.log('\n🎉 Tablas básicas creadas exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

createSimpleTables();
