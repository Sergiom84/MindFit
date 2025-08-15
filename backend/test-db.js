import { testConnection, pool } from './db.js'

import fs from 'fs'
import path from 'path'

async function initializeDatabase () {
  console.log('🔄 Probando conexión a la base de datos...')

  const isConnected = await testConnection()

  if (!isConnected) {
    console.log('❌ No se pudo conectar a la base de datos')
    return
  }

  try {
    // Leer el script SQL
    const sqlScript = fs.readFileSync('../scripts/init.sql', 'utf8')

    console.log('🔄 Ejecutando script de inicialización...')

    // Ejecutar el script
    await pool.query(sqlScript)

    console.log('✅ Base de datos inicializada correctamente')

    // Verificar que la tabla se creó
    const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
    console.log('📋 Tablas creadas:', result.rows.map(row => row.table_name))
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Las tablas ya existen en la base de datos')

      // Verificar tablas existentes
      const result = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
      console.log('📋 Tablas existentes:', result.rows.map(row => row.table_name))
    } else {
      console.error('❌ Error ejecutando script SQL:', error.message)
    }
  }

  process.exit(0)
}

initializeDatabase()
