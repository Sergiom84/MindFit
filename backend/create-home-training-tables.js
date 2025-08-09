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

async function createHomeTables() {
  console.log('🚀 Ejecutando esquema completo de entrenamiento en casa...');

  const renderConfig = getRenderDbConfig();
  const pool = new Pool(renderConfig);
  let client;

  try {
    client = await pool.connect();
    console.log('✅ Conectado a base de datos');

    // Leer el script SQL completo
    const sqlScript = fs.readFileSync('../database_migrations/complete_home_training_schema.sql', 'utf8');

    // Dividir en statements (excluyendo comentarios y líneas vacías)
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt =>
        stmt.length > 0 &&
        !stmt.startsWith('--') &&
        !stmt.startsWith('/*') &&
        stmt !== 'END'
      );

    console.log(`🔄 Ejecutando ${statements.length} statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await client.query(statement + ';');
        successCount++;

        // Log específico para elementos importantes
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE.*?(\w+)/i)?.[1];
          console.log(`✅ Tabla creada: ${tableName}`);
        } else if (statement.includes('CREATE INDEX')) {
          const indexName = statement.match(/CREATE INDEX.*?(\w+)/i)?.[1];
          console.log(`📊 Índice creado: ${indexName}`);
        } else if (statement.includes('CREATE FUNCTION')) {
          const funcName = statement.match(/CREATE.*?FUNCTION.*?(\w+)/i)?.[1];
          console.log(`⚙️ Función creada: ${funcName}`);
        } else if (statement.includes('CREATE TRIGGER')) {
          const triggerName = statement.match(/CREATE TRIGGER.*?(\w+)/i)?.[1];
          console.log(`🔗 Trigger creado: ${triggerName}`);
        }

      } catch (error) {
        errorCount++;
        console.log(`⚠️ Error en statement ${i + 1}: ${error.message}`);
        console.log(`Statement: ${statement.substring(0, 100)}...`);
      }
    }

    console.log(`\n📊 Resumen de ejecución:`);
    console.log(`✅ Exitosos: ${successCount}`);
    console.log(`⚠️ Errores: ${errorCount}`);

    // Verificar tablas creadas
    const tablesResult = await client.query(`
      SELECT table_name,
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
      FROM information_schema.tables t
      WHERE table_name LIKE 'home_training%'
      ORDER BY table_name
    `);

    console.log('\n📋 Tablas de entrenamiento en casa creadas:');
    tablesResult.rows.forEach(row => {
      console.log(`  📄 ${row.table_name}: ${row.column_count} columnas`);
    });

    // Verificar índices
    const indexesResult = await client.query(`
      SELECT indexname, tablename
      FROM pg_indexes
      WHERE tablename LIKE 'home_training%'
      ORDER BY tablename, indexname
    `);

    console.log('\n📊 Índices creados:');
    indexesResult.rows.forEach(row => {
      console.log(`  🔍 ${row.indexname} en ${row.tablename}`);
    });

    // Verificar funciones y triggers
    const functionsResult = await client.query(`
      SELECT routine_name, routine_type
      FROM information_schema.routines
      WHERE routine_name LIKE '%home%' OR routine_name LIKE '%update_updated_at%'
    `);

    console.log('\n⚙️ Funciones creadas:');
    functionsResult.rows.forEach(row => {
      console.log(`  🔧 ${row.routine_name} (${row.routine_type})`);
    });

    console.log('\n🎉 Esquema de entrenamiento en casa instalado exitosamente!');

  } catch (error) {
    console.error('❌ Error general:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Función adicional para crear datos de ejemplo
async function createSampleData() {
  console.log('🎯 Creando datos de ejemplo...');

  const renderConfig = getRenderDbConfig();
  const pool = new Pool(renderConfig);
  let client;

  try {
    client = await pool.connect();

    // Verificar si existe usuario con ID 1
    const userCheck = await client.query('SELECT id FROM users LIMIT 1');

    if (userCheck.rows.length === 0) {
      console.log('⚠️ No hay usuarios en la base de datos. Saltando datos de ejemplo.');
      return;
    }

    const userId = userCheck.rows[0].id;

    // Crear programa de ejemplo
    const programResult = await client.query(`
      INSERT INTO home_training_programs (user_id, titulo, descripcion, equipamiento, tipo_entrenamiento)
      VALUES ($1, 'HIIT Doméstico Intensivo', 'Entrenamiento de alta intensidad adaptado para casa', 'minimal', 'hiit')
      RETURNING id
    `, [userId]);

    const programId = programResult.rows[0].id;
    console.log(`✅ Programa de ejemplo creado con ID: ${programId}`);

    // Crear ejercicios de ejemplo
    const exercises = [
      ['Burpees', 'Ejercicio completo de cuerpo', 3, '10-12', null, 60, 'repeticiones', 1],
      ['Mountain Climbers', 'Cardio intenso', 3, null, 30, 45, 'tiempo', 2],
      ['Jumping Jacks', 'Calentamiento dinámico', 3, '20', null, 30, 'repeticiones', 3],
      ['Planchas', 'Fortalecimiento del core', 3, null, 45, 60, 'tiempo', 4],
      ['Sentadillas', 'Fortalecimiento de piernas', 3, '15-20', null, 45, 'repeticiones', 5]
    ];

    for (const exercise of exercises) {
      await client.query(`
        INSERT INTO home_training_exercises
        (program_id, nombre, descripcion, series, repeticiones, duracion, descanso, tipo, orden)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [programId, ...exercise]);
    }

    console.log(`✅ ${exercises.length} ejercicios de ejemplo creados`);

    // Crear días de la semana
    const days = [
      ['lunes', 1, false],
      ['martes', 2, false],
      ['miércoles', 3, false],
      ['jueves', 4, false],
      ['viernes', 5, false],
      ['sábado', 6, false],
      ['domingo', 7, true] // Día de descanso
    ];

    const startDate = new Date();
    const monday = new Date(startDate.setDate(startDate.getDate() - startDate.getDay() + 1));

    for (let i = 0; i < days.length; i++) {
      const dayDate = new Date(monday);
      dayDate.setDate(monday.getDate() + i);

      const [dayName, dayNumber, isRest] = days[i];
      const exerciseIds = isRest ? [] : [1, 2, 3, 4, 5];

      await client.query(`
        INSERT INTO home_training_days
        (program_id, dia_semana, fecha, dia_numero, es_descanso, ejercicios_asignados)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [programId, dayName, dayDate.toISOString().split('T')[0], dayNumber, isRest, JSON.stringify(exerciseIds)]);
    }

    console.log('✅ Calendario semanal de ejemplo creado');
    console.log('🎉 Datos de ejemplo instalados exitosamente!');

  } catch (error) {
    console.error('❌ Error creando datos de ejemplo:', error);
  } finally {
    if (client) {
      client.release();
    }
    await pool.end();
  }
}

// Ejecutar según argumentos de línea de comandos
const args = process.argv.slice(2);

if (args.includes('--with-sample-data')) {
  createHomeTables().then(() => createSampleData());
} else {
  createHomeTables();
}

