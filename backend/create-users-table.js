import { Pool } from 'pg'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
})

async function createUsersTable () {
  try {
    const client = await pool.connect()

    console.log('🔧 Creando tabla de usuarios...')

    // Crear tabla users
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        nombre VARCHAR(100),
        apellido VARCHAR(100),
        edad INTEGER,
        sexo VARCHAR(20),
        peso DECIMAL(5,2),
        altura DECIMAL(5,2),
        imc DECIMAL(5,2),
        nivel_actividad VARCHAR(50),
        objetivo VARCHAR(100),
        limitaciones JSONB DEFAULT '{}',
        avatar_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Tabla users creada')

    // Verificar si ya existe el usuario de prueba
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['sergiohernandezlara07@gmail.com']
    )

    if (existingUser.rows.length === 0) {
      // Crear usuario de prueba
      const hashedPassword = await bcrypt.hash('1234', 10)

      await client.query(`
        INSERT INTO users (
          email, password, nombre, apellido, edad, sexo, 
          peso, altura, nivel_actividad, objetivo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        'sergiohernandezlara07@gmail.com',
        hashedPassword,
        'Sergio',
        'Hernández',
        30,
        'masculino',
        75.0,
        175.0,
        'intermedio',
        'Ganar músculo'
      ])

      console.log('✅ Usuario de prueba creado')
      console.log('📧 Email: sergiohernandezlara07@gmail.com')
      console.log('🔑 Password: 1234')
    } else {
      console.log('ℹ️ Usuario de prueba ya existe')
    }

    // Verificar usuarios existentes
    const userCount = await client.query('SELECT COUNT(*) FROM users')
    console.log(`👥 Total de usuarios: ${userCount.rows[0].count}`)

    client.release()
    await pool.end()

    console.log('🎉 ¡Tabla de usuarios configurada correctamente!')
  } catch (error) {
    console.error('❌ Error:', error)
    await pool.end()
  }
}

createUsersTable()
