import express from 'express'
import { query } from '../db.js'

// --- Helpers ---
// (Traemos una función de ia.js para obtener el perfil del usuario de forma consistente)
async function fetchUserProfile (userId) {
  try {
    const u = await query('SELECT id, nombre, nivel, created_at FROM users WHERE id = $1 LIMIT 1', [userId])
    return u?.rows?.[0] || null
  } catch (e) {
    console.error(`Error fetching profile for userId=${userId}:`, e)
    return null
  }
}

async function hasColumn (tableName, columnName) {
  const r = await query(
    'SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2',
    [tableName, columnName])
  return r.rows.length > 0
}

const router = express.Router()

// Crear nuevo programa de entrenamiento en casa
router.post('/create-program', async (req, res) => {
  try {
    const {
      userId,
      titulo,
      descripcion,
      equipamiento,
      tipoEntrenamiento,
      duracionTotal,
      frecuencia,
      enfoque,
      ejercicios
    } = req.body

    console.log('📝 Creando programa de entrenamiento:', { userId, titulo, equipamiento, tipoEntrenamiento })

    // Validar datos requeridos
    if (!userId || !titulo || !equipamiento || !tipoEntrenamiento || !ejercicios) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: userId, titulo, equipamiento, tipoEntrenamiento, ejercicios'
      })
    }

    // Crear programa
    const programResult = await query(
      `INSERT INTO home_training_programs
       (user_id, titulo, descripcion, equipamiento, tipo_entrenamiento, duracion_total, frecuencia, enfoque, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
       RETURNING id`,
      [userId, titulo, descripcion || 'Entrenamiento personalizado', equipamiento, tipoEntrenamiento, duracionTotal || '30-45 min', frecuencia || '4-5 días/semana', enfoque || 'Entrenamiento funcional']
    )

    const programId = programResult.rows[0].id
    console.log('✅ Programa creado con ID:', programId)

    // Insertar ejercicios
    console.log(`📋 Insertando ${ejercicios.length} ejercicios...`)
    for (let i = 0; i < ejercicios.length; i++) {
      const ejercicio = ejercicios[i]

      // Validar datos del ejercicio
      if (!ejercicio.nombre || !ejercicio.series || !ejercicio.tipo) {
        console.log(`⚠️ Ejercicio ${i + 1} incompleto:`, ejercicio)
        continue
      }

      await query(
        `INSERT INTO home_training_exercises
         (program_id, nombre, descripcion, series, repeticiones, duracion, descanso, tipo, consejos, orden)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          programId,
          ejercicio.nombre,
          ejercicio.descripcion || '',
          ejercicio.series || 3,
          ejercicio.repeticiones || null,
          ejercicio.duracion || null,
          ejercicio.descanso || 60,
          ejercicio.tipo,
          JSON.stringify(ejercicio.consejos || []),
          i + 1
        ]
      )
      console.log(`✅ Ejercicio ${i + 1}: ${ejercicio.nombre}`)
    }

    // Crear días de la semana
    console.log('📅 Creando calendario semanal...')
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
    const fechaInicio = new Date()

    // Calcular el lunes de esta semana
    const monday = new Date(fechaInicio)
    monday.setDate(fechaInicio.getDate() - fechaInicio.getDay() + 1)

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(monday)
      fecha.setDate(monday.getDate() + i)

      const esDescanso = i === 6 // Domingo descanso
      const ejerciciosIds = []

      if (!esDescanso) {
        // Distribuir ejercicios a lo largo de la semana
        const ejerciciosPorDia = Math.ceil(ejercicios.length / 6) // 6 días de entrenamiento
        const inicio = (i % 6) * ejerciciosPorDia
        const fin = Math.min(inicio + ejerciciosPorDia, ejercicios.length)

        for (let j = inicio; j < fin; j++) {
          ejerciciosIds.push(j + 1)
        }

        // Si no hay suficientes ejercicios, usar todos
        if (ejerciciosIds.length === 0) {
          for (let j = 0; j < ejercicios.length; j++) {
            ejerciciosIds.push(j + 1)
          }
        }
      }

      await query(
        `INSERT INTO home_training_days
         (program_id, dia_semana, fecha, dia_numero, es_descanso, ejercicios_asignados)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          programId,
          diasSemana[i],
          fecha.toISOString().split('T')[0],
          i + 1,
          esDescanso,
          JSON.stringify(ejerciciosIds)
        ]
      )

      console.log(`✅ ${diasSemana[i]}: ${esDescanso ? 'Descanso' : `${ejerciciosIds.length} ejercicios`}`)
    }

    res.json({
      success: true,
      programId,
      message: 'Programa de entrenamiento creado exitosamente'
    })
  } catch (error) {
    console.error('Error creando programa:', error)
    res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    })
  }
})

