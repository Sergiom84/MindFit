// Test script para verificar el parsing de JSON con tipo "intervalo"
const problematicJson = `{
  "titulo": "HIIT en Casa",
  "subtitulo": "Entrenamiento personalizado",
  "fecha": "2025-08-16",
  "equipamiento": "avanzado",
  "tipoEntrenamiento": "hiit",
  "duracion_estimada_min": 30,
  "ejercicios": [
    {
      "nombre": "Sentadilla sumo con kettlebell",
      "tipo": "intervalo",
      "series": 4,
      "repeticiones": null,
      "descanso_seg": 30,
      "duracion_seg": 40,
      "notas": "Mantén la espalda recta y los pies más anchos que los hombros.",
      "patron": "sentadilla",
      "implemento": "kettlebell"
    },
    {
      "nombre": "Remo con TRX",
      "tipo": "intervalo",
      "series": 4,
      "repeticiones": null,
      "descanso_seg": 30,
      "duracion_seg": 40,
      "notas": "Ajusta la inclinación para aumentar o disminuir la dificultad.",
      "patron": "tracción",
      "implemento": "TRX"
    },
    {
      "nombre": "Mountain climbers alternando piernas",
      "tipo": "intervalo",
      "series": 4,
      "repeticiones": null,
      "descanso_seg": 30,
      "duracion_seg": 30,
      "notas": "",
      "patron": "carrera/caminata",
      "implemento": null
    }
  ]
}`

// Funciones copiadas del archivo backend/routes/ia.js para testing
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

function repairIncompleteExerciseJson(jsonStr) {
  if (!jsonStr) return jsonStr
  
  const lastCommaInExercises = jsonStr.lastIndexOf(',', jsonStr.lastIndexOf('"ejercicios"'))
  if (lastCommaInExercises > -1) {
    let truncated = jsonStr.substring(0, lastCommaInExercises)
    
    let openBraces = (truncated.match(/\{/g) || []).length
    let closeBraces = (truncated.match(/\}/g) || []).length
    let openBrackets = (truncated.match(/\[/g) || []).length
    let closeBrackets = (truncated.match(/\]/g) || []).length
    
    while (openBrackets > closeBrackets) {
      truncated += ']'
      closeBrackets++
    }
    
    while (openBraces > closeBraces) {
      truncated += '}'
      closeBraces++
    }
    
    return truncated
  }
  
  return jsonStr
}

function repairModelJson (text = '') {
  if (!text) return ''

  let s = text
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/```(?:json)?/gi, '')
    .replace(/```/g, '')
    .replace(/\u2026/g, '')
    .replace(/\.\.\./g, '')

  s = extractJsonBlock(s)
  s = repairIncompleteExerciseJson(s)

  // Normalizar tipos: "intervalo" -> "time"
  s = s.replace(/("tipo"\s*:\s*")\s*(tiempo|time|reps|intervalo)\s*(")/gi, (_, p1, val, p3) => {
    const v = String(val).toLowerCase();
    return p1 + (v === 'tiempo' || v === 'intervalo' ? 'time' : v) + p3;
  });

  return s
}

function asInt (v, fallback = null) {
  if (v === null || v === undefined || v === '') return fallback
  const n = Number(v)
  return Number.isFinite(n) ? Math.trunc(n) : fallback
}

function cleanQuotes (s = '') {
  return String(s)
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/^['"]+|['"]+$/g, '')
    .replace(/''/g, "'")
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

// Prueba
console.log('=== TESTING JSON PARSING ===')

try {
  console.log('1. JSON original:')
  console.log(problematicJson.slice(0, 200) + '...')

  console.log('\n2. Aplicando reparación:')
  const repaired = repairModelJson(problematicJson)
  console.log('Reparado:', repaired.slice(0, 300) + '...')

  console.log('\n3. Intentando parsear:')
  const parsed = JSON.parse(repaired)
  console.log('✅ Parse exitoso!')
  console.log('Título:', parsed.titulo)
  console.log('Ejercicios:', parsed.ejercicios.length)

  console.log('\n4. Sanitizando ejercicios:')
  const sanitized = parsed.ejercicios.map(sanitizeExercise)
  sanitized.forEach((ex, i) => {
    console.log(`Ejercicio ${i + 1}: ${ex.nombre} (${ex.tipo}) - Series: ${ex.series}, Duración: ${ex.duracion_seg}seg`)
  })

  console.log('\n✅ TODAS LAS PRUEBAS PASARON - El fix debería funcionar!')

} catch (error) {
  console.error('❌ Error en las pruebas:', error.message)
}
