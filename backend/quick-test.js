import { testConnection, query } from './db.js'

async function quickTest () {
  console.log('🔄 Probando conexión a mindfit...')

  try {
    const isConnected = await testConnection()

    if (isConnected) {
      console.log('✅ Conexión exitosa')

      // Verificar tablas
      const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
      console.log('📋 Tablas encontradas:', tables.rows.map(r => r.table_name))

      // Verificar usuarios
      const users = await query('SELECT COUNT(*) as total FROM users')
      console.log('👥 Total usuarios:', users.rows[0].total)
    } else {
      console.log('❌ Error de conexión')
    }
  } catch (error) {
    console.error('❌ Error:', error.message)
  }

  process.exit(0)
}

quickTest()
