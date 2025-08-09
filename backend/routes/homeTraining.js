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

    // Crear programa
    const programResult = await query(
      `INSERT INTO home_training_programs 
       (user_id, titulo, descripcion, equipamiento, tipo_entrenamiento, duracion_total, frecuencia, enfoque, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, CURRENT_DATE + INTERVAL '7 days')
       RETURNING id`,
      [userId, titulo, descripcion, equipamiento, tipoEntrenamiento, duracionTotal, frecuencia, enfoque]
    );

    const programId = programResult.rows[0].id;

    // Insertar ejercicios
    for (let i = 0; i < ejercicios.length; i++) {
      const ejercicio = ejercicios[i];
      await query(
        `INSERT INTO home_training_exercises 
         (program_id, nombre, descripcion, series, repeticiones, duracion, descanso, tipo, consejos, orden)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          programId,
          ejercicio.nombre,
          ejercicio.descripcion,
          ejercicio.series,
          ejercicio.repeticiones || null,
          ejercicio.duracion || null,
          ejercicio.descanso,
          ejercicio.tipo,
          JSON.stringify(ejercicio.consejos || []),
          i + 1
        ]
      );
    }

    // Crear días de la semana
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const fechaInicio = new Date();
    
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(fechaInicio);
      fecha.setDate(fecha.getDate() + i);
      
      const esDescanso = i === 6; // Domingo descanso
      const ejerciciosDelDia = esDescanso ? [] : ejercicios.slice(0, Math.ceil(ejercicios.length / 6));
      
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
          JSON.stringify(ejerciciosDelDia.map((_, idx) => idx + 1))
        ]
      );
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
    const { dayId, userId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales } = req.body;

    // Actualizar día como completado
    await query(
      `UPDATE home_training_days 
       SET estado = 'completado', 
           ejercicios_completados = $1, 
           tiempo_total_minutos = $2,
           fecha_completado = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [ejerciciosCompletados, duracionMinutos, dayId]
    );

    // Registrar sesión
    const dayResult = await query(
      `SELECT program_id FROM home_training_days WHERE id = $1`,
      [dayId]
    );

    if (dayResult.rows.length > 0) {
      await query(
        `INSERT INTO home_training_sessions 
         (user_id, program_id, day_id, duracion_minutos, ejercicios_completados, ejercicios_totales)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [userId, dayResult.rows[0].program_id, dayId, duracionMinutos, ejerciciosCompletados, ejerciciosTotales]
      );
    }

    res.json({
      success: true,
      message: 'Día completado exitosamente'
    });

  } catch (error) {
    console.error('Error completando día:', error);
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

    // Obtener estadísticas generales
    const statsResult = await query(
      `SELECT 
         COUNT(DISTINCT hts.program_id) as rutinas_completadas,
         COALESCE(SUM(hts.duracion_minutos), 0) as tiempo_total_minutos,
         COALESCE(AVG(hts.duracion_minutos), 0) as duracion_promedio_sesion
       FROM home_training_sessions hts
       WHERE hts.user_id = $1`,
      [userId]
    );

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      stats: {
        rutinasCompletadas: parseInt(stats.rutinas_completadas) || 0,
        tiempoTotalEntrenamiento: `${Math.floor(stats.tiempo_total_minutos / 60)}h ${stats.tiempo_total_minutos % 60}m`,
        duracionSesion: `${Math.round(stats.duracion_promedio_sesion)} min`
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor: ' + error.message
    });
  }
});

export default router;
