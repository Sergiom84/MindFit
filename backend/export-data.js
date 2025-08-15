import pg from 'pg'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración de la base de datos local
const localDbConfig = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'mindfit',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432
}

// Función para escapar valores SQL
function escapeSQLValue (value) {
  if (value === null || value === undefined) {
    return 'NULL'
  }

  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE'
  }

  if (value instanceof Date) {
    return `'${value.toISOString()}'`
  }

  if (typeof value === 'object') {
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`
  }

  return value.toString()
}

async function exportData () {
  console.log('🔄 Exportando datos de base de datos local...')

  const pool = new Pool(localDbConfig)
  let client

  try {
    client = await pool.connect()
    console.log('✅ Conectado a base de datos local')

    let dataSQL = ''

    // Obtener lista de tablas en orden de dependencias
    console.log('📋 Obteniendo lista de tablas...')
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY 
        CASE 
          WHEN table_name = 'users' THEN 1
          WHEN table_name = 'injuries' THEN 2
          ELSE 3
        END,
        table_name;
    `

    const tablesResult = await client.query(tablesQuery)

    dataSQL += '-- Datos exportados desde base de datos local\n'
    dataSQL += `-- Fecha de exportación: ${new Date().toISOString()}\n\n`

    // Deshabilitar triggers y constraints temporalmente
    dataSQL += '-- Deshabilitar triggers y constraints\n'
    dataSQL += 'SET session_replication_role = replica;\n\n'

    let totalRecords = 0

    for (const table of tablesResult.rows) {
      const tableName = table.table_name
      console.log(`  📄 Exportando datos de tabla: ${tableName}`)

      // Obtener datos de la tabla
      const dataQuery = `SELECT * FROM ${tableName} ORDER BY id`
      const dataResult = await client.query(dataQuery)

      if (dataResult.rows.length === 0) {
        console.log(`    ⚠️ Tabla ${tableName} está vacía`)
        continue
      }

      console.log(`    📊 ${dataResult.rows.length} registros encontrados`)
      totalRecords += dataResult.rows.length

      // Obtener nombres de columnas
      const columns = Object.keys(dataResult.rows[0])

      dataSQL += `-- Datos para tabla: ${tableName}\n`
      dataSQL += `DELETE FROM ${tableName};\n`

      // Generar INSERT statements
      const batchSize = 100 // Insertar en lotes de 100
      for (let i = 0; i < dataResult.rows.length; i += batchSize) {
        const batch = dataResult.rows.slice(i, i + batchSize)

        dataSQL += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`

        const values = batch.map(row => {
          const rowValues = columns.map(col => escapeSQLValue(row[col]))
          return `    (${rowValues.join(', ')})`
        })

        dataSQL += `${values.join(',\n')};\n\n`
      }

      // Actualizar secuencia si existe
      const sequenceQuery = `
        SELECT column_name, column_default
        FROM information_schema.columns
        WHERE table_name = $1 
        AND column_default LIKE 'nextval%'
      `

      const sequenceResult = await client.query(sequenceQuery, [tableName])

      if (sequenceResult.rows.length > 0) {
        const seqCol = sequenceResult.rows[0]
        const sequenceName = seqCol.column_default.match(/'([^']+)'/)[1]

        dataSQL += `-- Actualizar secuencia para ${tableName}\n`
        dataSQL += `SELECT setval('${sequenceName}', (SELECT COALESCE(MAX(${seqCol.column_name}), 1) FROM ${tableName}));\n\n`
      }
    }

    // Rehabilitar triggers y constraints
    dataSQL += '-- Rehabilitar triggers y constraints\n'
    dataSQL += 'SET session_replication_role = DEFAULT;\n\n'

    // Guardar el archivo
    const outputPath = path.join(__dirname, '..', 'database_migrations', 'exported_data.sql')
    fs.writeFileSync(outputPath, dataSQL)

    console.log(`✅ Datos exportados exitosamente a: ${outputPath}`)
    console.log(`📊 Tablas procesadas: ${tablesResult.rows.length}`)
    console.log(`📊 Total de registros: ${totalRecords}`)

    // Crear resumen
    const summaryPath = path.join(__dirname, '..', 'database_migrations', 'export_summary.json')
    const summary = {
      exportDate: new Date().toISOString(),
      tablesCount: tablesResult.rows.length,
      totalRecords,
      tables: tablesResult.rows.map(t => t.table_name),
      files: {
        schema: 'exported_schema.sql',
        data: 'exported_data.sql'
      }
    }

    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2))
    console.log(`📋 Resumen guardado en: ${summaryPath}`)
  } catch (error) {
    console.error('❌ Error exportando datos:', error)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('export-data.js')) {
  exportData()
}

export { exportData }
