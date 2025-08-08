import express from 'express';
import { query } from '../db.js';
import OpenAI from 'openai';

const router = express.Router();

// Helper: get OpenAI client if configured
const getOpenAI = () => {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
    return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return null;
};

// Normalizar estado a valores compatibles con constraint
const normalizeEstado = (estadoRaw) => {
  if (!estadoRaw) return 'activo';
  const s = String(estadoRaw).toLowerCase().trim();
  if (s.startsWith('act')) return 'activo';
  if (s.includes('recuperad')) return 'recuperado';
  if (s.includes('recuper')) return 'en recuperación';
  return 'activo';
};

// Create injury
router.post('/users/:id/injuries', async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      titulo, zona, tipo, gravedad, fecha_inicio,
      causa, tratamiento, estado = 'activo', notas
    } = req.body || {};

    if (!titulo) return res.status(400).json({ success:false, error:'titulo es requerido' });

  const sql = `INSERT INTO injuries
      (user_id, titulo, zona, tipo, gravedad, fecha_inicio, causa, tratamiento, estado, notas)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`;
  const vals = [userId, titulo, zona, tipo, gravedad, fecha_inicio || new Date(), causa, tratamiento, normalizeEstado(estado), notas];
    const result = await query(sql, vals);
    res.status(201).json({ success:true, injury: result.rows[0] });
  } catch (e) {
    console.error('Error creando lesión:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

// List injuries (optionally filter by estado)
router.get('/users/:id/injuries', async (req, res) => {
  try {
    const userId = req.params.id;
    const { estado } = req.query;
    let sql = 'SELECT * FROM injuries WHERE user_id = $1';
    const vals = [userId];
    if (estado) {
      sql += ' AND estado = $2';
      vals.push(estado);
    }
    sql += ' ORDER BY fecha_inicio DESC NULLS LAST, id DESC';
    const result = await query(sql, vals);
    res.json({ success:true, injuries: result.rows });
  } catch (e) {
    console.error('Error listando lesiones:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

// Update injury
router.patch('/injuries/:injuryId', async (req, res) => {
  try {
    const injuryId = req.params.injuryId;
    const data = req.body || {};
  const allowed = ['titulo','zona','tipo','gravedad','fecha_inicio','fecha_fin','causa','tratamiento','estado','notas'];
    const entries = Object.entries(data).filter(([k]) => allowed.includes(k));
    if (entries.length === 0) return res.status(400).json({ success:false, error:'Sin campos válidos' });

    const set = [];
    const vals = [];
    let idx = 1;
    for (const [k,v] of entries) {
      set.push(`${k} = $${idx++}`);
      vals.push(k === 'estado' ? normalizeEstado(v) : v);
    }
    vals.push(injuryId);
    const sql = `UPDATE injuries SET ${set.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, vals);
    if (result.rows.length === 0) return res.status(404).json({ success:false, error:'Lesión no encontrada' });
    res.json({ success:true, injury: result.rows[0] });
  } catch (e) {
    console.error('Error actualizando lesión:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

// Delete injury (optional)
router.delete('/injuries/:injuryId', async (req, res) => {
  try {
    const injuryId = req.params.injuryId;
    const result = await query('DELETE FROM injuries WHERE id = $1 RETURNING id', [injuryId]);
    if (result.rowCount === 0) return res.status(404).json({ success:false, error:'Lesión no encontrada' });
    res.json({ success:true, id: injuryId });
  } catch (e) {
    console.error('Error eliminando lesión:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

// AI prevention advice for a specific injury
router.post('/injuries/:injuryId/prevention', async (req, res) => {
  try {
    const injuryId = req.params.injuryId;
    const openai = getOpenAI();
    if (!openai) return res.status(503).json({ success:false, error:'OpenAI no configurado' });

    // Fetch injury and user
    const result = await query(`
      SELECT i.*, u.nombre, u.apellido, u.edad, u.sexo, u.peso, u.altura, u.nivel, u.metodologia_preferida
      FROM injuries i
      JOIN users u ON u.id = i.user_id
      WHERE i.id = $1
    `, [injuryId]);
    if (result.rows.length === 0) return res.status(404).json({ success:false, error:'Lesión no encontrada' });
    const injury = result.rows[0];

    const prompt = `Eres un fisioterapeuta deportivo con IA. Genera un plan preventivo y de rehabilitación breve y seguro para esta lesión:\n\nUsuario: ${injury.nombre} ${injury.apellido}, ${injury.edad || '?'} años, ${injury.sexo || 'n/d'}, nivel ${injury.nivel || 'n/d'}, metodología ${injury.metodologia_preferida || 'n/d'}, peso ${injury.peso || 'n/d'}kg, altura ${injury.altura || 'n/d'}cm.\nLesión: ${injury.titulo} | zona ${injury.zona || 'n/d'} | tipo ${injury.tipo || 'n/d'} | gravedad ${injury.gravedad || 'n/d'} | estado ${injury.estado}\nCausa: ${injury.causa || 'n/d'} | Tratamiento: ${injury.tratamiento || 'n/d'} | fecha inicio ${injury.fecha_inicio}\n\nResponde en JSON:\n{\n  "calentamiento": "...",\n  "movilidad": ["...", "..."],\n  "fortalecimiento": ["...", "..."],\n  "evitar": ["...", "..."],\n  "frecuencia": "X veces/semana",\n  "advertencias": ["..."],\n  "duracion_aprox": "X semanas"\n}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: 'Sé específico y prudente. No des consejos médicos peligrosos.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.4,
      max_tokens: 600
    });

    let content = completion.choices?.[0]?.message?.content || '';
    let json;
    try { json = JSON.parse(content); } catch { json = { recomendacion: content }; }

    res.json({ success:true, injuryId, prevention: json });
  } catch (e) {
    console.error('Error IA prevención:', e);
    res.status(500).json({ success:false, error: e.message || 'Error interno' });
  }
});

export default router;
