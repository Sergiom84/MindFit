import express from 'express';
import { query } from '../db.js';

const router = express.Router();

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
    } = req.body;

    console.log('📝 Creando programa de entrenamiento:', { userId, titulo, equipamiento, tipoEntrenamiento });

    // Validar datos requeridos
    if (!userId || !titulo || !equipamiento || !tipoEntrenamiento || !ejercicios) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: userId, titulo, equipamiento, tipoEntrenamiento, ejercicios'
      });
    }

    // Crear programa
    const programResult = await query(
      `INSERT INTO home_training_programs
       (user_id, titulo, descripcion, equipamiento, tipo_entrenamiento, duracion_total, frecuencia, enfoque, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
       RETURNING id`,
      [userId, titulo, descripcion || 'Entrenamiento personalizado', equipamiento, tipoEntrenamiento, duracionTotal || '30-45 min', frecuencia || '4-5 días/semana', enfoque || 'Entrenamiento funcional']
    );

    const programId = programResult.rows[0].id;
    console.log('✅ Programa creado con ID:', programId);

    // Insertar ejercicios
    console.log(`📋 Insertando ${ejercicios.length} ejercicios...`);
    for (let i = 0; i < ejercicios.length; i++) {
      const ejercicio = ejercicios[i];

      // Validar datos del ejercicio
      if (!ejercicio.nombre || !ejercicio.series || !ejercicio.tipo) {
        console.log(`⚠️ Ejercicio ${i + 1} incompleto:`, ejercicio);
        continue;
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
      );
      console.log(`✅ Ejercicio ${i + 1}: ${ejercicio.nombre}`);
    }

    // Crear días de la semana
    console.log('📅 Creando calendario semanal...');
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const fechaInicio = new Date();

    // Calcular el lunes de esta semana
    const monday = new Date(fechaInicio);
    monday.setDate(fechaInicio.getDate() - fechaInicio.getDay() + 1);

    for (let i = 0; i < 7; i++) {
      const fecha = new Date(monday);
      fecha.setDate(monday.getDate() + i);

      const esDescanso = i === 6; // Domingo descanso
      const ejerciciosIds = [];

      if (!esDescanso) {
        // Distribuir ejercicios a lo largo de la semana
        const ejerciciosPorDia = Math.ceil(ejercicios.length / 6); // 6 días de entrenamiento
        const inicio = (i % 6) * ejerciciosPorDia;
        const fin = Math.min(inicio + ejerciciosPorDia, ejercicios.length);

        for (let j = inicio; j < fin; j++) {
          ejerciciosIds.push(j + 1);
        }

        // Si no hay suficientes ejercicios, usar todos
        if (ejerciciosIds.length === 0) {
          for (let j = 0; j < ejercicios.length; j++) {
            ejerciciosIds.push(j + 1);
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
      );

      console.log(`✅ ${diasSemana[i]}: ${esDescanso ? 'Descanso' : `${ejerciciosIds.length} ejercicios`}`);
    }

    res.json({
      success: true,
      programId: programId,
      message: 'Programa de entrenamiento creado exitosamente'
    });

  } catch (error) {
    console.error('Error creando programa:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

// Obtener programa activo del usuario
router.get('/active-program/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const programResult = await query(
      `SELECT * FROM home_training_programs 
       WHERE user_id = $1 AND estado = 'activo' 
       ORDER BY created_at DESC LIMIT 1`,
      [userId]
    );

    if (programResult.rows.length === 0) {
      return res.json({
        success: true,
        program: null
      });
    }

    const program = programResult.rows[0];

    // Obtener ejercicios del programa
    const exercisesResult = await query(
      `SELECT * FROM home_training_exercises 
       WHERE program_id = $1 ORDER BY orden`,
      [program.id]
    );

    // Obtener días del programa
    const daysResult = await query(
      `SELECT * FROM home_training_days 
       WHERE program_id = $1 ORDER BY dia_numero`,
      [program.id]
    );

    res.json({
      success: true,
      program: {
        ...program,
        ejercicios: exercisesResult.rows,
        dias: daysResult.rows
      }
    });

  } catch (error) {
    console.error('Error obteniendo programa:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

// Completar día de entrenamiento
router.post('/complete-day', async (req, res) => {
  try {
    const { dayId, userId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales, dificultadPercibida, notas } = req.body;

    console.log('🎯 Completando día de entrenamiento:', { dayId, userId, duracionMinutos, ejerciciosCompletados });

    // Validar datos requeridos
    if (!dayId || !userId || !duracionMinutos || ejerciciosCompletados === undefined || ejerciciosTotales === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: dayId, userId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales'
      });
    }

    // Verificar que el día existe y pertenece al usuario
    const dayCheck = await query(
      `SELECT htd.*, htp.user_id, htp.id as program_id
       FROM home_training_days htd
       JOIN home_training_programs htp ON htd.program_id = htp.id
       WHERE htd.id = $1 AND htp.user_id = $2`,
      [dayId, userId]
    );

    if (dayCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Día de entrenamiento no encontrado o no pertenece al usuario'
      });
    }

    const day = dayCheck.rows[0];

    // Verificar que el día no esté ya completado
    if (day.estado === 'completado') {
      return res.status(400).json({
        success: false,
        error: 'Este día ya está completado'
      });
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
    );

    console.log('✅ Día actualizado como completado');

    // Registrar sesión para estadísticas
    const sessionResult = await query(
      `INSERT INTO home_training_sessions
       (user_id, program_id, day_id, duracion_minutos, ejercicios_completados, ejercicios_totales, dificultad_percibida, notas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [userId, day.program_id, dayId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales, dificultadPercibida || null, notas || null]
    );

    console.log('✅ Sesión registrada con ID:', sessionResult.rows[0].id);

    // El trigger automáticamente actualizará el progreso del programa

    res.json({
      success: true,
      message: 'Día completado exitosamente',
      sessionId: sessionResult.rows[0].id
    });

  } catch (error) {
    console.error('❌ Error completando día:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

// Obtener estadísticas del usuario
router.get('/stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log('📊 Obteniendo estadísticas para usuario:', userId);

    // Obtener estadísticas generales
    const statsResult = await query(
      `SELECT
         COUNT(DISTINCT hts.id) as sesiones_completadas,
         COUNT(DISTINCT hts.program_id) as programas_participados,
         COALESCE(SUM(hts.duracion_minutos), 0) as tiempo_total_minutos,
         COALESCE(AVG(hts.duracion_minutos), 0) as duracion_promedio_sesion,
         COALESCE(SUM(hts.ejercicios_completados), 0) as ejercicios_totales_completados,
         COALESCE(AVG(hts.dificultad_percibida), 0) as dificultad_promedio
       FROM home_training_sessions hts
       WHERE hts.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];

    // Obtener estadísticas de días completados
    const daysResult = await query(
      `SELECT
         COUNT(*) as dias_completados,
         COUNT(*) FILTER (WHERE htd.estado = 'completado' AND htd.fecha >= CURRENT_DATE - INTERVAL '7 days') as dias_esta_semana,
         COUNT(*) FILTER (WHERE htd.estado = 'completado' AND htd.fecha >= CURRENT_DATE - INTERVAL '30 days') as dias_este_mes
       FROM home_training_days htd
       JOIN home_training_programs htp ON htd.program_id = htp.id
       WHERE htp.user_id = $1 AND htd.estado = 'completado'`,
      [userId]
    );

    const dayStats = daysResult.rows[0];

    // Obtener programa activo
    const activeProgramResult = await query(
      `SELECT COUNT(*) as programas_activos
       FROM home_training_programs
       WHERE user_id = $1 AND estado = 'activo'`,
      [userId]
    );

    const activePrograms = activeProgramResult.rows[0];

    const tiempoTotalMinutos = parseInt(stats.tiempo_total_minutos) || 0;
    const horas = Math.floor(tiempoTotalMinutos / 60);
    const minutos = tiempoTotalMinutos % 60;

    const estadisticas = {
      // Estadísticas principales
      rutinasCompletadas: parseInt(dayStats.dias_completados) || 0,
      tiempoTotalEntrenamiento: horas > 0 ? `${horas}h ${minutos}m` : `${minutos}m`,
      duracionSesion: `${Math.round(parseFloat(stats.duracion_promedio_sesion)) || 30} min`,

      // Estadísticas adicionales
      sesionesCompletadas: parseInt(stats.sesiones_completadas) || 0,
      programasParticipados: parseInt(stats.programas_participados) || 0,
      ejerciciosCompletados: parseInt(stats.ejercicios_totales_completados) || 0,
      dificultadPromedio: parseFloat(stats.dificultad_promedio) || 0,

      // Estadísticas temporales
      diasEstaSemana: parseInt(dayStats.dias_esta_semana) || 0,
      diasEsteMes: parseInt(dayStats.dias_este_mes) || 0,

      // Estado actual
      programasActivos: parseInt(activePrograms.programas_activos) || 0
    };

    console.log('✅ Estadísticas calculadas:', estadisticas);

    res.json({
      success: true,
      stats: estadisticas
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

export default router;
