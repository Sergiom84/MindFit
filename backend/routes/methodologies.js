// backend/routes/methodologies.js
import express from 'express';
import { pool, query } from '../db.js';

const router = express.Router();

/**
 * Nota:
 * - Usamos SIEMPRE el pool centralizado (importado de ../db.js).
 * - Para operaciones múltiples relacionadas, usamos transacción (BEGIN/COMMIT/ROLLBACK).
 * - Para lecturas simples, usamos el helper `query(...)`.
 */

// POST /api/methodologies - Crear nueva metodología seleccionada
router.post('/', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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
        fecha_inicio, fecha_fin, methodology_data, ai_recommendation_data, estado
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'activo')
      RETURNING *`,
      [
        user_id, methodology_name, methodology_description, methodology_icon,
        methodology_version, selection_mode, program_duration, difficulty_level,
        fecha_inicio, fecha_fin, methodology_data, ai_recommendation_data
      ]
    );

    await client.query('COMMIT');
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear metodología:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// POST /api/methodologies/weeks - Crear semanas de progresión (transacción)
router.post('/weeks', async (req, res) => {
  const client = await pool.connect();

  try {
    const { weeks } = req.body;
    if (!weeks || !Array.isArray(weeks)) {
      return res.status(400).json({ error: 'Se requiere un array de semanas' });
    }

    await client.query('BEGIN');

    const createdWeeks = [];
    for (const week of weeks) {
      const r = await client.query(
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
      );
      createdWeeks.push(r.rows[0]);
    }

    await client.query('COMMIT');
    return res.status(201).json(createdWeeks);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al crear semanas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
});

// GET /api/methodologies/active/:userId - Obtener metodología activa del usuario
router.get('/active/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const result = await query(
      `SELECT * FROM user_selected_methodologies 
       WHERE user_id = $1 AND estado = 'activo'
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No hay metodología activa' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al obtener metodología activa:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// PATCH /api/methodologies/:id - Actualizar metodología (cancelar, completar, etc.)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Construir query dinámicamente
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach((key) => {
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
    const q = `
      UPDATE user_selected_methodologies 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await query(q, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Metodología no encontrada' });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar metodología:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/methodologies/:userId/history - Historial de metodologías del usuario
router.get('/:userId/history', async (req, res) => {
  try {
    const { userId } = req.params;
    // Coerce numéricos por seguridad y performance
    const limit = Number.parseInt(req.query.limit ?? '10', 10);
    const offset = Number.parseInt(req.query.offset ?? '0', 10);

    const result = await query(
      `SELECT * FROM user_selected_methodologies 
       WHERE user_id = $1 
       ORDER BY created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// GET /api/methodologies/:methodologyId/weeks - Obtener semanas de una metodología
router.get('/:methodologyId/weeks', async (req, res) => {
  try {
    const { methodologyId } = req.params;

    const result = await query(
      `SELECT * FROM methodology_weekly_progress 
       WHERE methodology_id = $1 
       ORDER BY semana_numero ASC`,
      [methodologyId]
    );

    return res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener semanas:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// POST /api/methodologies/sessions - Registrar sesión de entrenamiento
router.post('/sessions', async (req, res) => {
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

    const result = await query(
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

    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al registrar sesión:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;
