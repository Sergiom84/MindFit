// backend/routes/music.js
import express from 'express'
import { query } from '../db.js'

const router = express.Router()

/**
 * Tabla: user_music_settings
 *  - user_id (PK)
 *  - preferred_provider TEXT
 *  - connections JSONB
 *  - adaptive_mode TEXT
 *  - rules JSONB
 *  - created_at, updated_at
 */

// GET /api/music/settings?userId=UID
router.get('/settings', async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) return res.status(400).json({ error: 'Falta userId' })

    const r = await query(
      `SELECT user_id, preferred_provider, connections, adaptive_mode, rules, created_at, updated_at
       FROM user_music_settings
       WHERE user_id = $1`,
      [userId]
    )

    if (r.rows.length === 0) return res.status(200).json(null)
    return res.json(r.rows[0])
  } catch (err) {
    console.error('GET /music/settings error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

// POST /api/music/settings  (upsert)
router.post('/settings', async (req, res) => {
  try {
    const {
      user_id,
      preferred_provider = 'device',
      connections = {},
      adaptive_mode = 'auto',
      rules = { fuerza: 'alto', cardio: 'medio', movilidad: 'suave' }
    } = req.body

    if (!user_id) return res.status(400).json({ error: 'Falta user_id' })

    const r = await query(
      `INSERT INTO user_music_settings
        (user_id, preferred_provider, connections, adaptive_mode, rules)
       VALUES ($1, $2, $3::jsonb, $4, $5::jsonb)
       ON CONFLICT (user_id) DO UPDATE
       SET preferred_provider = EXCLUDED.preferred_provider,
           connections        = EXCLUDED.connections,
           adaptive_mode      = EXCLUDED.adaptive_mode,
           rules              = EXCLUDED.rules,
           updated_at         = NOW()
       RETURNING *`,
      [user_id, preferred_provider, connections, adaptive_mode, rules]
    )

    return res.status(200).json(r.rows[0])
  } catch (err) {
    console.error('POST /music/settings error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

// POST /api/music/connect/:provider   { user_id }
router.post('/connect/:provider', async (req, res) => {
  try {
    const { provider } = req.params
    const { user_id } = req.body
    if (!user_id) return res.status(400).json({ error: 'Falta user_id' })

    // Asegura fila
    await query(
      `INSERT INTO user_music_settings (user_id, preferred_provider, connections, adaptive_mode, rules)
       VALUES ($1, 'device', '{}'::jsonb, 'auto', '{"fuerza":"alto","cardio":"medio","movilidad":"suave"}'::jsonb)
       ON CONFLICT (user_id) DO NOTHING`,
      [user_id]
    )

    const updated = await query(
      `UPDATE user_music_settings
       SET connections = jsonb_set(COALESCE(connections, '{}'::jsonb), $2, 'true'::jsonb, true),
           updated_at  = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [user_id, `{${provider}}`]
    )

    return res.json(updated.rows[0])
  } catch (err) {
    console.error('POST /music/connect error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

// POST /api/music/disconnect/:provider   { user_id }
router.post('/disconnect/:provider', async (req, res) => {
  try {
    const { provider } = req.params
    const { user_id } = req.body
    if (!user_id) return res.status(400).json({ error: 'Falta user_id' })

    const updated = await query(
      `UPDATE user_music_settings
       SET connections = jsonb_set(COALESCE(connections, '{}'::jsonb), $2, 'false'::jsonb, true),
           updated_at  = NOW()
       WHERE user_id = $1
       RETURNING *`,
      [user_id, `{${provider}}`]
    )

    return res.json(updated.rows[0])
  } catch (err) {
    console.error('POST /music/disconnect error:', err)
    return res.status(500).json({ error: 'Error interno' })
  }
})

export default router
