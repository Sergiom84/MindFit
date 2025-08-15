// backend/routes/ia.js
import express from 'express';
import { getOpenAI } from '../lib/openaiClient.js';
import { query } from '../db.js';

const router = express.Router();

// Cliente OpenAI (puede ser null si no hay API key)
const openai = getOpenAI?.() ?? null;

/* ----------------------------- Utilidades varias ---------------------------- */

function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isTruthy(v) {
  return !!v && v !== 'no' && v !== 'false' && v !== false && v !== 0;
}

function objectToReadable(o) {
  if (!o) return 'Ninguna';
  if (Array.isArray(o)) return o.filter(Boolean).join(', ') || 'Ninguna';
  if (typeof o === 'object') {
    const entries = Object.entries(o).filter(([_, v]) => isTruthy(v));
    if (entries.length === 0) return 'Ninguna';
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('; ');
  }
  const s = String(o).trim();
  return s === '' ? 'Ninguna' : s;
}

function canonEquipamiento(v = '') {
  const x = String(v).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  if (x.includes('avanz')) return 'avanzado';
  if (x.includes('basi')) return 'basico';
  return 'minimo';
}

function canonTipo(v = '') {
  const x = String(v).toLowerCase();
  if (x.includes('func')) return 'funcional';
  if (x.includes('fuerz') || x.includes('fuera')) return 'fuerza'; // “fuera” suele ser un typo
  return 'hiit';
}

/* ----------------------- Inventario y guías de diversidad ------------------- */

// ---- Inventario explícito por equipamiento ----
const EQUIPMENT_MAP = {
  minimo: [
    "Peso corporal",
    "Toallas",
    "Silla o sofá",
    "Pared"
  ],
  basico: [
    "Peso corporal",
    "Toallas",
    "Silla o sofá",
    "Pared",
    "Mancuernas ajustables",
    "Bandas elásticas",
    "Esterilla",
    "Banco/Step"
  ],
  avanzado: [
    "Peso corporal",
    "Toallas",
    "Silla o sofá",
    "Pared",
    "Mancuernas ajustables",
    "Bandas elásticas",
    "Esterilla",
    "Banco/Step",
    "Barra de dominadas",
    "Kettlebells",
    "TRX",
    "Discos olímpicos"
  ],
};

// ---- Guías por estilo con enfoque en diversidad ----
const STYLE_GUIDELINES = {
  hiit: [
    "Incluye calentamiento 5–10 min y vuelta a la calma 5–10 min.",
    "Intervalos de 15 s a 4 min a alta intensidad (~RPE 8–9).",
    "Relación trabajo/descanso: 1:1 a 1:2 según nivel.",
    "Volumen de alta intensidad total 10–20 min en sesión de 20–35 min.",
    "Varía el tipo de intervalos (Tabata, EMOM, bloques 30/30, 40/20…)."
  ],
  funcional: [
    "Prioriza patrones: sentadilla, bisagra de cadera, zancada, empuje, tracción, rotación/antirrotación.",
    "Incluye varios planos de movimiento y trabajo unilateral/balance.",
    "Formato circuito/EMOM: 4–6 ejercicios, 30–45 s o 8–12 reps, 30–60 s descanso.",
    "Core integrado en la mayoría de ejercicios."
  ],
  fuerza: [
    "Prioriza multiarticulares; luego accesorios.",
    "Rangos para fuerza: ≤6 reps, 2–6 series; descanso 2–5 min.",
    "Sin 1RM, usa RPE 7–9 o cargas que permitan 3–6 reps exigentes.",
    "Accesorios a 6–12 reps, 60–90 s descanso cuando aplique."
  ],
};

/* ----------------------- Carga/normalización del perfil --------------------- */

async function fetchUserProfile(userId) {
  // Obtener datos del usuario desde la tabla users (unificada)
  const profile = {};
  try {
    const u = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
    if (u?.rows?.[0]) Object.assign(profile, u.rows[0]);
  } catch (_) {}

  // Obtener lesiones activas del usuario
  try {
    const lesiones = await query(
      'SELECT titulo, zona, tipo, gravedad, estado FROM injuries WHERE user_id = $1 AND estado IN ($2, $3) ORDER BY fecha_inicio DESC',
      [userId, 'activo', 'en recuperación']
    );
    if (lesiones?.rows?.length > 0) {
      profile.lesiones_activas = lesiones.rows;
    }
  } catch (_) {}

  return profile;
}

