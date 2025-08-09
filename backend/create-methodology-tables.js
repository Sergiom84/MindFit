import { Pool } from 'pg';
import fs from 'fs';
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

const createMethodologyTables = async () => {
  console.log('🚀 Ejecutando esquema de metodologías...');

  const renderConfig = getRenderDbConfig();
  const pool = new Pool(renderConfig);
  let client;

  try {
    client = await pool.connect();
    console.log('✅ Conectado a base de datos');
    console.log('🗄️ Creando tablas de metodologías...');

    // 1. Tabla principal de metodologías seleccionadas
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_selected_methodologies (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL,
          methodology_name VARCHAR(100) NOT NULL,
          methodology_description TEXT,
          methodology_icon VARCHAR(50),
          methodology_version VARCHAR(20) DEFAULT 'adapted',
          selection_mode VARCHAR(20) NOT NULL CHECK (selection_mode IN ('automatic', 'manual')),
          program_duration VARCHAR(50) NOT NULL,
          difficulty_level VARCHAR(20) NOT NULL,
          
          fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
          fecha_fin DATE NOT NULL,
          
          estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'pausado', 'cancelado')),
          progreso_porcentaje INTEGER DEFAULT 0 CHECK (progreso_porcentaje >= 0 AND progreso_porcentaje <= 100),
          
          methodology_data JSONB DEFAULT '{}'::jsonb,
          ai_recommendation_data JSONB DEFAULT '{}'::jsonb,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          cancelled_at TIMESTAMP
      )
    `);
    console.log('✅ Tabla user_selected_methodologies creada');

    // 2. Tabla de progreso semanal
    await client.query(`
      CREATE TABLE IF NOT EXISTS methodology_weekly_progress (
          id SERIAL PRIMARY KEY,
          methodology_id INTEGER NOT NULL,
          semana_numero INTEGER NOT NULL CHECK (semana_numero > 0),
          fecha_inicio_semana DATE NOT NULL,
          fecha_fin_semana DATE NOT NULL,
          
          estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_progreso', 'completada', 'perdida')),
          
          entrenamientos_completados INTEGER DEFAULT 0 CHECK (entrenamientos_completados >= 0),
          entrenamientos_totales INTEGER NOT NULL CHECK (entrenamientos_totales > 0),
          porcentaje_completado INTEGER DEFAULT 0 CHECK (porcentaje_completado >= 0 AND porcentaje_completado <= 100),
          
          tiempo_total_minutos INTEGER DEFAULT 0 CHECK (tiempo_total_minutos >= 0),
          peso_promedio_usado DECIMAL(5,2),
          repeticiones_totales INTEGER DEFAULT 0,
          
          dificultad_percibida INTEGER CHECK (dificultad_percibida >= 1 AND dificultad_percibida <= 10),
          energia_nivel INTEGER CHECK (energia_nivel >= 1 AND energia_nivel <= 10),
          motivacion_nivel INTEGER CHECK (motivacion_nivel >= 1 AND motivacion_nivel <= 10),
          
          notas_semana TEXT,
          logros_destacados TEXT,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMP,
          
          CONSTRAINT unique_week_per_methodology UNIQUE (methodology_id, semana_numero)
      )
    `);
    console.log('✅ Tabla methodology_weekly_progress creada');

    // 3. Tabla de sesiones de entrenamiento
    await client.query(`
      CREATE TABLE IF NOT EXISTS methodology_training_sessions (
          id SERIAL PRIMARY KEY,
          methodology_id INTEGER NOT NULL,
          week_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          
          fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
          hora_inicio TIME,
          hora_fin TIME,
          duracion_minutos INTEGER NOT NULL CHECK (duracion_minutos > 0),
          
          ejercicios_completados INTEGER NOT NULL CHECK (ejercicios_completados >= 0),
          ejercicios_totales INTEGER NOT NULL CHECK (ejercicios_totales > 0),
          peso_usado DECIMAL(5,2),
          repeticiones_totales INTEGER DEFAULT 0,
          series_totales INTEGER DEFAULT 0,
          
          dificultad_percibida INTEGER CHECK (dificultad_percibida >= 1 AND dificultad_percibida <= 10),
          energia_antes INTEGER CHECK (energia_antes >= 1 AND energia_antes <= 10),
          energia_despues INTEGER CHECK (energia_despues >= 1 AND energia_despues <= 10),
          satisfaccion INTEGER CHECK (satisfaccion >= 1 AND satisfaccion <= 10),
          
          calorias_estimadas INTEGER CHECK (calorias_estimadas >= 0),
          frecuencia_cardiaca_promedio INTEGER CHECK (frecuencia_cardiaca_promedio > 0),
          notas_sesion TEXT,
          
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Tabla methodology_training_sessions creada');

    // 4. Crear índices
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_methodologies_user ON user_selected_methodologies(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_methodologies_estado ON user_selected_methodologies(estado);
      CREATE INDEX IF NOT EXISTS idx_user_methodologies_fechas ON user_selected_methodologies(fecha_inicio, fecha_fin);
      
      CREATE INDEX IF NOT EXISTS idx_weekly_progress_methodology ON methodology_weekly_progress(methodology_id);
      CREATE INDEX IF NOT EXISTS idx_weekly_progress_semana ON methodology_weekly_progress(semana_numero);
      CREATE INDEX IF NOT EXISTS idx_weekly_progress_estado ON methodology_weekly_progress(estado);
      
      CREATE INDEX IF NOT EXISTS idx_methodology_sessions_user ON methodology_training_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_methodology_sessions_methodology ON methodology_training_sessions(methodology_id);
      CREATE INDEX IF NOT EXISTS idx_methodology_sessions_fecha ON methodology_training_sessions(fecha_sesion);
    `);
    console.log('✅ Índices creados');

    // 5. Crear funciones y triggers
    await client.query(`
      CREATE OR REPLACE FUNCTION update_methodology_progress()
      RETURNS TRIGGER AS $$
      BEGIN
          IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
              UPDATE methodology_weekly_progress 
              SET porcentaje_completado = (
                  SELECT ROUND(
                      (COUNT(*)::float / entrenamientos_totales::float) * 100
                  )
                  FROM methodology_training_sessions mts
                  WHERE mts.week_id = NEW.week_id
              ),
              tiempo_total_minutos = (
                  SELECT COALESCE(SUM(duracion_minutos), 0)
                  FROM methodology_training_sessions mts
                  WHERE mts.week_id = NEW.week_id
              ),
              updated_at = CURRENT_TIMESTAMP
              WHERE id = NEW.week_id;
              
              UPDATE methodology_weekly_progress 
              SET estado = 'completada',
                  completed_at = CURRENT_TIMESTAMP
              WHERE id = NEW.week_id 
              AND porcentaje_completado = 100
              AND estado != 'completada';
              
              UPDATE user_selected_methodologies 
              SET progreso_porcentaje = (
                  SELECT ROUND(
                      (COUNT(*) FILTER (WHERE estado = 'completada')::float / COUNT(*)::float) * 100
                  )
                  FROM methodology_weekly_progress 
                  WHERE methodology_id = (
                      SELECT methodology_id FROM methodology_weekly_progress WHERE id = NEW.week_id
                  )
              ),
              updated_at = CURRENT_TIMESTAMP
              WHERE id = (
                  SELECT methodology_id FROM methodology_weekly_progress WHERE id = NEW.week_id
              );
              
              UPDATE user_selected_methodologies 
              SET estado = 'completado',
                  completed_at = CURRENT_TIMESTAMP
              WHERE progreso_porcentaje = 100
              AND estado = 'activo';
          END IF;
          
          RETURN COALESCE(NEW, OLD);
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_methodology_progress ON methodology_training_sessions;
      CREATE TRIGGER trigger_update_methodology_progress
          AFTER INSERT OR UPDATE ON methodology_training_sessions
          FOR EACH ROW
          EXECUTE FUNCTION update_methodology_progress();
    `);

    await client.query(`
      CREATE OR REPLACE FUNCTION update_methodology_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_methodology_updated_at ON user_selected_methodologies;
      CREATE TRIGGER trigger_methodology_updated_at
          BEFORE UPDATE ON user_selected_methodologies
          FOR EACH ROW
          EXECUTE FUNCTION update_methodology_updated_at();
          
      DROP TRIGGER IF EXISTS trigger_weekly_progress_updated_at ON methodology_weekly_progress;
      CREATE TRIGGER trigger_weekly_progress_updated_at
          BEFORE UPDATE ON methodology_weekly_progress
          FOR EACH ROW
          EXECUTE FUNCTION update_methodology_updated_at();
    `);

    console.log('✅ Funciones y triggers creados');

    console.log('🎉 ¡Todas las tablas de metodologías creadas exitosamente!');

  } catch (error) {
    console.error('❌ Error al crear tablas:', error);
  } finally {
    if (client) client.release();
    await pool.end();
  }
};

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  createMethodologyTables();
}

export { createMethodologyTables };
