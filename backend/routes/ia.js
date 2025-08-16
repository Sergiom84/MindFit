// backend/routes/ia.js
import express from 'express'
import { getOpenAI } from '../lib/openaiClient.js'
import { query } from '../db.js'

const router = express.Router()

// Cliente OpenAI (puede ser null si no hay API key)
const openai = getOpenAI?.() ?? null

/* ----------------------------- Utilidades varias ---------------------------- */

// ÚNICA canonName (reutilizada en todo el archivo)
function canonName (s = '') {
  return String(s)
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9\s]/g, '') // quita signos
    .replace(/\s+/g, ' ')
    .trim()
}

// === Anti-repetición: helpers ===
async function fetchRecentExerciseNames (userId, days = 10, limit = 150) {
  const sql = `
    SELECT DISTINCT LOWER(nombre) AS nombre
    FROM workout_session_exercises
    WHERE user_id = $1
      AND created_at >= NOW() - INTERVAL '${days} days'
    ORDER BY nombre ASC
    LIMIT $2
  `
  const r = await query(sql, [userId, limit])
  return (r?.rows || []).map(x => x.nombre).filter(Boolean)
}

function todayYYYYMMDD () {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isTruthy (v) {
  return !!v && v !== 'no' && v !== 'false' && v !== false && v !== 0
}

function objectToReadable (o) {
  if (!o) return 'Ninguna'
  if (Array.isArray(o)) return o.filter(Boolean).join(', ') || 'Ninguna'
  if (typeof o === 'object') {
    const entries = Object.entries(o).filter(([_, v]) => isTruthy(v))
    if (entries.length === 0) return 'Ninguna'
    return entries
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('; ')
  }
  const s = String(o).trim()
  return s === '' ? 'Ninguna' : s
}

function canonEquipamiento (v = '') {
  const x = String(v).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  if (x.includes('avanz')) return 'avanzado'
  if (x.includes('basi')) return 'basico'
  return 'minimo'
}

function canonTipo (v = '') {
  const x = String(v).toLowerCase()
  if (x.includes('func')) return 'funcional'
  if (x.includes('fuerz') || x.includes('fuera')) return 'fuerza' // “fuera” suele ser un typo
  return 'hiit'
}

// Extrae el bloque JSON principal balanceando llaves (soporta texto alrededor)
function extractJsonBlock (raw = '') {
  if (!raw) return ''
  const start = raw.indexOf('{')
  if (start === -1) return ''
  let depth = 0
  let inString = false
  let escape = false
  
  for (let i = start; i < raw.length; i++) {
    const ch = raw[i]
    
    if (inString) {
      if (escape) {
        escape = false
      } else if (ch === '\\') {
        escape = true
      } else if (ch === '"') {
        inString = false
      }
    } else {
      if (ch === '"') {
        inString = true
      } else if (ch === '{') {
        depth++
      } else if (ch === '}') {
        depth--
        if (depth === 0) return raw.slice(start, i + 1)
      }
    }
  }
  
  // Si llegamos aquí, el JSON está incompleto - intentar repararlo
  let incomplete = raw.slice(start)
  console.log('⚠️ JSON incompleto detectado, intentando reparar...')
  
  // Cerrar strings abiertas
  if (inString) {
    incomplete += '"'
  }
  
  // Cerrar objetos/arrays abiertos
  while (depth > 0) {
    incomplete += '}'
    depth--
  }
  
  return incomplete
}

// Función para reparar JSON incompletos de arrays de ejercicios
function repairIncompleteExerciseJson(jsonStr) {
  if (!jsonStr) return jsonStr
  
  // Si el JSON termina abruptamente en un ejercicio incompleto
  // Buscar la última coma y truncar desde ahí, luego cerrar el array
  const lastCommaInExercises = jsonStr.lastIndexOf(',', jsonStr.lastIndexOf('"ejercicios"'))
  if (lastCommaInExercises > -1) {
    let truncated = jsonStr.substring(0, lastCommaInExercises)
    
    // Contar llaves abiertas y cerradas para balancear
    let openBraces = (truncated.match(/\{/g) || []).length
    let closeBraces = (truncated.match(/\}/g) || []).length
    let openBrackets = (truncated.match(/\[/g) || []).length
    let closeBrackets = (truncated.match(/\]/g) || []).length
    
    // Cerrar arrays primero
    while (openBrackets > closeBrackets) {
      truncated += ']'
      closeBrackets++
    }
    
    // Cerrar objetos
    while (openBraces > closeBraces) {
      truncated += '}'
      closeBraces++
    }
    
    return truncated
  }
  
  return jsonStr
}

// Reparador fuerte para JSON "IA-style"
function repairModelJson (text = '') {
  if (!text) return ''

  // 0) Normaliza comillas tipográficas → ASCII y limpia wrappers
  let s = text
    .replace(/[\u201C\u201D]/g, '"') // comillas dobles curvas
    .replace(/[\u2018\u2019]/g, "'") // comillas simples curvas
    .replace(/```(?:json)?/gi, '') // Quita fences/etiquetas de código
    .replace(/```/g, '')
    .replace(/\u2026/g, '') // Elimina puntos suspensivos
    .replace(/\.\.\./g, '')

  // 1) Quédate solo con el bloque { ... } más exterior
  s = extractJsonBlock(s)
  
  // 1.5) Intentar reparar JSON incompleto de ejercicios
  s = repairIncompleteExerciseJson(s)

  // NUEVO: Eliminar claves "basura" extremadamente largas que no son seguidas por un ':'
  // Esto ataca directamente el problema principal de la "alucinación" del modelo.
  // Busca una coma, seguida de una clave entre comillas que tiene más de 100 caracteres,
  // y la elimina por completo.
  s = s.replace(/,\s*"[^"]{100,}"/g, '')

  // ******** ESTA ES LA PARTE NUEVA Y MÁS IMPORTANTE ********
  // Arregla el error donde la IA anida un par clave-valor dentro de un string.
  // Ejemplo: "notas": "texto, "patron": "sentadilla"" -> "notas": "texto", "patron": "sentadilla"
  // Se repite varias veces para solucionar anidaciones múltiples.
  for (let i = 0; i < 5; i++) {
    s = s.replace(/: "([^"]*?),\s*"(\w+)": "([^"]*)"/g, ': "$1", "$2": "$3"')
  }
  // **********************************************************

  // NUEVAS REGLAS DE LIMPIEZA:
  // Eliminar strings sueltos con forma "clave: valor" dentro de objetos
  s = s.replace(/([,{])\s*"(?:[^"\\]|\\.)+:\s*(?:[^"\\]|\\.)*"\s*(?=,|})/g, '$1');

  // Cerrar claves con comilla de apertura sin cierre ('descansSeg:0)
  s = s.replace(/'([A-Za-z0-9_]+)\s*:/g, '"$1":');

  // Normalizar variantes de nombres de clave
  s = s.replace(/"descans(?:o|a)?(?:_)?seg"\s*:/gi, '"descanso_seg":');
  s = s.replace(/"duraci(?:o|ó)n(?:_)?seg"\s*:/gi, '"duracion_seg":');

  // Eliminar caracteres basura (|, ^)
  s = s.replace(/[|^]/g, '');

  // 2) Quita comas colgantes ,] y ,}
  s = s.replace(/,\s*([\]}])/g, '$1')

  // 3) Claves en comilla simple → doble: 'key': → "key":
  s = s.replace(/'([\w$]+)'\s*:/g, '"$1":')

  // 3.b) Corregir claves con comilla sobrante antes de ":"
  s = s.replace(/"([\w$]+)'\s*:/g, '"$1":')
  s = s.replace(/"([\w$]+)""\s*:/g, '"$1":')
  s = s.replace(/'([\w$]+)''\s*:/g, '"$1":')

  // 4) Valores string en comilla simple → doble: : 'texto' → : "texto"
  s = s.replace(/:\s*'([^']*)'/g, (_, inner) => {
    const esc = inner.replace(/"/g, '\\"')
    return `: "${esc}"`
  })

  // 4.b) ESPECÍFICO para el bug de iPhone: Manejar objetos con mezcla de comillas
  // Patrón: "notas": "", 'patron': 'valor' -> "notas": "", "patron": "valor"
  // Este regex busca el patrón específico que causa el fallo
  s = s.replace(/("[\w$]+":\s*"[^"]*",?\s*)'([\w$]+)'\s*:\s*'([^']*)'/g, '$1"$2": "$3"')

  // 5) Números entre comillas → números reales  : "180" → : 180
  s = s.replace(/:\s*"(-?\d+(?:\.\d+)?)"\s*([,}\]])/g, ': $1$2')

  // 6) boolean/null como string → primitivo
  s = s.replace(/:\s*"(true|false|null)"\s*([,}\]])/gi, ': $1$2')

  // 7) Tokens tipo 'reps'/'time' que hayan quedado entrecomillados simples
  s = s.replace(/"tipo"\s*:\s*"'(reps|time)'"/gi, '"tipo": "$1"')

  // 7.b) Normaliza sinónimos de tipo: "tiempo" -> "time", "intervalo" -> "time"
  s = s.replace(/("tipo"\s*:\s*")\s*(tiempo|time|reps|intervalo)\s*(")/gi, (_, p1, val, p3) => {
    const v = String(val).toLowerCase();
    return p1 + (v === 'tiempo' || v === 'intervalo' ? 'time' : v) + p3;
  });

  // 8) Limpia comillas simples "decorativas" dentro de valores de texto
  s = s.replace(/"([^"]*)"/g, (m, inner) => {
    const cleaned = inner.replace(/'([A-Za-zÁ-ÖØ-öø-ÿ0-9\- ]+)'/g, '$1')
    return `"${cleaned}"`
  })

  // 9) Normaliza saltos de línea y espacios excesivos entre claves y valores
  // Esto soluciona problemas secundarios como "series": \n 3
  s = s.replace(/\s*:\s*/g, ':') // "series" : 3 -> "series":3
  s = s.replace(/([,{])\s*"/g, '$1"') // { "a":1 } -> {"a":1}

  return s
}

// Intenta varias estrategias de parseo
function tryParseModelJsonStrong (raw = '') {
  if (!raw) return null

  console.log('🔧 Intentando parseo fuerte del JSON...')

  // 1) intento directo
  try {
    const result = JSON.parse(extractJsonBlock(raw))
    console.log('✅ Parseo directo exitoso')
    return result
  } catch (e) {
    console.log('❌ Parseo directo falló:', e.message)
  }

  // 2) intento reparado
  try {
    const result = JSON.parse(repairModelJson(raw))
    console.log('✅ Parseo reparado exitoso')
    return result
  } catch (e) {
    console.log('❌ Parseo reparado falló:', e.message)
  }

  // 3) intento con limpieza adicional
  try {
    let cleaned = raw
    // Eliminar comentarios JavaScript
    cleaned = cleaned.replace(/\/\/.*$/gm, '')
    cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '')
    // Extraer JSON y reparar
    const extracted = extractJsonBlock(cleaned)
    const repaired = repairModelJson(extracted)
    const result = JSON.parse(repaired)
    console.log('✅ Parseo con limpieza adicional exitoso')
    return result
  } catch (e) {
    console.log('❌ Parseo con limpieza adicional falló:', e.message)
  }

  console.log('❌ Todos los intentos de parseo fallaron')
  return null
}