function normalizeProfile(rawProfile = {}) {
  const p = { ...rawProfile };

  // Solo extraer los datos básicos más importantes para la IA
  const edad = Number(p.edad ?? p.age ?? 0) || undefined;
  const peso_kg = Number(p.peso_kg ?? p.peso ?? p.weight_kg ?? 0) || undefined;
  const altura_cm = Number(p.altura_cm ?? p.altura ?? p.height_cm ?? 0) || undefined;

  // Nivel de experiencia
  const nivel = p.nivel || p.experience || 'principiante';

  // Lesiones/limitaciones - priorizar lesiones activas de la tabla injuries
  let lesiones = 'Ninguna';

  if (p.lesiones_activas && Array.isArray(p.lesiones_activas) && p.lesiones_activas.length > 0) {
    // Usar lesiones activas de la tabla injuries
    lesiones = p.lesiones_activas.map(l => {
      const parts = [l.titulo || 'Lesión'];
      if (l.zona) parts.push(`(${l.zona})`);
      if (l.gravedad) parts.push(`- ${l.gravedad}`);
      return parts.join(' ');
    }).join(', ');
  } else {
    // Fallback a limitaciones del perfil
    const limitaciones = p.limitaciones ?? p.lesiones;
    if (Array.isArray(limitaciones) && limitaciones.length > 0) {
      lesiones = limitaciones.filter(Boolean).join(', ');
    } else if (typeof limitaciones === 'string' && limitaciones.trim()) {
      lesiones = limitaciones.trim();
    } else if (typeof limitaciones === 'object' && limitaciones !== null) {
      // Intentar extraer información útil del objeto
      try {
        const keys = Object.keys(limitaciones);
        if (keys.length > 0) {
          lesiones = keys.map(k => `${k}: ${limitaciones[k]}`).join(', ');
        }
      } catch (e) {
        lesiones = 'Ninguna';
      }
    }
  }

  // IMC si tenemos peso y altura
  let imc = undefined;
  if (peso_kg && altura_cm) {
    const m = altura_cm / 100;
    imc = Number((peso_kg / (m * m)).toFixed(1));
  }

  return {
    edad,
    peso_kg,
    altura_cm,
    imc,
    nivel,
    lesiones: lesiones
  };
}

/* ----------------------- Fallback: plan si no hay OpenAI -------------------- */

function buildTodayPlanFallback({ tipo, equipamiento }) {
  const fecha = todayYYYYMMDD();
  const baseDescanso = equipamiento === 'avanzado' ? 30 : equipamiento === 'basico' ? 40 : 45;
  const baseSeries = equipamiento === 'avanzado' ? 4 : 3;

  const blocks = {
    hiit: [
      { nombre: 'Jumping Jacks', tipo: 'time', duracion_seg: 40, descanso_seg: baseDescanso, series: baseSeries, notas: 'Ritmo alto, respiración controlada.' },
      { nombre: 'Sentadillas air squat', tipo: 'reps', repeticiones: 15, descanso_seg: baseDescanso, series: baseSeries, notas: 'Espalda neutra.' },
      { nombre: 'Mountain Climbers', tipo: 'time', duracion_seg: 30, descanso_seg: baseDescanso, series: baseSeries, notas: 'Core firme.' },
      { nombre: 'Plancha', tipo: 'time', duracion_seg: 30, descanso_seg: baseDescanso, series: baseSeries, notas: 'No hundas la cadera.' }
    ],
    funcional: [
      { nombre: 'Puente de glúteo', tipo: 'reps', repeticiones: 12, descanso_seg: baseDescanso, series: baseSeries, notas: '' },
      { nombre: 'Remo con mochila', tipo: 'reps', repeticiones: 12, descanso_seg: baseDescanso, series: baseSeries, notas: 'Mochila con libros.' },
      { nombre: 'Zancadas alternas', tipo: 'reps', repeticiones: 10, descanso_seg: baseDescanso, series: baseSeries, notas: '' },
      { nombre: 'Plancha lateral', tipo: 'time', duracion_seg: 20, descanso_seg: baseDescanso, series: baseSeries, notas: 'Ambos lados.' }
    ],
    fuerza: [
      { nombre: 'Sentadilla goblet (carga doméstica)', tipo: 'reps', repeticiones: 10, descanso_seg: baseDescanso, series: baseSeries, notas: '' },
      { nombre: 'Flexiones', tipo: 'reps', repeticiones: 8, descanso_seg: baseDescanso, series: baseSeries, notas: 'Escala en rodillas si hace falta.' },
      { nombre: 'Peso muerto rumano mono-lateral', tipo: 'reps', repeticiones: 10, descanso_seg: baseDescanso, series: baseSeries, notas: 'Con garrafa/banda.' },
      { nombre: 'Remo inclinado con banda/mochila', tipo: 'reps', repeticiones: 12, descanso_seg: baseDescanso, series: baseSeries, notas: '' }
    ]
  };

  const lista = blocks[tipo] || blocks.hiit;
  const duracion_estimada_min = Math.max(20, Math.round(lista.reduce((acc, e) => {
    const porSerie = e.tipo === 'time' ? (e.duracion_seg + e.descanso_seg) : (40 + e.descanso_seg);
    return acc + porSerie * (e.series || 3);
  }, 0) / 60));

  return {
    titulo: `${tipo.toUpperCase()} en Casa`,
    subtitulo: 'Entrenamiento personalizado adaptado a tu equipamiento',
    fecha,
    equipamiento,
    tipoEntrenamiento: tipo,
    duracion_estimada_min,
    ejercicios: lista
  };
}

