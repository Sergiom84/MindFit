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

async function exportSchema () {
  console.log('🔄 Exportando esquema de base de datos local...')

  const pool = new Pool(localDbConfig)
  let client

  try {
    client = await pool.connect()
    console.log('✅ Conectado a base de datos local')

    let schemaSQL = ''

    // 1. Exportar secuencias primero
    console.log('🔢 Exportando secuencias...')
    const sequencesQuery = `
      SELECT sequence_name
      FROM information_schema.sequences
      WHERE sequence_schema = 'public'
      ORDER BY sequence_name;
    `

    const sequencesResult = await client.query(sequencesQuery)

    for (const seq of sequencesResult.rows) {
      const seqName = seq.sequence_name
      console.log(`  🔢 Procesando secuencia: ${seqName}`)

      schemaSQL += `\n-- Secuencia: ${seqName}\n`
      schemaSQL += `DROP SEQUENCE IF EXISTS ${seqName} CASCADE;\n`
      schemaSQL += `CREATE SEQUENCE ${seqName};\n`
    }

    // 2. Exportar estructura de tablas
    console.log('📋 Exportando estructura de tablas...')
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    const tablesResult = await client.query(tablesQuery)

    for (const table of tablesResult.rows) {
      const tableName = table.table_name
      console.log(`  📄 Procesando tabla: ${tableName}`)

      // Obtener definición de la tabla
      const tableDefQuery = `
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = $1
        ORDER BY ordinal_position;
      `

      const columnsResult = await client.query(tableDefQuery, [tableName])

      schemaSQL += `\n-- Tabla: ${tableName}\n`
      schemaSQL += `DROP TABLE IF EXISTS ${tableName} CASCADE;\n`
      schemaSQL += `CREATE TABLE ${tableName} (\n`

      const columnDefs = []
      for (const col of columnsResult.rows) {
        let colDef = `    ${col.column_name} `

        // Tipo de dato
        if (col.data_type === 'character varying') {
          colDef += col.character_maximum_length
            ? `VARCHAR(${col.character_maximum_length})`
            : 'VARCHAR'
        } else if (col.data_type === 'numeric') {
          if (col.numeric_precision && col.numeric_scale) {
            colDef += `DECIMAL(${col.numeric_precision},${col.numeric_scale})`
          } else {
            colDef += 'NUMERIC'
          }
        } else if (col.data_type === 'integer') {
          colDef += 'INTEGER'
        } else if (col.data_type === 'timestamp without time zone') {
          colDef += 'TIMESTAMP'
        } else {
          colDef += col.data_type.toUpperCase()
        }

        // Nullable
        if (col.is_nullable === 'NO') {
          colDef += ' NOT NULL'
        }

        // Default
        if (col.column_default) {
          colDef += ` DEFAULT ${col.column_default}`
        }

        columnDefs.push(colDef)
      }

      schemaSQL += `${columnDefs.join(',\n')}\n);\n`
    }

    // 3. Exportar claves primarias
    console.log('🔑 Exportando claves primarias...')
    const primaryKeysQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name,
        string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
      WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public'
      GROUP BY tc.table_name, tc.constraint_name;
    `

    const primaryKeysResult = await client.query(primaryKeysQuery)

    for (const pk of primaryKeysResult.rows) {
      schemaSQL += `\n-- Clave primaria para ${pk.table_name}\n`
      schemaSQL += `ALTER TABLE ${pk.table_name} ADD CONSTRAINT ${pk.constraint_name} PRIMARY KEY (${pk.columns});\n`
    }

    // 4. Exportar claves foráneas
    console.log('🔗 Exportando claves foráneas...')
    const foreignKeysQuery = `
      SELECT 
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
    `

    const foreignKeysResult = await client.query(foreignKeysQuery)

    for (const fk of foreignKeysResult.rows) {
      schemaSQL += `\n-- Clave foránea para ${fk.table_name}\n`
      schemaSQL += `ALTER TABLE ${fk.table_name} ADD CONSTRAINT ${fk.constraint_name} `
      schemaSQL += `FOREIGN KEY (${fk.column_name}) REFERENCES ${fk.foreign_table_name}(${fk.foreign_column_name});\n`
    }

    // 5. Exportar índices
    console.log('📊 Exportando índices...')
    const indexesQuery = `
      SELECT 
        schemaname,
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND indexname NOT LIKE '%_pkey';
    `

    const indexesResult = await client.query(indexesQuery)

    for (const idx of indexesResult.rows) {
      schemaSQL += `\n-- Índice para ${idx.tablename}\n`
      schemaSQL += `${idx.indexdef};\n`
    }

    // 6. Exportar funciones y triggers
    console.log('⚡ Exportando funciones y triggers...')
    const functionsQuery = `
      SELECT 
        routine_name,
        routine_definition
      FROM information_schema.routines
      WHERE routine_schema = 'public'
      AND routine_type = 'FUNCTION';
    `

    const functionsResult = await client.query(functionsQuery)

    for (const func of functionsResult.rows) {
      schemaSQL += `\n-- Función: ${func.routine_name}\n`
      schemaSQL += `${func.routine_definition}\n`
    }

    // Exportar triggers
    const triggersQuery = `
      SELECT 
        trigger_name,
        event_object_table,
        action_statement,
        action_timing,
        event_manipulation
      FROM information_schema.triggers
      WHERE trigger_schema = 'public';
    `

    const triggersResult = await client.query(triggersQuery)

    for (const trigger of triggersResult.rows) {
      schemaSQL += `\n-- Trigger: ${trigger.trigger_name} en ${trigger.event_object_table}\n`
      schemaSQL += `CREATE TRIGGER ${trigger.trigger_name}\n`
      schemaSQL += `    ${trigger.action_timing} ${trigger.event_manipulation} ON ${trigger.event_object_table}\n`
      schemaSQL += '    FOR EACH ROW\n'
      schemaSQL += `    ${trigger.action_statement};\n`
    }

    // Guardar el archivo
    const outputPath = path.join(__dirname, '..', 'database_migrations', 'exported_schema.sql')
    console.log(`📝 Escribiendo ${schemaSQL.length} caracteres al archivo...`)
    fs.writeFileSync(outputPath, schemaSQL)

    console.log(`✅ Esquema exportado exitosamente a: ${outputPath}`)
    console.log(`🔢 Secuencias exportadas: ${sequencesResult.rows.length}`)
    console.log(`📊 Tablas exportadas: ${tablesResult.rows.length}`)
    console.log(`🔑 Claves primarias: ${primaryKeysResult.rows.length}`)
    console.log(`🔗 Claves foráneas: ${foreignKeysResult.rows.length}`)
    console.log(`📊 Índices: ${indexesResult.rows.length}`)
    console.log(`⚡ Funciones: ${functionsResult.rows.length}`)
    console.log(`⚡ Triggers: ${triggersResult.rows.length}`)
  } catch (error) {
    console.error('❌ Error exportando esquema:', error)
  } finally {
    if (client) client.release()
    await pool.end()
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('export-schema.js')) {
  exportSchema()
}

export { exportSchema }
