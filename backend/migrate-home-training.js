import { Pool } from 'pg'
import fs from 'fs'
import dotenv from 'dotenv'

dotenv.config()

function getRenderDbConfig () {
  return {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  }
}

async function migrateHomeTraining () {
  console.log('🚀 Ejecutando migración de entrenamientos en casa...')

  const renderConfig = getRenderDbConfig()
  const pool = new Pool(renderConfig)
  let client

  try {
    client = await pool.connect()
    console.log('✅ Conectado a Render')

    // Leer el archivo de migración
    const migrationSQL = fs.readFileSync('../database_migrations/add_home_training_tables.sql', 'utf8')

    // Dividir en statements individuales
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))

    console.log(`🔄 Ejecutando ${statements.length} statements...`)

    let successCount = 0
    for (const statement of statements) {
      try {
        await client.query(statement)
        successCount++
      } catch (error) {
        console.log(`⚠️ Error en statement: ${error.message}`)
        console.log(`Statement: ${statement.substring(0, 100)}...`)
      }
    }

    console.log(`✅ Migración completada (${successCount} statements ejecutados)`)

    // Verificar tablas creadas
    const tablesResult = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_name LIKE 'home_training%'
      ORDER BY table_name, ordinal_position
    `)

    console.log('📊 Tablas de entrenamiento en casa:')
    const tableGroups = {}
    tablesResult.rows.forEach(row => {
      if (!tableGroups[row.table_name]) {
        tableGroups[row.table_name] = []
      }
      tableGroups[row.table_name].push(row.column_name)
    })

    Object.entries(tableGroups).forEach(([tableName, columns]) => {
      console.log(`  📄 ${tableName}: ${columns.length} columnas`)
    })
  } catch (error) {
    console.error('❌ Error en migración:', error)
  } finally {
    if (client) {
      client.release()
    }
    await pool.end()
  }
}

migrateHomeTraining()
