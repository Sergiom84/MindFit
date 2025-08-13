// backend/routes/ia.js
import express from 'express';
import { getOpenAI } from '../lib/openaiClient.js';
import { query } from '../db.js';

const router = express.Router();

// Cliente OpenAI centralizado
const openai = getOpenAI();

// --- Utils ---
function todayYYYYMMDD() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function addDaysYYYYMMDD(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
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
    // Convierte { rodilla: 'leve', hombro: null } => "rodilla: leve"
    const entries = Object.entries(o).filter(([_, v]) => isTruthy(v));
    if (entries.length === 0) return 'Ninguna';
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('; ');
  }
  const s = String(o).trim();
  return s === '' ? 'Ninguna' : s;
}

// Normaliza perfil y reglas de sugerencia - VERSIÓN COMPLETA
function normalizeProfile(rawProfile = {}) {
  const p = { ...rawProfile };

  // === DATOS BÁSICOS ===
  const nombre = p.nombre || 'Usuario';
  const apellido = p.apellido || '';
  const email = p.email || '';
  const sexo = p.sexo || p.gender || 'no_especificado';
  const edad = Number(p.edad || p.age || 0) || undefined;
  const peso_kg = Number(p.peso_kg || p.peso || p.weight_kg || 0) || undefined;
  const altura_cm = Number(p.altura_cm || p.altura || p.height_cm || 0) || undefined;

  // === IMC CALCULADO ===
  let imc = undefined;
  if (peso_kg && altura_cm) {
    const altura_m = altura_cm / 100;
    imc = Number((peso_kg / (altura_m * altura_m)).toFixed(1));
  }

  // === NIVEL DE ACTIVIDAD Y ENTRENAMIENTO ===
  const nivel_actividad = p.nivel_actividad || 'moderado';
  const nivel = p.nivel || p.experience || 'principiante';
  const años_entrenando = Number(p.años_entrenando || 0) || undefined;
  const metodologia_preferida = p.metodologia_preferida || 'ninguna';
  const frecuencia_semanal = Number(p.frecuencia_semanal || p.freq || p.sessions_per_week || 3) || 3;

  // === PREFERENCIAS DE ENTRENAMIENTO ===
  const enfoque = p.enfoque || 'general';
  const horario_preferido = p.horario_preferido || 'mañana';

  // === COMPOSICIÓN CORPORAL ===
  const grasa_corporal = Number(p.grasa_corporal || p.body_fat || 0) || undefined;
  const masa_muscular = Number(p.masa_muscular || 0) || undefined;
  const agua_corporal = Number(p.agua_corporal || 0) || undefined;
  const metabolismo_basal = Number(p.metabolismo_basal || 0) || undefined;

  // === MEDIDAS CORPORALES ===
  const cintura = Number(p.cintura || 0) || undefined;
  const pecho = Number(p.pecho || 0) || undefined;
  const brazos = Number(p.brazos || 0) || undefined;
  const muslos = Number(p.muslos || 0) || undefined;
  const cuello = Number(p.cuello || 0) || undefined;
  const antebrazos = Number(p.antebrazos || 0) || undefined;

  // === SALUD Y LIMITACIONES ===
  let lesiones = p.limitaciones ?? p.lesiones ?? p.lesiones_activas ?? 'Ninguna';
  lesiones = objectToReadable(lesiones);
  const alergias = objectToReadable(p.alergias || 'Ninguna');
  const medicamentos = objectToReadable(p.medicamentos || 'Ninguno');
  const historial_medico = p.historial_medico || '';

  // === NUTRICIÓN ===
  const comidas_diarias = Number(p.comidas_diarias || 3) || 3;
  const suplementacion = objectToReadable(p.suplementacion || 'Ninguna');
  const alimentos_excluidos = objectToReadable(p.alimentos_excluidos || 'Ninguno');

  // === OBJETIVOS ===
  const objetivo_principal = p.objetivo_principal || p.objetivo || p.goal || 'salud_general';
  const meta_peso = Number(p.meta_peso || 0) || undefined;
  const meta_grasa = Number(p.meta_grasa || 0) || undefined;

  // === ACCESO A GIMNASIO ===
  const homeTrainingAllowed =
    isTruthy(p.prefiere_entrenar_en_casa) ||
    String(p.acceso_gimnasio || '').toLowerCase() === 'no' ||
    p.sin_acceso_gimnasio === true;

  // Lista de metodologías disponibles
  const baseMethods = [
    'Heavy Duty',
    'Powerlifting',
    'Hipertrofia',
    'Funcional',
    'Oposiciones',
    'CrossFit',
    'Calistenia',
    'Entrenamiento en Casa'
  ];
  const availableMethods = homeTrainingAllowed
    ? baseMethods
    : baseMethods.filter((m) => m !== 'Entrenamiento en Casa');

  return {
    // === DATOS BÁSICOS ===
    nombre, apellido, email, sexo, edad, peso_kg, altura_cm, imc,

    // === NIVEL DE ACTIVIDAD Y ENTRENAMIENTO ===
    nivel_actividad, nivel, años_entrenando, metodologia_preferida, frecuencia_semanal,

    // === PREFERENCIAS DE ENTRENAMIENTO ===
    enfoque, horario_preferido,

    // === COMPOSICIÓN CORPORAL ===
    grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,

    // === MEDIDAS CORPORALES ===
    cintura, pecho, brazos, muslos, cuello, antebrazos,

    // === SALUD Y LIMITACIONES ===
    lesionesSanitizadas: lesiones, alergias, medicamentos, historial_medico,

    // === NUTRICIÓN ===
    comidas_diarias, suplementacion, alimentos_excluidos,

    // === OBJETIVOS ===
    objetivo_principal, meta_peso, meta_grasa,

    // === CONFIGURACIÓN DE ENTRENAMIENTO ===
    homeTrainingAllowed, availableMethods
  };
}