function cleanAndParseJson (raw) {
  try {
    // Paso 1: Asegurarnos de trabajar con string
    let text = typeof raw === 'string' ? raw : JSON.stringify(raw)

    console.log('🧹 Limpiando JSON problemático...')

    // Quitar fences de markdown (```json ... ```)
    text = text.replace(/```(?:json)?/gi, '').replace(/```/g, '')
    // Quitar puntos suspensivos sueltos que rompen el parser
    text = text.replace(/\u2026/g, '').replace(/\.\.\./g, '')

    // Paso 2: Eliminar comentarios JavaScript (// comentario)
    text = text.replace(/\/\/.*$/gm, '')

    // Paso 3: Eliminar comentarios de bloque (/* comentario */)
    text = text.replace(/\/\*[\s\S]*?\*\//g, '')

    // Paso 4: Reemplazar comillas simples por dobles para JSON válido (contexto inteligente)
    // Reemplazar propiedades: 'key': -> "key":
    text = text.replace(/'([a-zA-Z_][a-zA-Z0-9_]*)'\s*:/g, '"$1":')
    
    // Reemplazar valores string: : 'value' -> : "value" 
    text = text.replace(/:\s*'([^']*)'\s*([,}])/g, (match, value, ending) => {
      // Escapar comillas dobles existentes en el valor
      const escapedValue = value.replace(/"/g, '\\"')
      return `: "${escapedValue}"${ending}`
    })

    // Paso 5: Eliminar dobles comillas en exceso (ej: ""reps"")
    text = text.replace(/"{2,}/g, '"')

    // Paso 6: Corregir propiedades sin comillas (ej: series:3 -> "series":3)
    text = text.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":')

    // Paso 7: Corregir valores "palabra" sin comillas, pero SIN tocar true|false|null
    text = text.replace(
      /:\s*([A-Za-z][A-Za-z0-9\s]*[A-Za-z0-9])\s*([,}])/g,
      (m, val, tail) => /^(true|false|null)$/i.test(val.trim()) ? `: ${val}${tail}` : `: "${val}"${tail}`
    )

    // Paso 7.1: Convertir "true"/"false"/"null" entrecomillados a primitivos
    text = text.replace(/:\s*"(true|false|null)"\s*([,}\]])/gi, ': $1$2')

    // Paso 8: Limpiar espacios y saltos de línea extra
    text = text.replace(/\s+/g, ' ').trim()

    // Paso 9: Intentar extraer solo el objeto JSON principal
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }

    console.log('🧹 JSON después de limpieza:', text.substring(0, 500) + '...')

    // Arregla llaves con dobles comillas antes de ":" (p.ej. ""series"": 4)
    text = text.replace(/"([A-Za-z0-9_$]+)""\s*:/g, '"$1":');
    // Arregla la variante que nace de comillas simples duplicadas "'series'':"
    text = text.replace(/'([A-Za-z0-9_$]+)''\s*:/g, '"$1":');

    // NUEVAS REGLAS DE REFUERZO ANTES DEL PARSEO:
    // Eliminar strings sueltos con forma "clave: valor" dentro de objetos
    text = text.replace(/([,{])\s*"(?:[^"\\]|\\.)+:\s*(?:[^"\\]|\\.)*"\s*(?=,|})/g, '$1');

    // Cerrar claves con comilla de apertura sin cierre ('descansSeg:0)
    text = text.replace(/'([A-Za-z0-9_]+)\s*:/g, '"$1":');

    // Normalizar variantes de nombres de clave
    text = text.replace(/"descans(?:o|a)?(?:_)?seg"\s*:/gi, '"descanso_seg":');
    text = text.replace(/"duraci(?:o|ó)n(?:_)?seg"\s*:/gi, '"duracion_seg":');

    // Eliminar caracteres basura (|, ^)
    text = text.replace(/[|^]/g, '');

    // Paso 10: Parsear
    let parsed = JSON.parse(text)

    // Paso 11: Convertir números en string → Number y "true|false|null" string → primitivo
    const convertNumbers = obj => {
      if (Array.isArray(obj)) {
        return obj.map(convertNumbers)
      } else if (obj && typeof obj === 'object') {
        for (const key in obj) {
          if (typeof obj[key] === 'string' && obj[key].match(/^\d+$/)) {
            obj[key] = Number(obj[key])
          } else if (typeof obj[key] === 'string' && /^(true|false|null)$/i.test(obj[key])) {
            const v = obj[key].toLowerCase()
            obj[key] = v === 'true' ? true : v === 'false' ? false : null
          } else if (obj[key] && typeof obj[key] === 'object') {
            obj[key] = convertNumbers(obj[key])
          }
        }
      }
      return obj
    }

    parsed = convertNumbers(parsed)

    return parsed
  } catch (err) {
    console.error('❌ Error limpiando JSON:', err.message)
    console.error('❌ JSON problemático:', raw.substring(0, 1000) + '...')
    return null // Devolver null para que el flujo caiga a fallback
  }
}

function asInt (v, fallback = null) {
  if (v === null || v === undefined || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

function cleanQuotes (s = '') {
  return String(s)
    .replace(/[\u201C\u201D]/g, '"') // ""
    .replace(/[\u2018\u2019]/g, "'") // ''
    .replace(/^['"]+|['"]+$/g, '') // bordes 'texto' o "texto"
    .replace(/''/g, "'") // dobles simples
    .trim()
}

function sanitizeExercise (e = {}) {
  const nombre = cleanQuotes(e.nombre || 'Ejercicio')
  // Determinar tipo fiable - normalizar "intervalo" a "time"
  let tipo = String(e.tipo || '').toLowerCase()
  if (tipo === 'intervalo' || tipo === 'tiempo') {
    tipo = 'time'
  }
  if (tipo !== 'time' && tipo !== 'reps') {
    tipo = (e.duracion_seg != null && e.duracion_seg !== '') ? 'time' : 'reps'
  }
  // Números y defaults
  const series = asInt(e.series, tipo === 'reps' ? 3 : 3)
  const repeticiones = tipo === 'reps' ? asInt(e.repeticiones, 10) : null
  const duracion_seg = tipo === 'time' ? asInt(e.duracion_seg, 30) : null
  const descanso_seg = asInt(e.descanso_seg, 30)
  const notas = e.notas != null ? cleanQuotes(String(e.notas)) : null

  // Opcionales "suaves"
  const patron = e.patron ? cleanQuotes(String(e.patron)) : null
  const implemento = e.implemento ? cleanQuotes(String(e.implemento)) : null

  return {
    nombre,
    tipo,
    series,
    repeticiones,
    duracion_seg,
    descanso_seg,
    notas,
    ...(patron ? { patron } : {}),
    ...(implemento ? { implemento } : {})
  }
}

async function hasColumn (tableName, columnName) {
  try {
    const result = await query(
      `SELECT column_name 
       FROM information_schema.columns 
       WHERE table_name = $1 AND column_name = $2`,
      [tableName, columnName]
    )
    return result.rows.length > 0
  } catch (e) {
    console.warn(`Error checking column ${tableName}.${columnName}:`, e.message)
    return false
  }
}

// === Variedad: utilidades ===

// Mini-catálogo por tipo/equipamiento (puedes ampliarlo cuando quieras)
const CATALOG = {
  funcional: {
    minimo: [
      { nombre: 'Sentadilla aire', tipo: 'piernas', duracion_seg: 40, descanso_seg: 20 },
      { nombre: 'Zancadas alternas', tipo: 'piernas', series: 3, repeticiones: 12, descanso_seg: 30 },
      { nombre: 'Puente de glúteo', tipo: 'gluteos', series: 3, repeticiones: 15, descanso_seg: 20 },
      { nombre: 'Plancha frontal', tipo: 'core', duracion_seg: 35, descanso_seg: 25 },
      { nombre: 'Plancha lateral', tipo: 'core', duracion_seg: 30, descanso_seg: 20 },
      { nombre: 'Flexiones inclinadas en mesa', tipo: 'empuje', series: 3, repeticiones: 10, descanso_seg: 45 },
      { nombre: 'Remo invertido en mesa', tipo: 'tiron', series: 3, repeticiones: 8, descanso_seg: 45 },
      { nombre: 'Buenos días sin peso', tipo: 'cadena posterior', series: 3, repeticiones: 15, descanso_seg: 30 }
    ],
    basico: [
      { nombre: 'Sentadilla goblet', tipo: 'piernas', series: 3, repeticiones: 12, descanso_seg: 45 },
      { nombre: 'Peso muerto rumano con mancuerna', tipo: 'cadena posterior', series: 3, repeticiones: 10, descanso_seg: 45 },
      { nombre: 'Press de suelo con mancuernas', tipo: 'empuje', series: 3, repeticiones: 10, descanso_seg: 60 },
      { nombre: 'Remo con mancuerna', tipo: 'tiron', series: 3, repeticiones: 12, descanso_seg: 45 },
      { nombre: 'Plancha con arrastre', tipo: 'core', duracion_seg: 40, descanso_seg: 25 },
      { nombre: 'Zancada atrás', tipo: 'piernas', series: 3, repeticiones: 10, descanso_seg: 45 }
    ],
    avanzado: [
      { nombre: 'Pistol asistida', tipo: 'piernas', series: 3, repeticiones: 6, descanso_seg: 60 },
      { nombre: 'Flexión declinada', tipo: 'empuje', series: 4, repeticiones: 10, descanso_seg: 75 },
      { nombre: 'Remo renegado', tipo: 'tiron', series: 3, repeticiones: 10, descanso_seg: 60 },
      { nombre: 'Plancha RKC', tipo: 'core', duracion_seg: 30, descanso_seg: 30 }
    ]
  },
  hiit: {
    minimo: [
      { nombre: 'Burpee sin salto', tipo: 'fullbody', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Mountain climber', tipo: 'core', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Jumping jacks', tipo: 'cardio', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Skater jumps', tipo: 'cardio', duracion_seg: 30, descanso_seg: 15 }
    ],
    basico: [
      { nombre: 'Burpee', tipo: 'fullbody', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'High knees', tipo: 'cardio', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Cuerda simulada', tipo: 'cardio', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Plancha con toque hombro', tipo: 'core', duracion_seg: 30, descanso_seg: 15 }
    ],
    avanzado: [
      { nombre: 'Burpee con salto', tipo: 'fullbody', duracion_seg: 35, descanso_seg: 15 },
      { nombre: 'Squat jump', tipo: 'piernas', duracion_seg: 30, descanso_seg: 15 },
      { nombre: 'Tuck jumps', tipo: 'piernas', duracion_seg: 20, descanso_seg: 20 },
      { nombre: 'Sprint en el sitio', tipo: 'cardio', duracion_seg: 30, descanso_seg: 15 }
    ]
  },
  fuerza: {
    minimo: [
      { nombre: 'Sentadilla isométrica en pared', tipo: 'piernas', duracion_seg: 40, descanso_seg: 40 },
      { nombre: 'Flexión con manos elevadas', tipo: 'empuje', series: 4, repeticiones: 8, descanso_seg: 60 },
      { nombre: 'Remo toalla en puerta', tipo: 'tiron', series: 4, repeticiones: 8, descanso_seg: 60 },
      { nombre: 'Hollow hold', tipo: 'core', duracion_seg: 20, descanso_seg: 40 }
    ],
    basico: [
      { nombre: 'Sentadilla goblet', tipo: 'piernas', series: 4, repeticiones: 8, descanso_seg: 75 },
      { nombre: 'Press militar con mancuernas', tipo: 'empuje', series: 4, repeticiones: 8, descanso_seg: 90 },
      { nombre: 'Remo con mancuerna a banco', tipo: 'tiron', series: 4, repeticiones: 8, descanso_seg: 75 },
      { nombre: 'Plancha con carga', tipo: 'core', duracion_seg: 30, descanso_seg: 60 }
    ],
    avanzado: [
      { nombre: 'Sentadilla búlgara', tipo: 'piernas', series: 4, repeticiones: 8, descanso_seg: 90 },
      { nombre: 'Flexión a pino asistida', tipo: 'empuje', series: 4, repeticiones: 6, descanso_seg: 120 },
      { nombre: 'Remo pendlay con mancuernas', tipo: 'tiron', series: 4, repeticiones: 6, descanso_seg: 90 },
      { nombre: 'Dragon flag asistida', tipo: 'core', series: 3, repeticiones: 5, descanso_seg: 120 }
    ]
  }
}

// Obtiene una lista de alternativas válidas
function getAlternatives (tipo = 'funcional', equip = 'minimo') {
  const group = CATALOG[tipo]?.[equip] || []
  // clona
  return group.map(e => ({ ...e }))
}

// Mezcla simple
function shuffle (a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/* ----------------------- Inventario y guías de diversidad ------------------- */

// ---- Inventario explícito por equipamiento ----
const EQUIPMENT_MAP = {
  minimo: [
    'Peso corporal',
    'Toallas',
    'Silla o sofá',
    'Pared'
  ],
  basico: [
    'Peso corporal',
    'Toallas',
    'Silla o sofá',
    'Pared',
    'Mancuernas ajustables',
    'Bandas elásticas',
    'Esterilla',
    'Banco/Step'
  ],
  avanzado: [
    'Peso corporal',
    'Toallas',
    'Silla o sofá',
    'Pared',
    'Mancuernas ajustables',
    'Bandas elásticas',
    'Esterilla',
    'Banco/Step',
    'Barra de dominadas',
    'Kettlebells',
    'TRX',
    'Discos olímpicos'
  ]
}

// ---- Guías por estilo con enfoque en diversidad ----
const STYLE_GUIDELINES = {
  hiit: [
    'Incluye calentamiento 5–10 min y vuelta a la calma 5–10 min.',
    'Intervalos de 15 s a 4 min a alta intensidad (~RPE 8–9).',
    'Relación trabajo/descanso: 1:1 a 1:2 según nivel.',
    'Volumen de alta intensidad total 10–20 min en sesión de 20–35 min.',
    'Varía el tipo de intervalos (Tabata, EMOM, bloques 30/30, 40/20…).'
  ],
  funcional: [
    'Prioriza patrones: sentadilla, bisagra de cadera, zancada, empuje, tracción, rotación/antirrotación.',
    'Incluye varios planos de movimiento y trabajo unilateral/balance.',
    'Formato circuito/EMOM: 4–6 ejercicios, 30–45 s o 8–12 reps, 30–60 s descanso.',
    'Core integrado en la mayoría de ejercicios.'
  ],
  fuerza: [
    'Prioriza multiarticulares; luego accesorios.',
    'Rangos para fuerza: ≤6 reps, 2–6 series; descanso 2–5 min.',
    'Sin 1RM, usa RPE 7–9 o cargas que permitan 3–6 reps exigentes.',
    'Accesorios a 6–12 reps, 60–90 s descanso cuando aplique.'
  ]
}

/* ----------------------- Carga/normalización del perfil --------------------- */

async function fetchUserProfile (userId) {
  // Obtener datos del usuario desde la tabla users (unificada)
  const profile = {}
  try {
    const u = await query('SELECT * FROM users WHERE id = $1 LIMIT 1', [userId])
    if (u?.rows?.[0]) Object.assign(profile, u.rows[0])
  } catch (_) {}

  // Obtener lesiones activas del usuario
  try {
    const lesiones = await query(
      'SELECT titulo, zona, tipo, gravedad, estado FROM injuries WHERE user_id = $1 AND estado IN ($2, $3) ORDER BY fecha_inicio DESC',
      [userId, 'activo', 'en recuperación']
    )
    if (lesiones?.rows?.length > 0) {
      profile.lesiones_activas = lesiones.rows
    }
  } catch (_) {}

  return profile
}

function normalizeProfile (rawProfile = {}) {
  const p = { ...rawProfile }

  // Solo extraer los datos básicos más importantes para la IA
  const edad = Number(p.edad ?? p.age ?? 0) || undefined
  const peso_kg = Number(p.peso_kg ?? p.peso ?? p.weight_kg ?? 0) || undefined
  const altura_cm = Number(p.altura_cm ?? p.altura ?? p.height_cm ?? 0) || undefined

  // Nivel de experiencia
  const nivel = p.nivel || p.experience || 'principiante'

  // Lesiones/limitaciones - priorizar lesiones activas de la tabla injuries
  let lesiones = 'Ninguna'

  if (p.lesiones_activas && Array.isArray(p.lesiones_activas) && p.lesiones_activas.length > 0) {
    // Usar lesiones activas de la tabla injuries
    lesiones = p.lesiones_activas.map(l => {
      const parts = [l.titulo || 'Lesión']
      if (l.zona) parts.push(`(${l.zona})`)
      if (l.gravedad) parts.push(`- ${l.gravedad}`)
      return parts.join(' ')
    }).join(', ')
  } else {
    // Fallback a limitaciones del perfil
    const limitaciones = p.limitaciones ?? p.lesiones
    if (Array.isArray(limitaciones) && limitaciones.length > 0) {
      lesiones = limitaciones.filter(Boolean).join(', ')
    } else if (typeof limitaciones === 'string' && limitaciones.trim()) {
      lesiones = limitaciones.trim()
    } else if (typeof limitaciones === 'object' && limitaciones !== null) {
      // Intentar extraer información útil del objeto
      try {
        const keys = Object.keys(limitaciones)
        if (keys.length > 0) {
          lesiones = keys.map(k => `${k}: ${limitaciones[k]}`).join(', ')
        }
      } catch (e) {
        lesiones = 'Ninguna'
      }
    }
  }

  // IMC si tenemos peso y altura
  let imc
  if (peso_kg && altura_cm) {
    const m = altura_cm / 100
    imc = Number((peso_kg / (m * m)).toFixed(1))
  }

  return {
    edad,
    peso_kg,
    altura_cm,
    imc,
    nivel,
    lesiones
  }
}

/* ----------------------- Fallback: plan si no hay OpenAI -------------------- */

function buildTodayPlanFallback ({ tipo, equipamiento }) {
  const fecha = todayYYYYMMDD()
  const baseDescanso = equipamiento === 'avanzado' ? 30 : equipamiento === 'basico' ? 40 : 45
  const baseSeries = equipamiento === 'avanzado' ? 4 : 3

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
  }

  const lista = blocks[tipo] || blocks.hiit
  const duracion_estimada_min = Math.max(20, Math.round(lista.reduce((acc, e) => {
    const porSerie = e.tipo === 'time' ? (e.duracion_seg + e.descanso_seg) : (40 + e.descanso_seg)
    return acc + porSerie * (e.series || 3)
  }, 0) / 60))

  return {
    titulo: `${tipo.toUpperCase()} en Casa`,
    subtitulo: 'Entrenamiento personalizado adaptado a tu equipamiento',
    fecha,
    equipamiento,
    tipoEntrenamiento: tipo,
    duracion_estimada_min,
    ejercicios: lista
  }
}

/* ----------------------- Post-filtro de variedad ---------------------------- */

async function enforceVarietyOnPlan (plan, { userId, tipo, equipamiento, recentNames = [], fallbackFn = null }) {
  if (!plan || !Array.isArray(plan.ejercicios)) return plan

  const avoidSet = new Set(recentNames.map(canonName))
  const seen = new Set()
  const toReplaceIdx = []

  // 1) marca duplicados o "evitar"
  plan.ejercicios.forEach((e, idx) => {
    const c = canonName(e?.nombre || '')
    const isDup = seen.has(c)
    const isAvoid = avoidSet.has(c)
    if (isDup || isAvoid) {
      toReplaceIdx.push(idx)
    } else {
      seen.add(c)
    }
  })

  if (!toReplaceIdx.length) {
    plan.meta = { ...(plan.meta || {}), variety: { enforced: false, replaced: [], deduped: [] } }
    return plan
  }

  // 2) pool de alternativas
  const pool = shuffle(getAlternatives(tipo, equipamiento))
  // excluir ya usados
  const used = new Set(Array.from(seen))
  const pickNext = (template = {}) => {
    while (pool.length) {
      const cand = pool.shift()
      const c = canonName(cand.nombre)
      if (!used.has(c) && !avoidSet.has(c)) {
        used.add(c)
        // normaliza campos mínimos
        return {
          nombre: cand.nombre,
          tipo: cand.tipo || template?.tipo || null,
          series: cand.series ?? template?.series ?? 3,
          repeticiones: cand.repeticiones ?? template?.repeticiones ?? 10,
          duracion_seg: cand.duracion_seg ?? template?.duracion_seg ?? null,
          descanso_seg: cand.descanso_seg ?? template?.descanso_seg ?? 30,
          notas: cand.notas ?? null
        }
      }
    }
    return null
  }

  const replacedNames = []
  const dedupedNames = []

  // 3) reemplaza
  for (const idx of toReplaceIdx) {
    const e = plan.ejercicios[idx]
    const wasDup = used.has(canonName(e?.nombre || '')) // después del primer pase, seen==used
    const cand = pickNext(e)
    if (cand) {
      if (wasDup) dedupedNames.push(e?.nombre || '')
      else replacedNames.push(e?.nombre || '')
      plan.ejercicios[idx] = { ...cand }
    }
  }

  // 4) fallback si aún faltan reemplazos válidos
  if (plan.ejercicios.some((x) => !x?.nombre) && typeof fallbackFn === 'function') {
    try {
      const fb = await fallbackFn({ profile: plan?.meta?.profile_used, tipo, equipamiento })
      const extras = Array.isArray(fb?.ejercicios) ? fb.ejercicios : []
      for (let i = 0; i < plan.ejercicios.length; i++) {
        if (!plan.ejercicios[i]?.nombre && extras.length) {
          const nxt = extras.shift()
          const c = canonName(nxt?.nombre || '')
          if (nxt?.nombre && !used.has(c) && !avoidSet.has(c)) {
            used.add(c)
            plan.ejercicios[i] = { ...nxt }
          }
        }
      }
    } catch {}
  }

  plan.meta = {
    ...(plan.meta || {}),
    variety: { enforced: true, replaced: replacedNames, deduped: dedupedNames }
  }
  return plan
}

/* ----------------------------- Prompt de OpenAI ----------------------------- */

function buildPrompt ({ profile, tipo, equipamiento, avoidList = [] }) {
  // MVP de datos básicos
  const edad = profile.edad || 30
  const peso = profile.peso_kg || 70
  const altura = profile.altura_cm || 170
  const nivel = profile.nivel || 'principiante'
  const lesiones = profile.lesiones || 'Ninguna'

  const equipCanon = (equipamiento || 'minimo').toLowerCase()
  const tipoCanon = (tipo || 'hiit').toLowerCase()

  const inventario = (EQUIPMENT_MAP[equipCanon] || EQUIPMENT_MAP.minimo).join(', ')
  const reglasEstilo = (STYLE_GUIDELINES[tipoCanon] || STYLE_GUIDELINES.hiit)
    .map((r, i) => `  ${i + 1}. ${r}`)
    .join('\n')

  // Reglas de diversidad aplicables a todos los estilos
  const reglasDiversidad = [
    'No repitas el mismo PATRÓN de movimiento en dos ejercicios consecutivos.',
    'Rota los IMPLEMENTOS disponibles entre ejercicios consecutivos cuando sea posible.',
    'Evita repetir el mismo ejercicio de nombre similar dos veces seguidas.',
    'Con equipamiento minimo: al menos 3 ejercicios solo con peso corporal.',
    'Con equipamiento basico: incluye ≥2 ejercicios con mancuernas o bandas.',
    'Con equipamiento avanzado: incluye 1–2 ejercicios con kettlebell/TRX/dominadas si cuadra con el estilo.'
  ].map((r, i) => `  ${i + 1}. ${r}`).join('\n')

  const evitarTexto = avoidList.length
    ? `Evita repetir estos ejercicios (o variaciones con el mismo nombre base) usados recientemente por el usuario: ${avoidList.join(', ')}.`
    : 'Evita repetir exactamente el mismo ejercicio dos días seguidos.'

  return `
Eres "MindFit Coach", un entrenador personal experto.

IMPORTANTE: Responde ÚNICAMENTE con JSON válido. NO incluyas:
- Comentarios JavaScript (//)
- Comentarios de bloque (/* */)
- Texto explicativo fuera del JSON
- Markdown o código formateado
- Propiedades sin comillas

Genera un plan para HOY (${todayYYYYMMDD()}) de entrenamiento en casa.

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
- Varía patrones de movimiento y planos.
- Alterna grupos musculares primarios.
- ${evitarTexto}
${reglasDiversidad}

FORMATO EXACTO del JSON de salida (sin comentarios):
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
      "patron": "sentadilla",
      "implemento": "mancuernas"
    }
  ]
}

IMPORTANTE sobre el campo "tipo":
- SOLO usa "time" o "reps" (no uses "intervalo", "tiempo", ni otros valores)
- "time": ejercicio por tiempo con duracion_seg (repeticiones = null)
- "reps": ejercicio por repeticiones con repeticiones (duracion_seg = null)

Reglas generales:
- Genera 4–6 ejercicios.
- Adapta la intensidad a nivel y lesiones; da regresiones si algo no es viable.
- Si "hiit": respeta relaciones trabajo/descanso y duración total indicada.
- Si "fuerza": respeta rangos de series/reps/descansos indicados.
- Si "funcional": cubre al menos 3 patrones distintos y ≥2 planos.
- No incluyas texto fuera del JSON.`
}

/* --------------------------- Endpoint: generate-today ----------------------- */
/**
 * POST /api/ia/home-training/generate-today
 * body: { userId, equipamiento, tipoEntrenamiento }
 */
router.post('/home-training/generate-today', async (req, res) => {
  try {
    const { userId, equipamiento, tipoEntrenamiento } = req.body || {}
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta userId.' })
    }

    const tipo = canonTipo(tipoEntrenamiento)
    const equip = canonEquipamiento(equipamiento)

    // Carga perfil desde BD (best-effort)
    const raw = await fetchUserProfile(userId)
    const profile = normalizeProfile(raw)

    // Historial reciente → evitar repeticiones
    const recentNames = await fetchRecentExerciseNames(userId, 10, 150)
    // Para no inflar el prompt, reduce a 20–25 elementos
    const avoidList = recentNames.slice(0, 25)

    // Llamada a OpenAI si disponible
    let plan = null
    if (openai) {
      try {
        const prompt = buildPrompt({
          profile,
          tipo,
          equipamiento: equip,
          avoidList
        })
        console.log('🤖 Llamando a OpenAI para generar entrenamiento...')

        // Usar la API correcta de OpenAI
        const resp = await openai.chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Eres MindFit Coach, un entrenador personal experto. Responde ÚNICAMENTE con JSON válido. NO incluyas comentarios JavaScript (//), comentarios de bloque (/* */), markdown, ni texto adicional. Solo el objeto JSON puro.'
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.9, // ↑ más variedad
          top_p: 0.95, // nucleus sampling
          frequency_penalty: 0.3, // ↓ repeticiones literales
          presence_penalty: 0.2, // ↑ novedad temática
          max_tokens: 2000
        })

        const rawText = resp?.choices?.[0]?.message?.content || ''
        console.log('🤖 Respuesta de OpenAI recibida:', `${rawText.substring(0, 200)}...`)
        console.log('🤖 Respuesta completa:', rawText)

        // Parseo robusto con helpers mejorados
        const modelText = typeof rawText === 'string' ? rawText : String(rawText || '')
        console.log('📄 Respuesta del modelo:', modelText)

        // Intentar parseo con estrategia robusta
        plan = tryParseModelJsonStrong(modelText)
        
        if (plan) {
          console.log('✅ tryParseModelJsonStrong succeeded')
          console.log('📊 Plan structure check:', {
            hasPlan: !!plan,
            hasEjercicios: !!plan.ejercicios,
            isEjerciciosArray: Array.isArray(plan.ejercicios),
            ejerciciosLength: plan.ejercicios?.length || 0
          })
        } else {
          console.log('❌ tryParseModelJsonStrong failed, trying cleanAndParseJson...')
          plan = cleanAndParseJson(modelText)
          
          if (plan) {
            console.log('✅ cleanAndParseJson succeeded as fallback')
          } else {
            console.log('❌ cleanAndParseJson also failed')
          }
        }

        let metaSource = 'openai'
        // Si aún así no hay plan válido → fallback
        if (!plan || !Array.isArray(plan.ejercicios)) {
          console.warn('⚠️ JSON inválido incluso tras limpieza → usando fallback')
          console.error('❌ JSON problemático:', extractJsonBlock(modelText))
          // Fallback si el parseo robusto no puede
          plan = await buildTodayPlanFallback({ profile, tipo, equipamiento: equip })
          metaSource = 'fallback'
        }

        // Asegura meta coherente
        plan = plan || {}
        plan._from_ai = metaSource === 'openai'
        plan.meta = {
          ...(plan.meta || {}),
          source: metaSource,
          profile_used: {
            edad: profile.edad,
            peso_kg: profile.peso_kg,
            altura_cm: profile.altura_cm,
            nivel: profile.nivel,
            imc: profile.imc,
            lesiones: profile.lesionesPretty || profile.lesiones || '—'
          }
        }

        // Sanitiza ejercicios: tipos, números y defaults
        if (Array.isArray(plan.ejercicios)) {
          plan.ejercicios = plan.ejercicios.map(sanitizeExercise)
        }

        if (metaSource === 'openai') {
          console.log('✅ Plan de IA generado exitosamente:', plan.titulo)
        }
      } catch (err) {
        console.warn('⚠️ OpenAI falló, usando fallback:', err?.message || err)
      }
    } else {
      console.log('⚠️ OpenAI no disponible, usando fallback')
    }

    if (!plan) {
      plan = buildTodayPlanFallback({ tipo, equipamiento: equip })
    }

    // Sanitiza estructura mínima (preservando _from_ai)
    const isFromAI = plan?._from_ai
    plan = {
      titulo: plan?.titulo || `${tipo.toUpperCase()} en Casa`,
      subtitulo: plan?.subtitulo || 'Entrenamiento personalizado adaptado a tu equipamiento',
      fecha: plan?.fecha || todayYYYYMMDD(),
      equipamiento: canonEquipamiento(plan?.equipamiento || equip),
      tipoEntrenamiento: canonTipo(plan?.tipoEntrenamiento || tipo),
      duracion_estimada_min: Number(plan?.duracion_estimada_min) || 30,
      ejercicios: Array.isArray(plan?.ejercicios)
        ? plan.ejercicios.map((e) => ({
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
        }))
        : [],
      _from_ai: isFromAI // Preservar el flag de IA
    }

    // Post-filtro de variedad
    const fallbackFn = typeof buildTodayPlanFallback === 'function' ? buildTodayPlanFallback : null
    plan = await enforceVarietyOnPlan(plan, {
      userId,
      tipo,
      equipamiento: equip,
      recentNames,
      fallbackFn
    })

    // Meta para depuración/UX (lesiones legibles)
    const meta = {
      source: plan?._from_ai ? 'openai' : 'fallback',
      profile_used: {
        edad: profile.edad,
        peso_kg: profile.peso_kg,
        altura_cm: profile.altura_cm,
        nivel: profile.nivel,
        imc: profile.imc,
        lesiones: (() => {
          const v = profile.lesiones
          if (Array.isArray(v)) {
            return v.map((l) =>
              typeof l === 'object'
                ? [l.zona, l.tipo, l.gravedad].filter(Boolean).join(' / ')
                : String(l)
            ).filter(Boolean).join(', ')
          }
          if (v && typeof v === 'object') {
            try {
              return Object.entries(v).map(([k, val]) => `${k}: ${String(val)}`).join(', ')
            } catch { return '—' }
          }
          const s = v == null ? '—' : String(v)
          return s === '[object Object]' ? '—' : s
        })()
      }
    }

    return res.json({ success: true, data: plan, meta })
  } catch (err) {
    console.error('❌ Error en generate-today:', err)
    return res.status(500).json({ success: false, error: 'Error generando el entrenamiento de hoy.' })
  }
})

/* --------------------------- Endpoint: log-session -------------------------- */
/**
 * Registra la sesión realizada por el usuario al terminar el player.
 * POST /api/ia/home-training/log-session
 * body: {
 *   userId, plan: {...}, metrics: { duration_sec, exercises_done, total_exercises },
 *   seriesCompleted?: number[], startedAt?: ISO, finishedAt?: ISO
 * }
 */
let ensuredWorkoutSessions = false

async function ensureWorkoutSessionExercisesTable () {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS workout_session_exercises (
        id SERIAL PRIMARY KEY,
        session_id INTEGER NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        exercise_index INTEGER NOT NULL,
        nombre TEXT NOT NULL,
        tipo TEXT,
        series_prescritas INTEGER,
        series_completadas INTEGER,
        repeticiones INTEGER,
        duracion_seg INTEGER,
        descanso_seg INTEGER,
        notas TEXT,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_wse_user_created_at ON workout_session_exercises(user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_wse_user_nombre ON workout_session_exercises(user_id, nombre);
    `)
  } catch (e) {
    console.warn('No se pudo crear/verificar workout_session_exercises:', e.message)
  }
}

async function ensureWorkoutSessionsTable () {
  if (ensuredWorkoutSessions) return
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
      -- NUEVO: estado y fuente
      ALTER TABLE workout_sessions
        ADD COLUMN IF NOT EXISTS session_status TEXT DEFAULT 'completed',
        ADD COLUMN IF NOT EXISTS meta_source TEXT;
    `)
    ensuredWorkoutSessions = true
    console.log('✅ Tabla workout_sessions verificada/creada')
  } catch (e) {
    console.warn('No se pudo crear/verificar workout_sessions:', e.message)
  }
}

router.post('/home-training/log-session', async (req, res) => {
  try {
    const { userId, plan, metrics = {}, seriesCompleted, startedAt, finishedAt } = req.body || {}
    if (!userId || !plan) {
      return res.status(400).json({ success: false, error: 'Faltan userId o plan.' })
    }

    await ensureWorkoutSessionsTable()
    await ensureWorkoutSessionExercisesTable()

    // Acepta BOTH naming (frontend actual y legado)
    const duration_sec = Number(metrics.duration_sec ?? metrics.duracion_real_seg ?? 0) || 0
    const exercises_done = Number(metrics.exercises_done ?? metrics.completados ?? 0) || 0
    const total_exercises = Number(metrics.total_exercises ?? metrics.total_ejercicios ?? (plan?.ejercicios?.length || 0))
    const session_status = String(metrics.status || 'completed')
    const meta_source = plan?._from_ai ? 'openai' : 'fallback'

    // Variables para esquema legado (si es necesario)
    const equip = 'minimo' // fallback, podría extraerse de plan
    const tipo = 'funcional' // fallback, podría extraerse de plan

    // 🔎 detectar columnas disponibles (nuevo vs legado)
    const needNewCols = ['plan_json', 'fecha_sesion', 'duration_sec', 'exercises_done', 'total_exercises']
    const flags = await Promise.all(needNewCols.map(c => hasColumn('workout_sessions', c)))
    const hasNewSchema = flags.every(Boolean) // SOLO si están TODAS las columnas nuevas

    const hasDetalle = await hasColumn('workout_sessions', 'detalle') // legado
    const hasFecha = await hasColumn('workout_sessions', 'fecha') // legado

    // 1) Inserta cabecera de sesión
    let insertRes

    if (hasNewSchema) {
      // ✅ Esquema NUEVO (todas las cols existen)
      insertRes = await query(
        `INSERT INTO workout_sessions (
          user_id, fecha_sesion, plan_json, duration_sec, exercises_done, 
          total_exercises, series_completed, started_at, finished_at, 
          session_status, meta_source
         )
         VALUES ($1, CURRENT_DATE, $2::jsonb, $3, $4, $5, $6::jsonb, $7, $8, $9, $10)
         RETURNING id`,
        [
          userId,
          JSON.stringify(plan),
          duration_sec,
          exercises_done,
          total_exercises,
          seriesCompleted ? JSON.stringify(seriesCompleted) : null,
          startedAt ? new Date(startedAt) : null,
          finishedAt ? new Date(finishedAt) : null,
          session_status,
          meta_source
        ]
      )
    } else if (hasDetalle && hasFecha) {
      // ✅ Esquema LEGADO
      insertRes = await query(
        `INSERT INTO workout_sessions
          (user_id, fecha, equipamiento, tipo, duracion_real_seg, total_ejercicios, completados, status, detalle)
         VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8::jsonb)
         RETURNING id`,
        [
          userId,
          equip,
          tipo,
          duration_sec,
          total_exercises,
          exercises_done,
          session_status,
          JSON.stringify(plan)
        ]
      )
    } else {
      return res.status(500).json({
        success: false,
        error: 'Esquema de workout_sessions no compatible (faltan columnas).'
      })
    }

    const sessionId = insertRes.rows?.[0]?.id

    // 2) Inserta detalle por ejercicio (para variedad y analítica)
    const ejercicios = Array.isArray(plan?.ejercicios) ? plan.ejercicios : []
    const sc = Array.isArray(seriesCompleted) ? seriesCompleted : []

    for (let i = 0; i < ejercicios.length; i++) {
      const raw = ejercicios[i] || {}
      const e = sanitizeExercise(raw) // ← NUEVO
      const doneSeries = asInt((seriesCompleted || [])[i], 0) || 0
      const prescribed = asInt(e.series, 1) || 1
      const isCompleted = doneSeries >= prescribed

      await query(
        `INSERT INTO workout_session_exercises
          (session_id, user_id, exercise_index, nombre, tipo, series_prescritas, series_completadas, repeticiones, duracion_seg, descanso_seg, notas, completed)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          sessionId,
          userId,
          i,
          e.nombre,
          e.tipo,
          prescribed,
          doneSeries,
          e.repeticiones,
          e.duracion_seg,
          e.descanso_seg,
          e.notas,
          isCompleted
        ]
      )
    }

    console.log('✅ Sesión de IA registrada con ID:', sessionId, 'y', ejercicios.length, 'ejercicios')
    return res.json({ success: true, id: sessionId })
  } catch (err) {
    console.error('❌ Error en log-session:', err)
    return res.status(500).json({ success: false, error: 'No se pudo registrar la sesión.' })
  }
})

/* ---------------------- Endpoint: recommend-and-generate -------------------- */
/**
 * POST /api/ia/recommend-and-generate
 * body: { userId, profile, forcedMethodology }
 *
 * Este endpoint integra las lesiones del usuario con las recomendaciones de metodología
 */
router.post('/recommend-and-generate', async (req, res) => {
  try {
    const { userId, profile, forcedMethodology } = req.body || {}
    if (!userId) {
      return res.status(400).json({ success: false, error: 'Falta userId.' })
    }

    // Obtener perfil completo del usuario incluyendo lesiones
    const rawProfile = await fetchUserProfile(userId)
    const normalizedProfile = normalizeProfile(rawProfile)

    // Combinar con el perfil enviado desde el frontend
    const fullProfile = { ...normalizedProfile, ...profile }

    // Simular respuesta exitosa (aquí podrías integrar con OpenAI para recomendaciones)
    const mockResponse = {
      success: true,
      data: {
        methodology: forcedMethodology || 'Entrenamiento Funcional',
        reason: `Basándome en tu perfil (edad: ${fullProfile.edad}, nivel: ${fullProfile.nivel}, lesiones: ${fullProfile.lesiones}), esta metodología es la más adecuada.`,
        profile_used: fullProfile,
        created_at: new Date().toISOString()
      }
    }

    return res.json(mockResponse)
  } catch (err) {
    console.error('❌ Error en recommend-and-generate:', err)
    return res.status(500).json({ success: false, error: 'Error generando recomendación.' })
  }
})

/* ---------------------- (Opcional) ping para diagnóstico -------------------- */
router.get('/home-training/ping', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() })
})

export default router
