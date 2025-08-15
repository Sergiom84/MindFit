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

// Configuración de la base de datos de Render
const getRenderDbConfig = () => {
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

async function importDataToRender () {
  console.log('🚀 Importando datos desde base de datos local a Render...')

  const localPool = new Pool(localDbConfig)
  const renderPool = new Pool(getRenderDbConfig())

  let localClient, renderClient

  try {
    // Conectar a ambas bases de datos
    localClient = await localPool.connect()
    renderClient = await renderPool.connect()

    console.log('✅ Conectado a base de datos local')
    console.log('✅ Conectado a base de datos de Render')

    // 1. Importar usuarios
    console.log('\n👥 Importando usuarios...')

    // Limpiar tabla users en Render (excepto el usuario de prueba que ya existe)
    await renderClient.query('DELETE FROM users WHERE email != $1', ['test@example.com'])

    // Obtener usuarios de la base local
    const usersResult = await localClient.query('SELECT * FROM users ORDER BY id')

    console.log(`📊 ${usersResult.rows.length} usuarios encontrados en local`)

    for (const user of usersResult.rows) {
      try {
        // Verificar si el usuario ya existe en Render
        const existingUser = await renderClient.query('SELECT id FROM users WHERE email = $1', [user.email])

        if (existingUser.rows.length > 0) {
          console.log(`  ⚠️ Usuario ${user.email} ya existe, actualizando...`)

          // Actualizar usuario existente
          const updateQuery = `
            UPDATE users SET 
              nombre = $1, apellido = $2, password = $3, avatar = $4, iniciales = $5,
              nivel = $6, edad = $7, sexo = $8, peso = $9, altura = $10, imc = $11,
              nivel_actividad = $12, experiencia = $13, años_entrenando = $14,
              metodologia_preferida = $15, frecuencia_semanal = $16, grasa_corporal = $17,
              masa_muscular = $18, agua_corporal = $19, metabolismo_basal = $20,
              cintura = $21, pecho = $22, brazos = $23, muslos = $24, cuello = $25,
              antebrazos = $26, historial_medico = $27, limitaciones = $28, alergias = $29,
              medicamentos = $30, objetivo_principal = $31, meta_peso = $32, meta_grasa = $33,
              enfoque = $34, horario_preferido = $35, comidas_diarias = $36,
              suplementacion = $37, alimentos_excluidos = $38, updated_at = CURRENT_TIMESTAMP
            WHERE email = $39
          `

          await renderClient.query(updateQuery, [
            user.nombre, user.apellido, user.password, user.avatar, user.iniciales,
            user.nivel, user.edad, user.sexo, user.peso, user.altura, user.imc,
            user.nivel_actividad, user.experiencia, user.años_entrenando,
            user.metodologia_preferida, user.frecuencia_semanal, user.grasa_corporal,
            user.masa_muscular, user.agua_corporal, user.metabolismo_basal,
            user.cintura, user.pecho, user.brazos, user.muslos, user.cuello,
            user.antebrazos, user.historial_medico, user.limitaciones || '[]',
            user.alergias, user.medicamentos, user.objetivo_principal,
            user.meta_peso, user.meta_grasa, user.enfoque, user.horario_preferido,
            user.comidas_diarias, user.suplementacion, user.alimentos_excluidos,
            user.email
          ])
        } else {
          console.log(`  ➕ Creando usuario ${user.email}...`)

          // Insertar nuevo usuario
          const insertQuery = `
            INSERT INTO users (
              nombre, apellido, email, password, avatar, iniciales, nivel, edad, sexo,
              peso, altura, imc, nivel_actividad, experiencia, años_entrenando,
              metodologia_preferida, frecuencia_semanal, grasa_corporal, masa_muscular,
              agua_corporal, metabolismo_basal, cintura, pecho, brazos, muslos, cuello,
              antebrazos, historial_medico, limitaciones, alergias, medicamentos,
              objetivo_principal, meta_peso, meta_grasa, enfoque, horario_preferido,
              comidas_diarias, suplementacion, alimentos_excluidos, created_at, updated_at
            ) VALUES (
              $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
              $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32,
              $33, $34, $35, $36, $37, $38, $39, $40, $41
            )
          `

          await renderClient.query(insertQuery, [
            user.nombre, user.apellido, user.email, user.password, user.avatar,
            user.iniciales, user.nivel, user.edad, user.sexo, user.peso, user.altura,
            user.imc, user.nivel_actividad, user.experiencia, user.años_entrenando,
            user.metodologia_preferida, user.frecuencia_semanal, user.grasa_corporal,
            user.masa_muscular, user.agua_corporal, user.metabolismo_basal,
            user.cintura, user.pecho, user.brazos, user.muslos, user.cuello,
            user.antebrazos, user.historial_medico, user.limitaciones || '[]',
            user.alergias, user.medicamentos, user.objetivo_principal,
            user.meta_peso, user.meta_grasa, user.enfoque, user.horario_preferido,
            user.comidas_diarias, user.suplementacion, user.alimentos_excluidos,
            user.created_at, user.updated_at
          ])
        }
      } catch (error) {
        console.log(`  ❌ Error procesando usuario ${user.email}:`, error.message)
      }
    }

    // 2. Importar lesiones
    console.log('\n🩹 Importando lesiones...')

    // Limpiar tabla injuries en Render
    await renderClient.query('DELETE FROM injuries')

    // Obtener lesiones de la base local
    const injuriesResult = await localClient.query('SELECT * FROM injuries ORDER BY id')

    console.log(`📊 ${injuriesResult.rows.length} lesiones encontradas en local`)

    for (const injury of injuriesResult.rows) {
      try {
        // Verificar que el usuario existe en Render
        const userExists = await renderClient.query('SELECT id FROM users WHERE id = $1', [injury.user_id])

        if (userExists.rows.length === 0) {
          console.log(`  ⚠️ Usuario ${injury.user_id} no existe en Render, saltando lesión...`)
          continue
        }

        console.log(`  ➕ Creando lesión: ${injury.titulo || 'Sin título'}...`)

        const insertInjuryQuery = `
          INSERT INTO injuries (
            user_id, titulo, zona, tipo, gravedad, fecha_inicio, fecha_fin,
            causa, tratamiento, estado, notas, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `

        await renderClient.query(insertInjuryQuery, [
          injury.user_id, injury.titulo, injury.zona, injury.tipo, injury.gravedad,
          injury.fecha_inicio, injury.fecha_fin, injury.causa || injury.tratamiento,
          injury.tratamiento, injury.estado, injury.notas,
          injury.created_at, injury.updated_at
        ])
      } catch (error) {
        console.log('  ❌ Error procesando lesión:', error.message)
      }
    }

    // 3. Verificar importación
    console.log('\n🔍 Verificando importación...')

    const renderUsersCount = await renderClient.query('SELECT COUNT(*) FROM users')
    const renderInjuriesCount = await renderClient.query('SELECT COUNT(*) FROM injuries')

    console.log(`✅ Usuarios en Render: ${renderUsersCount.rows[0].count}`)
    console.log(`✅ Lesiones en Render: ${renderInjuriesCount.rows[0].count}`)

    console.log('\n🎉 Importación completada exitosamente!')
  } catch (error) {
    console.error('❌ Error durante la importación:', error)
  } finally {
    if (localClient) localClient.release()
    if (renderClient) renderClient.release()
    await localPool.end()
    await renderPool.end()
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('import-data-to-render.js')) {
  importDataToRender()
}

export { importDataToRender }
