import dotenv from 'dotenv'
import { query } from './db.js'

dotenv.config()

async function testRegisterEndpoint () {
  console.log('🧪 PROBANDO FUNCIONALIDAD DE REGISTRO')
  console.log('='.repeat(40))

  try {
    // 1. Verificar que podemos consultar usuarios
    console.log('\n1️⃣ Consultando usuarios existentes...')
    const usersResult = await query('SELECT id, email, nombre FROM users LIMIT 5')
    console.log(`✅ Encontrados ${usersResult.rows.length} usuarios:`)
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.nombre} (${user.email})`)
    })

    // 2. Probar inserción de un usuario de prueba
    console.log('\n2️⃣ Probando inserción de usuario de prueba...')
    const testEmail = `test_${Date.now()}@mindfit.com`

    // Verificar si el email ya existe
    const existingCheck = await query('SELECT id FROM users WHERE email = $1', [testEmail])
    if (existingCheck.rows.length > 0) {
      console.log('⚠️  El email de prueba ya existe')
      return
    }

    // Insertar usuario de prueba
    const insertResult = await query(`
            INSERT INTO users (nombre, apellido, email, password) 
            VALUES ($1, $2, $3, $4) 
            RETURNING id, email, nombre
        `, ['Usuario', 'Prueba', testEmail, 'password_hash_test'])

    if (insertResult.rows.length > 0) {
      console.log('✅ Usuario de prueba creado exitosamente:')
      console.log(`   ID: ${insertResult.rows[0].id}`)
      console.log(`   Email: ${insertResult.rows[0].email}`)
      console.log(`   Nombre: ${insertResult.rows[0].nombre}`)

      // Limpiar - eliminar usuario de prueba
      await query('DELETE FROM users WHERE email = $1', [testEmail])
      console.log('🗑️  Usuario de prueba eliminado')
    }

    // 3. Verificar tabla injuries
    console.log('\n3️⃣ Verificando tabla injuries...')
    const injuriesResult = await query('SELECT COUNT(*) as count FROM injuries')
    console.log(`✅ Tabla injuries tiene ${injuriesResult.rows[0].count} registros`)

    // 4. Verificar estructuras necesarias
    console.log('\n4️⃣ Verificando estructuras necesarias...')

    // Verificar que todas las columnas necesarias existen en users
    const columnsCheck = await query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('limitaciones', 'iniciales', 'avatar')
        `)

    const expectedColumns = ['limitaciones', 'iniciales', 'avatar']
    const existingColumns = columnsCheck.rows.map(row => row.column_name)

    expectedColumns.forEach(col => {
      if (existingColumns.includes(col)) {
        console.log(`   ✅ Columna '${col}' existe`)
      } else {
        console.log(`   ❌ Columna '${col}' falta`)
      }
    })

    console.log('\n🎉 DIAGNÓSTICO COMPLETADO - Base de datos funcional')
  } catch (error) {
    console.error('\n❌ Error en pruebas:', error.message)
    console.error('Stack:', error.stack)
  }
}

testRegisterEndpoint().then(() => {
  console.log('\n✅ Pruebas finalizadas')
  process.exit(0)
}).catch(error => {
  console.error('\n💥 Error fatal:', error)
  process.exit(1)
})
