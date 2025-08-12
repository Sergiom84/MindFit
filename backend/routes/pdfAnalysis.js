import express from 'express';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { query } from '../db.js';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Recibe texto extraído del PDF y produce un resumen estructurado
router.post('/users/:id/medical-docs/:docId/summarize', async (req, res) => {
  try {
    const { id, docId } = req.params;
    const { plainText } = req.body;
    if (!plainText || !plainText.trim()) {
      return res.status(400).json({ success: false, error: 'plainText requerido' });
    }

    const system = `Eres un asistente médico que resume expedientes clínicos. Devuelve JSON bien formado con:
    {
      "diagnosticos": string[],
      "alergias": string[],
      "medicacion_actual": string[],
      "antecedentes": string[],
      "recomendaciones": string
    }`;

    const resp = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: plainText.slice(0, 20000) }
      ],
      temperature: 0.2
    });

    const text = resp.choices?.[0]?.message?.content?.trim();
    if (!text) return res.status(500).json({ success: false, error: 'Sin respuesta de IA' });

    // Intentar parsear a JSON
    let parsed;
    try { parsed = JSON.parse(text); } catch { parsed = { resumen: text }; }

    // Guardar el resultado enlazado al documento
    const userRes = await query('SELECT historial_medico_docs FROM public.users WHERE id=$1', [id]);
    const docs = userRes.rows?.[0]?.historial_medico_docs || [];
    const idx = docs.findIndex(d => String(d.id) === String(docId));
    if (idx >= 0) {
      docs[idx].ai = {
        model: 'gpt-4o-mini',
        createdAt: new Date().toISOString(),
        result: parsed
      };
      await query('UPDATE public.users SET historial_medico_docs=$1, updated_at=NOW() WHERE id=$2', [JSON.stringify(docs), id]);
    }

    return res.json({ success: true, result: parsed });
  } catch (e) {
    console.error('Error resumiendo doc médico:', e);
    return res.status(500).json({ success: false, error: e.message || 'Error interno' });
  }
});

export default router;

