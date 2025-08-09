import express from 'express';
import { Pool } from 'pg';
const router = express.Router();

// Configuración de la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// POST /api/methodologies - Crear nueva metodología seleccionada
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      user_id,
      methodology_name,
      methodology_description,
      methodology_icon,
      methodology_version,
      selection_mode,
      program_duration,
      difficulty_level,
      fecha_inicio,
      fecha_fin,
      methodology_data,
      ai_recommendation_data
    } = req.body;

    // Cancelar cualquier metodología activa anterior
    await client.query(
      `UPDATE user_selected_methodologies 
       SET estado = 'cancelado', cancelled_at = CURRENT_TIMESTAMP 
       WHERE user_id = $1 AND estado = 'activo'`,
      [user_id]
    );

    // Insertar nueva metodología
    const result = await client.query(
      `INSERT INTO user_selected_methodologies (
        user_id, methodology_name, methodology_description, methodology_icon,
        methodology_version, selection_mode, program_duration, difficulty_level,
        fecha_inicio, fecha_fin, methodology_data, ai_recommendation_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        user_id, methodology_name, methodology_description, methodology_icon,
        methodology_version, selection_mode, program_duration, difficulty_level,
        fecha_inicio, fecha_fin, methodology_data, ai_recommendation_data
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear metodología:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// POST /api/methodologies/weeks - Crear semanas de progresión
router.post('/weeks', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { weeks } = req.body;

    if (!weeks || !Array.isArray(weeks)) {
      return res.status(400).json({ error: 'Se requiere un array de semanas' });
    }

    const insertPromises = weeks.map(week => 
      client.query(
        `INSERT INTO methodology_weekly_progress (
          methodology_id, semana_numero, fecha_inicio_semana, 
          fecha_fin_semana, entrenamientos_totales
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          week.methodology_id,
          week.semana_numero,
          week.fecha_inicio_semana,
          week.fecha_fin_semana,
          week.entrenamientos_totales
        ]
      )
    );

    const results = await Promise.all(insertPromises);
    const createdWeeks = results.map(result => result.rows[0]);

    res.status(201).json(createdWeeks);
  } catch (error) {
    console.error('Error al crear semanas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// GET /api/methodologies/active/:userId - Obtener metodología activa del usuario
router.get('/active/:userId', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId } = req.params;

    const result = await client.query(
      `SELECT * FROM user_selected_methodologies 
       WHERE user_id = $1 AND estado = 'activo'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay metodología activa' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener metodología activa:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// PATCH /api/methodologies/:id - Actualizar metodología (cancelar, completar, etc.)
router.patch('/:id', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construir query dinámicamente
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (key !== 'id') {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    values.push(id);
    const query = `
      UPDATE user_selected_methodologies 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metodología no encontrada' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar metodología:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// GET /api/methodologies/:userId/history - Obtener historial de metodologías del usuario
router.get('/:userId/history', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;

    const result = await client.query(
      `SELECT * FROM user_selected_methodologies 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// GET /api/methodologies/:methodologyId/weeks - Obtener semanas de una metodología
router.get('/:methodologyId/weeks', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { methodologyId } = req.params;

    const result = await client.query(
      `SELECT * FROM methodology_weekly_progress 
       WHERE methodology_id = $1 
       ORDER BY semana_numero ASC`,
      [methodologyId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener semanas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// POST /api/methodologies/sessions - Registrar sesión de entrenamiento
router.post('/sessions', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      methodology_id,
      week_id,
      user_id,
      duracion_minutos,
      ejercicios_completados,
      ejercicios_totales,
      dificultad_percibida,
      notas_sesion
    } = req.body;

    const result = await client.query(
      `INSERT INTO methodology_training_sessions (
        methodology_id, week_id, user_id, duracion_minutos,
        ejercicios_completados, ejercicios_totales, dificultad_percibida, notas_sesion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        methodology_id, week_id, user_id, duracion_minutos,
        ejercicios_completados, ejercicios_totales, dificultad_percibida, notas_sesion
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// GET /api/methodologies/:userId/stats - Obtener estadísticas del usuario
router.get('/:userId/stats', async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { userId } = req.params;

    const result = await client.query(
      `SELECT 
        COUNT(*) as total_metodologias,
        COUNT(*) FILTER (WHERE estado = 'completado') as metodologias_completadas,
        COUNT(*) FILTER (WHERE estado = 'activo') as metodologias_activas,
        AVG(progreso_porcentaje) as progreso_promedio,
        MAX(created_at) as ultima_metodologia
       FROM user_selected_methodologies 
       WHERE user_id = $1`,
      [userId]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

export default router;
