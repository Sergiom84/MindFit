import pg from 'pg'

const { Pool } = pg

// Configuración de la base de datos de Render
const renderConfig = {
  user: 'mindfit_user',
  host: 'dpg-d28teajuibrs73dus4u0-a.frankfurt-postgres.render.com',
  database: 'mindfit_db',
  password: 'ki879BUruwiv0NnSRs5Sewu0mYtAub45',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // Render requiere SSL
  },
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
}

async function testRenderConnection () {
  console.log('🔄 Iniciando prueba de conexión a Render...')
  console.log('📍 Host:', renderConfig.host)
  console.log('🗄️ Database:', renderConfig.database)
  console.log('👤 User:', renderConfig.user)

  const pool = new Pool(renderConfig)

  try {
    // Probar conexión básica
    console.log('\n1️⃣ Probando conexión básica...')
    const client = await pool.connect()
    console.log('✅ Conexión exitosa!')

    // Probar consulta simple
    console.log('\n2️⃣ Probando consulta simple...')
    const result = await client.query('SELECT NOW() as current_time, version() as db_version')
    console.log('✅ Consulta exitosa!')
    console.log('⏰ Tiempo actual del servidor:', result.rows[0].current_time)
    console.log('🗄️ Versión de PostgreSQL:', result.rows[0].db_version.split(' ')[0])

    // Verificar tablas existentes
    console.log('\n3️⃣ Verificando tablas existentes...')
    const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `)

    if (tablesResult.rows.length > 0) {
      console.log('✅ Tablas encontradas:')
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`)
      })
    } else {
      console.log('⚠️  No se encontraron tablas en el esquema public')
    }

    // Verificar tabla users específicamente
    console.log('\n4️⃣ Verificando tabla users...')
    try {
      const usersCheck = await client.query(`
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'users' 
                ORDER BY ordinal_position
            `)

      if (usersCheck.rows.length > 0) {
        console.log('✅ Tabla users encontrada con columnas:')
        usersCheck.rows.forEach(col => {
          console.log(`   - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
        })

        // Contar usuarios
        const countResult = await client.query('SELECT COUNT(*) as user_count FROM users')
        console.log(`📊 Total de usuarios: ${countResult.rows[0].user_count}`)
      } else {
        console.log('❌ Tabla users no encontrada')
      }
    } catch (error) {
      console.log('❌ Error al verificar tabla users:', error.message)
    }

    // Verificar otras tablas importantes
    console.log('\n5️⃣ Verificando otras tablas importantes...')
    const importantTables = ['routines', 'exercises', 'user_routines', 'injuries']

    for (const tableName of importantTables) {
      try {
        const checkTable = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`)
        console.log(`✅ ${tableName}: ${checkTable.rows[0].count} registros`)
      } catch (error) {
        console.log(`❌ ${tableName}: No existe o error - ${error.message}`)
      }
    }

    client.release()
    console.log('\n🎉 Prueba de conexión completada exitosamente!')
  } catch (error) {
    console.error('\n❌ Error de conexión:', error.message)
    console.error('🔍 Detalles del error:', error)

    // Diagnósticos adicionales
    console.log('\n🔧 Diagnósticos:')
    if (error.code === 'ENOTFOUND') {
      console.log('- El hostname no se puede resolver')
    } else if (error.code === 'ECONNREFUSED') {
      console.log('- El servidor rechazó la conexión')
    } else if (error.code === 'ETIMEDOUT') {
      console.log('- Tiempo de conexión agotado')
    } else if (error.message.includes('password')) {
      console.log('- Error de autenticación (usuario/contraseña)')
    } else if (error.message.includes('SSL')) {
      console.log('- Error de SSL/TLS')
    }
  } finally {
    await pool.end()
    console.log('\n🔌 Pool de conexiones cerrado')
  }
}

// Ejecutar la prueba
testRenderConnection()
  .then(() => {
    console.log('\n✅ Script completado')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })

export { testRenderConnection }