/* ----------------------------- Prompt de OpenAI ----------------------------- */

function buildPrompt({ profile, tipo, equipamiento }) {
  // MVP de datos básicos
  const edad   = profile.edad || 30;
  const peso   = profile.peso_kg || 70;
  const altura = profile.altura_cm || 170;
  const nivel  = profile.nivel || 'principiante';
  const lesiones = profile.lesiones || 'Ninguna';

  const equipCanon = (equipamiento || 'minimo').toLowerCase();
  const tipoCanon  = (tipo || 'hiit').toLowerCase();

  const inventario = (EQUIPMENT_MAP[equipCanon] || EQUIPMENT_MAP.minimo).join(', ');
  const reglasEstilo = (STYLE_GUIDELINES[tipoCanon] || STYLE_GUIDELINES.hiit)
    .map((r, i) => `  ${i + 1}. ${r}`)
    .join('\n');

  // Reglas de diversidad aplicables a todos los estilos
  const reglasDiversidad = [
    "No repitas el mismo PATRÓN de movimiento en dos ejercicios consecutivos.",
    "Rota los IMPLEMENTOS disponibles entre ejercicios consecutivos cuando sea posible.",
    "Evita repetir el mismo ejercicio de nombre similar dos veces seguidas.",
    "Con equipamiento minimo: al menos 3 ejercicios solo con peso corporal.",
    "Con equipamiento basico: incluye ≥2 ejercicios con mancuernas o bandas.",
    "Con equipamiento avanzado: incluye 1–2 ejercicios con kettlebell/TRX/dominadas si cuadra con el estilo."
  ].map((r, i) => `  ${i + 1}. ${r}`).join('\n');

  return `
Eres "MindFit Coach", un entrenador personal experto. Genera SOLO un JSON válido (sin markdown) con un plan para HOY (${todayYYYYMMDD()}) de entrenamiento en casa.

Perfil del usuario (contexto):
- Edad: ${edad} años
- Peso: ${peso} kg
- Altura: ${altura} cm
- Nivel: ${nivel}
- Lesiones: ${lesiones}

Selección del usuario:
- Estilo: "${tipoCanon}" (hiit | funcional | fuerza)
- Equipamiento: "${equipCanon}"

Equipamiento disponible (usa exclusivamente estos implementos/superficies):
- ${inventario}

Instrucciones por estilo:
${reglasEstilo}

Requisitos de diversidad:
${reglasDiversidad}

FORMATO EXACTO del JSON de salida:
{
  "titulo": "HIIT en Casa",
  "subtitulo": "Entrenamiento personalizado",
  "fecha": "YYYY-MM-DD",
  "equipamiento": "minimo|basico|avanzado",
  "tipoEntrenamiento": "hiit|funcional|fuerza",
  "duracion_estimada_min": 25,
  "ejercicios": [
    {
      "nombre": "Sentadilla goblet",
      "tipo": "reps",
      "series": 3,
      "repeticiones": 10,
      "descanso_seg": 60,
      "duracion_seg": null,
      "notas": "Puntos técnicos y progresión/regresión",
      "patron": "sentadilla",          // OPCIONAL: patrón de movimiento
      "implemento": "mancuernas"       // OPCIONAL: implemento principal
    }
  ]
}

Reglas generales:
- Genera 4–6 ejercicios.
- Adapta la intensidad a nivel y lesiones; da regresiones si algo no es viable.
- Si "hiit": respeta relaciones trabajo/descanso y duración total indicada.
- Si "fuerza": respeta rangos de series/reps/descansos indicados.
- Si "funcional": cubre al menos 3 patrones distintos y ≥2 planos.
- No incluyas texto fuera del JSON.`;
}