router.post('/recommend-and-generate', async (req, res) => {
  console.log('✅ Endpoint de IA: Recibiendo petición...');
  try {
    const { userId, profile: rawProfile, forcedMethodology } = req.body;

    if (!userId || !rawProfile) {
      return res.status(400).json({ success: false, error: 'Faltan datos del perfil de usuario.' });
    }
    if (!openai) {
      return res.status(503).json({ success: false, error: 'IA no disponible: falta OPENAI_API_KEY en el servidor.' });
    }

    const profile = normalizeProfile(rawProfile);

    // Log limpio (sin [object Object])
    console.log('🧩 Perfil normalizado (resumen):', {
      edad: profile.edad,
      sexo: profile.sexo,
      objetivo: profile.objetivo_principal,
      nivel: profile.nivel,
      freq: profile.frecuencia_semanal,
      lesiones: profile.lesionesSanitizadas,
      homeTrainingAllowed: profile.homeTrainingAllowed
    });

    const daysOfWeek = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const currentDayName = daysOfWeek[new Date().getDay()];
    console.log(`🗓️  Día actual detectado: ${currentDayName}`);

    const mainInstruction = forcedMethodology
      ? `Tu tarea es actuar como un entrenador experto en la metodología "${forcedMethodology}". Crea el mejor y más detallado plan de entrenamiento semanal posible de "${forcedMethodology}" para este usuario, personalizándolo según su perfil.`
      : 'Tu tarea es analizar el perfil de un usuario y recomendarle la mejor metodología de la lista proporcionada. Luego, genera un plan de entrenamiento semanal completo y detallado basado en esa recomendación.';

    const methodsList = profile.availableMethods.join(', ');

    const prompt = `
Eres "MindFit Coach", un entrenador personal y nutricionista de élite con IA. ${mainInstruction}

REGLAS CRÍTICAS PARA LA RUTINA:
1) El plan de entrenamiento debe comenzar hoy, que es ${currentDayName}.
2) El primer día del plan (Día 1) debe ser OBLIGATORIAMENTE un día de entrenamiento, NUNCA un día de descanso.
3) Solo considera **lesiones activas**. Si no hay lesiones activas, ignora cualquier lesión histórica y NO restrinjas innecesariamente el plan.
4) ${profile.homeTrainingAllowed ? 'Puedes' : 'NO puedes'} sugerir "Entrenamiento en Casa". Si no está permitido, elige otra metodología más adecuada.
5) Evita recomendar modalidades que contradigan claramente las lesiones activas; adapta ejercicios cuando sea necesario.
6) Devuelve DURACIÓN DEL PROGRAMA en **semanas** y el **nivel de dificultad** estimado.

PERFIL COMPLETO DEL USUARIO:

📋 DATOS BÁSICOS:
- Nombre: ${profile.nombre || 'Usuario'}
- Edad: ${profile.edad ?? 'No especificada'} años
- Sexo: ${profile.sexo}
- Peso: ${profile.peso_kg ?? '—'} kg
- Altura: ${profile.altura_cm ?? '—'} cm
- IMC: ${profile.imc ?? '—'}

🏃 EXPERIENCIA Y NIVEL:
- Nivel de Actividad: ${profile.nivel_actividad}
- Nivel de Entrenamiento: ${profile.nivel}
- Años Entrenando: ${profile.años_entrenando ?? '—'} años
- Metodología Preferida: ${profile.metodologia_preferida}
- Frecuencia Semanal: ${profile.frecuencia_semanal} días/semana
- Enfoque Seleccionado: ${profile.enfoque}
- Horario Preferido: ${profile.horario_preferido}

🎯 OBJETIVOS:
- Objetivo Principal: ${profile.objetivo_principal}
- Meta de Peso: ${profile.meta_peso ?? '—'} kg
- Meta de Grasa Corporal: ${profile.meta_grasa ?? '—'}%

💪 COMPOSICIÓN CORPORAL:
- Grasa Corporal: ${profile.grasa_corporal ?? '—'}%
- Masa Muscular: ${profile.masa_muscular ?? '—'} kg
- Agua Corporal: ${profile.agua_corporal ?? '—'}%
- Metabolismo Basal: ${profile.metabolismo_basal ?? '—'} kcal

📏 MEDIDAS CORPORALES:
- Cintura: ${profile.cintura ?? '—'} cm
- Pecho: ${profile.pecho ?? '—'} cm
- Brazos: ${profile.brazos ?? '—'} cm
- Muslos: ${profile.muslos ?? '—'} cm
- Cuello: ${profile.cuello ?? '—'} cm
- Antebrazos: ${profile.antebrazos ?? '—'} cm

🏥 SALUD Y LIMITACIONES:
- Lesiones ACTIVAS: ${profile.lesionesSanitizadas}
- Alergias: ${profile.alergias}
- Medicamentos: ${profile.medicamentos}
- Historial Médico: ${profile.historial_medico || 'No especificado'}

🍽️ NUTRICIÓN:
- Comidas Diarias: ${profile.comidas_diarias} comidas/día
- Suplementación: ${profile.suplementacion}
- Alimentos Excluidos: ${profile.alimentos_excluidos}
- Evita: ${profile.evita || '—'}

METODOLOGÍAS DISPONIBLES (si estás en modo recomendador, elige solo de esta lista):
${methodsList}

INSTRUCCIONES PARA LA RESPUESTA (OBLIGATORIO):
Devuelve un único objeto JSON válido EXACTAMENTE con esta estructura:
{
  "recomendacion": {
    "metodologia_sugerida": "${forcedMethodology || 'NombreDeLaMetodologiaElegida'}",
    "justificacion": "Un párrafo conciso y motivador explicando por qué esta metodología es la mejor para el usuario, mencionando explícitamente las lesiones ACTIVAS si las hay.",
    "program_duration_weeks": 12,
    "difficulty_level": "Principiante | Intermedio | Avanzado"
  },
  "rutina_semanal": {
    "nombre_rutina": "Plan de ${forcedMethodology || '[Metodología]'} para ${profile.objetivo_principal}",
    "dias": [
      { "dia": 1, "nombre_sesion": "Ej: Empuje (${currentDayName})", "ejercicios": [ { "nombre": "Press de Banca", "series": 4, "repeticiones": "8-12", "descanso_seg": 60, "notas": "Controla la fase excéntrica." } ] }
    ]
  }
}
IMPORTANTE: "program_duration_weeks" debe ser un número entero (ej. 8, 10, 12).
`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const ai = JSON.parse(completion.choices[0].message.content);

    // Fallbacks por si el modelo olvida campos
    const weeks = Number(ai?.recomendacion?.program_duration_weeks || 12);
    const difficulty = ai?.recomendacion?.difficulty_level || 'Intermedio';
    const metodologia = ai?.recomendacion?.metodologia_sugerida || 'Hipertrofia';
    const justificacion = ai?.recomendacion?.justificacion || 'Plan generado automáticamente según tu perfil.';
    const program_duration = `${weeks} semanas`;

    const fecha_inicio = todayYYYYMMDD();
    const fecha_fin = addDaysYYYYMMDD(weeks * 7);

    // Cancela metodologías activas anteriores del usuario
    await query(
      `UPDATE user_selected_methodologies
       SET estado = 'cancelado', cancelled_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND estado = 'activo'`,
      [userId]
    );

    // Inserta NUEVO registro con columnas completas (incluye program_duration)
    const insertSQL = `
      INSERT INTO user_selected_methodologies (
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
        ai_recommendation_data,
        estado
      )
      VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, 'activo'
      )
      RETURNING *;
    `;

    const insertParams = [
      userId,
      metodologia,
      justificacion,
      null,                     // methodology_icon (opcional)
      'Adaptada',
      forcedMethodology ? 'manual' : 'automatic',
      program_duration,
      difficulty,
      fecha_inicio,
      fecha_fin,
      ai?.rutina_semanal || {},
      ai?.recomendacion || {}
    ];

    const insertResult = await query(insertSQL, insertParams);

    return res.status(200).json({ success: true, data: insertResult.rows[0] });
  } catch (error) {
    console.error('Error en el endpoint de IA:', error);
    return res
      .status(500)
      .json({ success: false, error: 'Error interno del servidor en la ruta de IA.' });
  }
});

export default router;
