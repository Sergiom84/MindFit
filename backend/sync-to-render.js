import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import { exportSchema } from './export-schema.js'
import { exportData } from './export-data.js'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de la base de datos de Render
const getRenderDbConfig = () => {
  if (!process.env.RENDER_PGHOST || !process.env.RENDER_PGUSER || !process.env.RENDER_PGPASSWORD) {
    throw new Error('❌ Faltan credenciales de Render. Configura RENDER_PGHOST, RENDER_PGUSER, RENDER_PGPASSWORD en .env')
  }

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

async function testRenderConnection () {
  console.log('🔄 Probando conexión a base de datos de Render...')

  try {
    const renderConfig = getRenderDbConfig()
    const pool = new Pool(renderConfig)
    const client = await pool.connect()

    console.log(`✅ Conexión a Render establecida: ${renderConfig.host}/${renderConfig.database}`)

    // Verificar versión de PostgreSQL
    const versionResult = await client.query('SELECT version()')
    console.log(`📊 Versión PostgreSQL: ${versionResult.rows[0].version.split(' ')[1]}`)

    client.release()
    await pool.end()
    return true
  } catch (error) {
    console.error('❌ Error conectando a Render:', error.message)
    return false
  }
}

async function executeSQL (pool, sqlContent, description) {
  console.log(`🔄 ${description}...`)

  const client = await pool.connect()

  try {
    // Dividir el SQL en statements individuales
    const statements = sqlContent
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
          // Ignorar errores de "ya existe" para hacer el script idempotente
          if (error.message.includes('already exists') ||
              error.message.includes('does not exist') ||
              error.message.includes('duplicate key')) {
            console.log(`⚠️ Advertencia ignorada: ${error.message.split('\n')[0]}`)
          } else {
            throw error
          }
        }
      }
    }

    console.log(`✅ ${description} completado (${executedCount} statements ejecutados)`)
  } finally {
    client.release()
  }
}

async function syncToRender () {
  console.log('🚀 Iniciando sincronización con base de datos de Render...\n')

  try {
    // 1. Verificar conexión a Render
    const renderConnected = await testRenderConnection()
    if (!renderConnected) {
      console.log('\n❌ No se pudo conectar a Render. Verifica las credenciales.')
      return
    }

    // 2. Exportar esquema y datos locales
    console.log('\n📤 Exportando desde base de datos local...')
    await exportSchema()
    await exportData()

    // 3. Conectar a Render
    console.log('\n🔄 Conectando a base de datos de Render...')
    const renderConfig = getRenderDbConfig()
    const renderPool = new Pool(renderConfig)

    // 4. Aplicar esquema
    const schemaPath = path.join(__dirname, '..', 'database_migrations', 'exported_schema.sql')
    if (fs.existsSync(schemaPath)) {
      const schemaSQL = fs.readFileSync(schemaPath, 'utf8')
      await executeSQL(renderPool, schemaSQL, 'Aplicando esquema de base de datos')
    } else {
      console.log('⚠️ Archivo de esquema no encontrado')
    }

    // 5. Aplicar datos
    const dataPath = path.join(__dirname, '..', 'database_migrations', 'exported_data.sql')
    if (fs.existsSync(dataPath)) {
      const dataSQL = fs.readFileSync(dataPath, 'utf8')
      await executeSQL(renderPool, dataSQL, 'Importando datos')
    } else {
      console.log('⚠️ Archivo de datos no encontrado')
    }

    // 6. Verificar sincronización
    console.log('\n🔍 Verificando sincronización...')
    const client = await renderPool.connect()

    try {
      // Verificar tablas
      const tablesResult = await client.query(`
        SELECT table_name, 
               (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
        FROM information_schema.tables t
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
      `)

      console.log('📊 Tablas en Render:')
      for (const table of tablesResult.rows) {
        const countResult = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`)
        console.log(`  📄 ${table.table_name}: ${table.column_count} columnas, ${countResult.rows[0].count} registros`)
      }
    } finally {
      client.release()
    }

    await renderPool.end()

    console.log('\n✅ Sincronización completada exitosamente!')
    console.log('🎉 Tu base de datos local ha sido sincronizada con Render.')
  } catch (error) {
    console.error('\n❌ Error durante la sincronización:', error)
  }
}

// Función para mostrar ayuda
function showHelp () {
  console.log(`
🔄 Script de Sincronización MindFit - Base de Datos Local → Render

Uso:
  node sync-to-render.js [opción]

Opciones:
  --test-connection    Solo probar conexión a Render
  --export-only       Solo exportar desde local (no sincronizar)
  --help              Mostrar esta ayuda

Configuración requerida en .env:
  RENDER_PGHOST=tu_host_render.com
  RENDER_PGUSER=tu_usuario_render
  RENDER_PGPASSWORD=tu_password_render
  RENDER_PGDATABASE=tu_database_render
  RENDER_PGPORT=5432

Ejemplo:
  node sync-to-render.js --test-connection
  node sync-to-render.js
`)
}

// Manejo de argumentos de línea de comandos
const args = process.argv.slice(2)

if (args.includes('--help')) {
  showHelp()
} else if (args.includes('--test-connection')) {
  testRenderConnection()
} else if (args.includes('--export-only')) {
  console.log('📤 Exportando solo desde base de datos local...')
  await exportSchema()
  await exportData()
  console.log('✅ Exportación completada')
} else {
  // Ejecutar sincronización completa
  syncToRender()
}

export { syncToRender, testRenderConnection }
