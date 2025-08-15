import pg from 'pg'
import fs from 'fs'

const { Pool } = pg

// Primero nos conectamos a la base de datos postgres (por defecto)
const adminPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Base de datos por defecto
  password: 'postgres',
  port: 5432
})

async function createDatabase () {
  try {
    console.log('🔄 Conectando a PostgreSQL...')

    // Probar conexión
    const client = await adminPool.connect()
    console.log('✅ Conectado a PostgreSQL')

    // Crear la base de datos mindfit
    console.log('🔄 Creando base de datos mindfit...')
    await client.query('CREATE DATABASE mindfit;')
    console.log('✅ Base de datos mindfit creada exitosamente')

    client.release()
    await adminPool.end()

    // Ahora conectarse a la nueva base de datos mindfit
    const mindFitPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'mindfit',
      password: 'postgres',
      port: 5432
    })

    console.log('🔄 Conectando a la base de datos mindfit...')
    const mindFitClient = await mindFitPool.connect()
    console.log('✅ Conectado a mindfit')

    // Leer y ejecutar el script SQL
    console.log('🔄 Ejecutando script de inicialización...')
    const sqlScript = fs.readFileSync('../scripts/init.sql', 'utf8')

    await mindFitClient.query(sqlScript)
    console.log('✅ Tablas creadas exitosamente')

    // Verificar las tablas creadas
    const result = await mindFitClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `)

    console.log('📋 Tablas creadas:', result.rows.map(row => row.table_name))

    mindFitClient.release()
    await mindFitPool.end()

    console.log('🎉 ¡Base de datos mindfit configurada completamente!')
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  La base de datos mindfit ya existe')
    } else {
      console.error('❌ Error:', error.message)
    }
  }

  process.exit(0)
}

createDatabase()
