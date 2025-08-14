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

/* ----------------------- Carga/normalización del perfil --------------------- */

async function fetchUserProfile(userId) {
  // Solo usamos la tabla users que ya contiene toda la información de salud
  const profile = {};
  try {
    const u = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId]);
    if (u?.rows?.[0]) Object.assign(profile, u.rows[0]);
  } catch (_) {}

  try {
    const p = await query('SELECT * FROM user_profiles WHERE user_id = $1 LIMIT 1', [userId]);
    if (p?.rows?.[0]) Object.assign(profile, p.rows[0]);
  } catch (_) {}

  return profile;
}

function normalizeProfile(rawProfile = {}) {
  const p = { ...rawProfile };

  // --- Datos básicos ---
  const nombre = p.nombre || p.first_name || 'Usuario';
  const apellido = p.apellido || p.last_name || '';
  const email = p.email || '';
  const sexo = p.sexo || p.gender || 'no_especificado';
  const edad = Number(p.edad ?? p.age ?? 0) || undefined;
  const peso_kg = Number(p.peso_kg ?? p.peso ?? p.weight_kg ?? 0) || undefined;
  const altura_cm = Number(p.altura_cm ?? p.altura ?? p.height_cm ?? 0) || undefined;

  // --- IMC ---
  let imc = undefined;
  if (peso_kg && altura_cm) {
    const m = altura_cm / 100;
    imc = Number((peso_kg / (m * m)).toFixed(1));
  }

  // --- Nivel actividad/entrenamiento ---
  const nivel_actividad = p.nivel_actividad || p.activity_level || 'moderado';
  const nivel = p.nivel || p.experience || 'principiante';
  const años_entrenando = Number(p.años_entrenando ?? p.years_training ?? 0) || undefined;
  const frecuencia_semanal = Number(p.frecuencia_semanal ?? p.sessions_per_week ?? 3) || 3;

  // --- Preferencias ---
  const enfoque = p.enfoque || 'general';
  const horario_preferido = p.horario_preferido || 'mañana';

  // --- Composición corporal ---
  const grasa_corporal = Number(p.grasa_corporal ?? p.body_fat ?? 0) || undefined;
  const masa_muscular = Number(p.masa_muscular ?? 0) || undefined;
  const agua_corporal = Number(p.agua_corporal ?? 0) || undefined;
  const metabolismo_basal = Number(p.metabolismo_basal ?? 0) || undefined;

  // --- Medidas (opcionales) ---
  const cintura = Number(p.cintura ?? 0) || undefined;
  const pecho = Number(p.pecho ?? 0) || undefined;
  const brazos = Number(p.brazos ?? 0) || undefined;
  const muslos = Number(p.muslos ?? 0) || undefined;
  const cuello = Number(p.cuello ?? 0) || undefined;
  const antebrazos = Number(p.antebrazos ?? 0) || undefined;

  // --- Salud ---
  let lesiones = p.limitaciones ?? p.lesiones ?? p.lesiones_activas ?? 'Ninguna';
  lesiones = objectToReadable(lesiones);
  const alergias = objectToReadable(p.alergias || 'Ninguna');
  const medicamentos = objectToReadable(p.medicamentos || 'Ninguno');
  const historial_medico = p.historial_medico || '';

  // --- Nutrición / objetivos (opcionales) ---
  const comidas_diarias = Number(p.comidas_diarias ?? 3) || 3;
  const suplementacion = objectToReadable(p.suplementacion || 'Ninguna');
  const alimentos_excluidos = objectToReadable(p.alimentos_excluidos || 'Ninguno');

  const objetivo_principal = p.objetivo_principal || p.objetivo || p.goal || 'salud_general';
  const meta_peso = Number(p.meta_peso ?? 0) || undefined;
  const meta_grasa = Number(p.meta_grasa ?? 0) || undefined;

  // --- Casa/gimnasio ---
  const homeTrainingAllowed =
    isTruthy(p.prefiere_entrenar_en_casa) ||
    String(p.acceso_gimnasio || '').toLowerCase() === 'no' ||
    p.sin_acceso_gimnasio === true;

  return {
    nombre, apellido, email, sexo, edad, peso_kg, altura_cm, imc,
    nivel_actividad, nivel, años_entrenando, frecuencia_semanal,
    enfoque, horario_preferido,
    grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,
    cintura, pecho, brazos, muslos, cuello, antebrazos,
    lesionesSanitizadas: lesiones, alergias, medicamentos, historial_medico,
    comidas_diarias, suplementacion, alimentos_excluidos,
    objetivo_principal, meta_peso, meta_grasa,
    homeTrainingAllowed
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
  return `
Eres "MindFit Coach", un entrenador personal experto. Genera SOLO un JSON válido (sin markdown) con un plan para HOY (${todayYYYYMMDD()}) de entrenamiento en casa.

Condiciones:
- Estilo solicitado: "${tipo}" (uno de: hiit, funcional, fuerza).
- Equipamiento: "${equipamiento}" (minimo, basico, avanzado). Si es "minimo", usa peso corporal y objetos domésticos; "basico" permite banda/gomas o par de mancuernas; "avanzado" admite más volumen e intensidades.
- Personaliza según este perfil (si faltan campos, ignóralos): ${JSON.stringify(profile)}

Formato EXACTO del JSON:
{
  "titulo": "HIIT en Casa",
  "subtitulo": "Entrenamiento personalizado adaptado a tu equipamiento",
  "fecha": "YYYY-MM-DD",
  "equipamiento": "minimo|basico|avanzado",
  "tipoEntrenamiento": "hiit|funcional|fuerza",
  "duracion_estimada_min": 25,
  "ejercicios": [
    {
      "nombre": "Sentadillas",
      "tipo": "reps" | "time",
      "series": 3,
      "repeticiones": 12,          // si tipo="reps"
      "duracion_seg": 30,          // si tipo="time"
      "descanso_seg": 45,
      "notas": "Puntos técnicos"
    }
  ]
}

Reglas:
- Genera de 4 a 7 ejercicios.
- Ajusta series/reps/tiempo/descanso a edad, nivel, lesiones y equipamiento.
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
        // SDK openai v4 (responses API)
        const resp = await openai.responses.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          input: prompt,
          temperature: 0.6
        });

        const rawText =
          resp?.output_text ??
          resp?.content?.[0]?.text ??
          resp?.choices?.[0]?.message?.content ??
          '';

        // Extrae el primer bloque JSON válido
        const match = rawText.match(/\{[\s\S]*\}/);
        if (match) {
          plan = JSON.parse(match[0]);
        }
      } catch (err) {
        console.warn('⚠️ OpenAI falló, usando fallback:', err?.message || err);
      }
    }

    if (!plan) {
      plan = buildTodayPlanFallback({ tipo, equipamiento: equip });
    }

    // Sanitiza estructura mínima
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
        notas: e?.notas || ''
      })) : []
    };

    // Meta para depuración/UX
    const meta = {
      source: openai ? (plan?._from_ai || 'openai') : 'fallback',
      profile_used: {
        edad: profile.edad,
        sexo: profile.sexo,
        nivel: profile.nivel,
        nivel_actividad: profile.nivel_actividad,
        años_entrenando: profile.años_entrenando,
        imc: profile.imc,
        lesiones: profile.lesionesSanitizadas
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
        date DATE NOT NULL,
        plan_json JSONB NOT NULL,
        duration_sec INTEGER DEFAULT 0,
        exercises_done INTEGER DEFAULT 0,
        total_exercises INTEGER DEFAULT 0,
        series_completed JSONB,
        started_at TIMESTAMP NULL,
        finished_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date
        ON workout_sessions (user_id, date);
    `);
    ensuredWorkoutSessions = true;
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
        (user_id, date, plan_json, duration_sec, exercises_done, total_exercises, series_completed, started_at, finished_at)
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

    return res.json({ success: true, id: result?.rows?.[0]?.id || null });
  } catch (err) {
    console.error('❌ Error en log-session:', err);
    return res.status(500).json({ success: false, error: 'No se pudo registrar la sesión.' });
  }
});

/* ---------------------- (Opcional) ping para diagnóstico -------------------- */
router.get('/home-training/ping', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

export default router;