/* --------------------------- Endpoint: generate-today ----------------------- */
/**
 * POST /api/ia/home-training/generate-today
 * body: { userId, equipamiento, tipoEntrenamiento }
 */
router.post('/home-training/generate-today', async (req, res) => {
  try {
    const { userId, equipamiento, tipoEntrenamiento } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta userId.' });
    }

    const tipo = canonTipo(tipoEntrenamiento);
    const equip = canonEquipamiento(equipamiento);

    // Carga perfil desde BD (best-effort)
    const raw = await fetchUserProfile(userId);
    const profile = normalizeProfile(raw);

    // Llamada a OpenAI si disponible
    let plan = null;
    if (openai) {
      try {
        const prompt = buildPrompt({ profile, tipo, equipamiento: equip });
        console.log('🤖 Llamando a OpenAI para generar entrenamiento...');

        // Usar la API correcta de OpenAI
        const resp = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres MindFit Coach, un entrenador personal experto. Responde SOLO con JSON válido, sin markdown ni texto adicional.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9,       // ↑ más variedad
          top_p: 0.95,            // nucleus sampling
          frequency_penalty: 0.3, // ↓ repeticiones literales
          presence_penalty: 0.2,  // ↑ novedad temática
          max_tokens: 2000
        });

        const rawText = resp?.choices?.[0]?.message?.content || '';
        console.log('🤖 Respuesta de OpenAI recibida:', rawText.substring(0, 200) + '...');
        console.log('🤖 Respuesta completa:', rawText);

        // Extrae el primer bloque JSON válido
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          console.log('🔍 JSON extraído:', match[0]);
          try {
            plan = JSON.parse(match[0]);
            plan._from_ai = true; // Marcar que viene de IA
            console.log('✅ Plan de IA generado exitosamente:', plan.titulo);
          } catch (parseErr) {
            console.log('❌ Error parseando JSON:', parseErr.message);
            console.log('❌ JSON problemático:', match[0]);
          }
        } else {
          console.log('❌ No se encontró JSON válido en la respuesta');
        }
      } catch (err) {
        console.warn('⚠️ OpenAI falló, usando fallback:', err?.message || err);
      }
    } else {
      console.log('⚠️ OpenAI no disponible, usando fallback');
    }

    if (!plan) {
      plan = buildTodayPlanFallback({ tipo, equipamiento: equip });
    }

    // Sanitiza estructura mínima (preservando _from_ai)
    const isFromAI = plan?._from_ai;
    plan = {
      titulo: plan?.titulo || `${tipo.toUpperCase()} en Casa`,
      subtitulo: plan?.subtitulo || 'Entrenamiento personalizado adaptado a tu equipamiento',
      fecha: plan?.fecha || todayYYYYMMDD(),
      equipamiento: canonEquipamiento(plan?.equipamiento || equip),
      tipoEntrenamiento: canonTipo(plan?.tipoEntrenamiento || tipo),
      duracion_estimada_min: Number(plan?.duracion_estimada_min) || 30,
      ejercicios: Array.isArray(plan?.ejercicios) ? plan.ejercicios.map((e) => ({
        nombre: e?.nombre || 'Ejercicio',
        tipo: (e?.tipo === 'time' || e?.tipo === 'reps') ? e.tipo : (e?.duracion_seg ? 'time' : 'reps'),
        series: Number(e?.series) > 0 ? Number(e.series) : 3,
        repeticiones: e?.repeticiones ?? null,
        duracion_seg: Number(e?.duracion_seg) > 0 ? Number(e.duracion_seg) : null,
        descanso_seg: Number(e?.descanso_seg) >= 0 ? Number(e.descanso_seg) : 45,
        notas: e?.notas || [
          e?.implemento ? `Implemento: ${e.implemento}` : null,
          e?.patron ? `Patrón: ${e.patron}` : null
        ].filter(Boolean).join(' · ')
      })) : [],
      _from_ai: isFromAI // Preservar el flag de IA
    };

    // Meta para depuración/UX
    const meta = {
      source: plan?._from_ai ? 'openai' : 'fallback',
      profile_used: {
        edad: profile.edad,
        peso_kg: profile.peso_kg,
        altura_cm: profile.altura_cm,
        nivel: profile.nivel,
        imc: profile.imc,
        lesiones: profile.lesiones
      }
    };

    return res.json({ success: true, data: plan, meta });
  } catch (err) {
    console.error('❌ Error en generate-today:', err);
    return res.status(500).json({ success: false, error: 'Error generando el entrenamiento de hoy.' });
  }
});