// Obtener programa activo del usuario
router.get('/active-program/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const programResult = await query(
      `SELECT * FROM home_training_programs 
       WHERE user_id = $1 AND estado = 'activo' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    )

    if (programResult.rows.length === 0) {
      return res.json({
        success: true,
        program: null
      })
    }

    const program = programResult.rows[0]

    // Obtener ejercicios del programa
    const exercisesResult = await query(
      `SELECT * FROM home_training_exercises 
       WHERE program_id = $1 ORDER BY orden`,
      [program.id]
    )

    // Obtener días del programa
    const daysResult = await query(
      `SELECT * FROM home_training_days 
       WHERE program_id = $1 ORDER BY dia_numero`,
      [program.id]
    )

    res.json({
      success: true,
      program: {
        ...program,
        ejercicios: exercisesResult.rows,
        dias: daysResult.rows
      }
    })
  } catch (error) {
    console.error('Error obteniendo programa:', error)
    res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    })
  }
})

// Completar día de entrenamiento
router.post('/complete-day', async (req, res) => {
  try {
    const { dayId, userId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales, dificultadPercibida, notas } = req.body

    console.log('🎯 Completando día de entrenamiento:', { dayId, userId, duracionMinutos, ejerciciosCompletados })

    // Validar datos requeridos
    if (!dayId || !userId || !duracionMinutos || ejerciciosCompletados === undefined || ejerciciosTotales === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: dayId, userId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales'
      })
    }

    // Verificar que el día existe y pertenece al usuario
    const dayCheck = await query(
      `SELECT htd.*, htp.user_id, htp.id as program_id
       FROM home_training_days htd
       JOIN home_training_programs htp ON htd.program_id = htp.id
       WHERE htd.id = $1 AND htp.user_id = $2`,
      [dayId, userId]
    )

    if (dayCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Día de entrenamiento no encontrado o no pertenece al usuario'
      })
    }

    const day = dayCheck.rows[0]

    // Verificar que el día no esté ya completado
    if (day.estado === 'completado') {
      return res.status(400).json({
        success: false,
        error: 'Este día ya está completado'
      })
    }

    // Actualizar día como completado
    await query(
      `UPDATE home_training_days
       SET estado = 'completado',
           ejercicios_completados = $1,
           tiempo_total_minutos = $2,
           fecha_completado = CURRENT_TIMESTAMP,
           notas = $3,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4`,
      [ejerciciosCompletados, duracionMinutos, notas || null, dayId]
    )

    console.log('✅ Día actualizado como completado')

    // Registrar sesión para estadísticas
    const sessionResult = await query(
      `INSERT INTO home_training_sessions
       (user_id, program_id, day_id, duracion_minutos, ejercicios_completados, ejercicios_totales, dificultad_percibida, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, day.program_id, dayId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales, dificultadPercibida || null, notas || null]
    )

    console.log('✅ Sesión registrada con ID:', sessionResult.rows[0].id)

    // El trigger automáticamente actualizará el progreso del programa

    res.json({
      success: true,
      message: 'Día completado exitosamente',
      sessionId: sessionResult.rows[0].id
    })
  } catch (error) {
    console.error('❌ Error completando día:', error)
    res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    })
  }
})

// Obtener estadísticas del usuario
router.get('/stats', async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta el parámetro userId' })
    }

    console.log('📊 Obteniendo estadísticas para usuario:', userId)

    // Detectar qué esquema de tabla `workout_sessions` usar (legado vs nuevo)
    const hasNewSchema = await hasColumn('workout_sessions', 'session_status') && await hasColumn('workout_sessions', 'duration_sec')

    let stats, streakDays

    // 1. Obtener estadísticas agregadas
    if (hasNewSchema) {
      const result = await query(
        `SELECT
          COUNT(*) FILTER (WHERE session_status = 'completed') AS sessions_completed,
          COALESCE(SUM(duration_sec), 0) AS total_duration_sec
        FROM workout_sessions WHERE user_id = $1`,
        [userId]
      )
      stats = result.rows[0]
    } else {
      // Fallback para esquema antiguo si es necesario
      const result = await query(
        `SELECT
          COUNT(*) FILTER (WHERE status = 'completed') AS sessions_completed,
          COALESCE(SUM(duracion_real_seg), 0) AS total_duration_sec
        FROM workout_sessions WHERE user_id = $1`,
        [userId]
      )
      stats = result.rows[0]
    }

    // 2. Calcular racha de días (streak)
    const dateColumn = hasNewSchema ? 'fecha_sesion' : 'fecha'
    const statusColumn = hasNewSchema ? 'session_status' : 'status'

    const datesResult = await query(
      `SELECT
         DISTINCT ${dateColumn}::date AS session_date
       FROM workout_sessions
       WHERE user_id = $1 AND ${statusColumn} = 'completed' AND ${dateColumn} IS NOT NULL
       ORDER BY session_date DESC`,
      [userId]
    )

    const trainingDays = new Set(datesResult.rows.map(r => r.session_date.toISOString().slice(0, 10)))
    let streak = 0
    const today = new Date()

    // Comprobar si hoy se entrenó
    if (trainingDays.has(today.toISOString().slice(0, 10))) {
      streak = 1
      // Comprobar días anteriores consecutivamente
      for (let i = 1; i < trainingDays.size + 1; i++) {
        const prevDay = new Date(today)
        prevDay.setDate(today.getDate() - i)
        if (trainingDays.has(prevDay.toISOString().slice(0, 10))) {
          streak++
        } else {
          break // Se rompió la racha
        }
      }
    }

    // 3. Obtener nivel del usuario
    const userProfile = await fetchUserProfile(userId)
    const nivelActual = userProfile?.nivel || 'principiante'

    const finalStats = {
      sessions_completed: parseInt(stats.sessions_completed, 10) || 0,
      total_duration_sec: parseInt(stats.total_duration_sec, 10) || 0,
      streak_days: streak,
      nivel_actual: nivelActual
    }

    console.log('✅ Estadísticas calculadas:', finalStats)
    res.json({
      success: true,
      data: finalStats
    })
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error)
    res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    })
  }
})

export default router