/* --------------------------- Endpoint: log-session -------------------------- */
/**
 * Registra la sesión realizada por el usuario al terminar el player.
 * POST /api/ia/home-training/log-session
 * body: {
 *   userId, plan: {...}, metrics: { duration_sec, exercises_done, total_exercises },
 *   seriesCompleted?: number[], startedAt?: ISO, finishedAt?: ISO
 * }
 */
let ensuredWorkoutSessions = false;
async function ensureWorkoutSessionsTable() {
  if (ensuredWorkoutSessions) return;
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS workout_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        fecha_sesion DATE NOT NULL DEFAULT CURRENT_DATE,
        plan_json JSONB NOT NULL,
        duration_sec INTEGER DEFAULT 0,
        exercises_done INTEGER DEFAULT 0,
        total_exercises INTEGER DEFAULT 0,
        series_completed JSONB,
        started_at TIMESTAMP NULL,
        finished_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_fecha
        ON workout_sessions (user_id, fecha_sesion);
    `);
    ensuredWorkoutSessions = true;
    console.log('✅ Tabla workout_sessions verificada/creada');
  } catch (e) {
    console.warn('No se pudo crear/verificar workout_sessions:', e.message);
  }
}

router.post('/home-training/log-session', async (req, res) => {
  try {
    const { userId, plan, metrics = {}, seriesCompleted, startedAt, finishedAt } = req.body || {};
    if (!userId || !plan) {
      return res.status(400).json({ success: false, error: 'Faltan userId o plan.' });
    }

    await ensureWorkoutSessionsTable();

    const today = todayYYYYMMDD();
    const duration_sec = Number(metrics.duration_sec || 0) || 0;
    const exercises_done = Number(metrics.exercises_done || 0) || 0;
    const total_exercises = Number(metrics.total_exercises || (plan?.ejercicios?.length || 0));

    const result = await query(
      `INSERT INTO workout_sessions
        (user_id, fecha_sesion, plan_json, duration_sec, exercises_done, total_exercises, series_completed, started_at, finished_at)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7::jsonb, $8, $9)
       RETURNING id`,
      [
        userId,
        today,
        JSON.stringify(plan),
        duration_sec,
        exercises_done,
        total_exercises,
        seriesCompleted ? JSON.stringify(seriesCompleted) : null,
        startedAt ? new Date(startedAt) : null,
        finishedAt ? new Date(finishedAt) : null
      ]
    );

    console.log('✅ Sesión de IA registrada con ID:', result.rows[0]?.id);

    return res.json({ success: true, id: result?.rows?.[0]?.id || null });
  } catch (err) {
    console.error('❌ Error en log-session:', err);
    return res.status(500).json({ success: false, error: 'No se pudo registrar la sesión.' });
  }
});

/* ---------------------- Endpoint: recommend-and-generate -------------------- */
/**
 * POST /api/ia/recommend-and-generate
 * body: { userId, profile, forcedMethodology }
 *
 * Este endpoint integra las lesiones del usuario con las recomendaciones de metodología
 */
router.post('/recommend-and-generate', async (req, res) => {
  try {
    const { userId, profile, forcedMethodology } = req.body || {};
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta userId.' });
    }

    // Obtener perfil completo del usuario incluyendo lesiones
    const rawProfile = await fetchUserProfile(userId);
    const normalizedProfile = normalizeProfile(rawProfile);

    // Combinar con el perfil enviado desde el frontend
    const fullProfile = { ...normalizedProfile, ...profile };

    // Simular respuesta exitosa (aquí podrías integrar con OpenAI para recomendaciones)
    const mockResponse = {
      success: true,
      data: {
        methodology: forcedMethodology || 'Entrenamiento Funcional',
        reason: `Basándome en tu perfil (edad: ${fullProfile.edad}, nivel: ${fullProfile.nivel}, lesiones: ${fullProfile.lesiones}), esta metodología es la más adecuada.`,
        profile_used: fullProfile,
        created_at: new Date().toISOString()
      }
    };

    return res.json(mockResponse);
  } catch (err) {
    console.error('❌ Error en recommend-and-generate:', err);
    return res.status(500).json({ success: false, error: 'Error generando recomendación.' });
  }
});

/* ---------------------- (Opcional) ping para diagnóstico -------------------- */
router.get('/home-training/ping', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

export default router;
