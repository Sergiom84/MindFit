// backend/routes/auth.js
import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db.js'

const router = express.Router()

/* ============================
 * Helpers de Normalización
 * ============================ */

// Textos: "" -> null
const textOrNull = (v) => {
  if (v === '' || v === undefined || v === null) return null
  const s = String(v).trim()
  return s === '' ? null : s
}

// Números: "" -> null; si no es número válido -> null; si es número -> Number
const numOrNull = (v) => {
  if (v === '' || v === undefined || v === null) return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

// JSONB genérico:
//  - ""/undefined/null -> null
//  - string JSON válido -> JSON.stringify(parsed)
//  - string NO-JSON -> JSON.stringify(value)
//  - objeto/array -> JSON.stringify(value)
const jsonbStringOrNull = (value) => {
  if (value === '' || value === undefined || value === null) return null
  if (typeof value === 'string') {
    try {
      return JSON.stringify(JSON.parse(value))
    } catch {
      return JSON.stringify(value)
    }
  }
  try {
    return JSON.stringify(value)
  } catch {
    // Convierte arrays de strings a arrays de objetos con fecha
    const toDatedObjects = (arr) => {
      if (!Array.isArray(arr)) return []
      return arr.map((it) => {
        if (typeof it === 'string') return { nombre: it.trim(), createdAt: new Date().toISOString() }
        if (it && typeof it === 'object') {
          const nombre = String(it.nombre ?? '').trim()
          const createdAt = it.createdAt || new Date().toISOString()
          return nombre ? { nombre, createdAt } : null
        }
        return null
      }).filter(Boolean)
    }

    return null
  }
}

// Caso especial "limitaciones": permitimos que un string NO-JSON se guarde como array de un ítem
const limitacionesStringOrNull = (value) => {
  if (value === '' || value === undefined || value === null) return null
  if (typeof value === 'string') {
    try { return JSON.stringify(JSON.parse(value)) } catch { return JSON.stringify([value]) }
  }
  try {
    return JSON.stringify(value)
  } catch {
    return null
  }
}

// Para leer desde DB: asegurar que devolvemos array/objeto y nunca revienta el front
const normalizeLimitacionesOut = (value) => {
  try {
    if (value == null) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'object') return value
    const s = String(value).trim()
    if (!s) return []
    try {
      const parsed = JSON.parse(s)
      if (Array.isArray(parsed)) return parsed
      if (parsed && typeof parsed === 'object') return [parsed]
    } catch (_) {}
    return [{ titulo: s }]
  } catch {
    return []
  }
}

// Campos de texto que normalizaremos "" -> null en registro/patch
const TEXT_FIELDS = [
  'sexo', 'nivel_actividad', 'experiencia', 'metodologia_preferida', 'enfoque', 'horario_preferido',
  'objetivo_principal'
]

/* ============================
 * Registro de usuario
 * ============================ */
router.post('/register', async (req, res) => {
  try {
    const data = req.body || {}

    // Validación: ahora "apellido" NO es obligatorio
    if (!data.nombre || !data.email || !data.password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, email y password son requeridos'
      })
    }

    // ¿email en uso?
    const existing = await query('SELECT id FROM public.users WHERE email = $1', [data.email])
    if (existing.rows.length > 0) {
      return res.status(409).json({ success: false, error: 'El email ya está registrado' })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(String(data.password), 10)

    // Normalización básica
    const nombre = textOrNull(data.nombre)
    const apellido = textOrNull(data.apellido) // <- opcional
    const email = String(data.email).trim().toLowerCase()

    // Iniciales robustas (si no hay apellido, usar 2 primeras del nombre; fallback "MF")
    const iniciales = (
      (nombre?.[0] || '') + (apellido?.[0] || '')
    ).toUpperCase() || (nombre?.slice(0, 2)?.toUpperCase() || 'MF')

    // Numéricos
    const edad = numOrNull(data.edad)
    const peso = numOrNull(data.peso)
    const altura = numOrNull(data.altura)
    const años_entrenando = numOrNull(data.años_entrenando)
    const frecuencia_semanal = numOrNull(data.frecuencia_semanal)
    const grasa_corporal = numOrNull(data.grasa_corporal)
    const masa_muscular = numOrNull(data.masa_muscular)
    const agua_corporal = numOrNull(data.agua_corporal)
    const metabolismo_basal = numOrNull(data.metabolismo_basal)
    const cintura = numOrNull(data.cintura)
    const pecho = numOrNull(data.pecho)
    const brazos = numOrNull(data.brazos)
    const muslos = numOrNull(data.muslos)
    const cuello = numOrNull(data.cuello)
    const antebrazos = numOrNull(data.antebrazos)
    const meta_peso = numOrNull(data.meta_peso)
    const meta_grasa = numOrNull(data.meta_grasa)
    const comidas_diarias = numOrNull(data.comidas_diarias)

    // Textos ("" -> null)
    const nivel = textOrNull(data.nivel) || 'principiante'
    const sexo = textOrNull(data.sexo)
    const nivel_actividad = textOrNull(data.nivel_actividad)
    const experiencia = textOrNull(data.experiencia)
    const metodologia_preferida = textOrNull(data.metodologia_preferida)
    const enfoque = textOrNull(data.enfoque)
    const horario_preferido = textOrNull(data.horario_preferido)
    const objetivo_principal = textOrNull(data.objetivo_principal)

    // JSONB
    const historial_medico = jsonbStringOrNull(data.historial_medico)
    const limitaciones = limitacionesStringOrNull(data.limitaciones)
    const alergias = jsonbStringOrNull(data.alergias)
    const medicamentos = jsonbStringOrNull(data.medicamentos)
    const suplementacion = jsonbStringOrNull(data.suplementacion)
    const alimentos_excluidos = jsonbStringOrNull(data.alimentos_excluidos)

    // IMC robusto
    let imc = null
    if (peso != null && altura != null && altura > 0) {
      const alturaM = altura / 100
      imc = Number((peso / (alturaM * alturaM)).toFixed(1))
    }

    const insertText = `
      INSERT INTO users(
        nombre, apellido, email, password, iniciales, nivel, edad, sexo, peso, altura, imc,
        nivel_actividad, experiencia, años_entrenando, metodologia_preferida, frecuencia_semanal,
        grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,
        cintura, pecho, brazos, muslos, cuello, antebrazos,
        historial_medico, limitaciones, alergias, medicamentos,
        objetivo_principal, meta_peso, meta_grasa, enfoque, horario_preferido,
        comidas_diarias, suplementacion, alimentos_excluidos,
        fecha_inicio_objetivo, fecha_meta_objetivo, notas_progreso
      ) VALUES(
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,
        $12,$13,$14,$15,$16,
        $17,$18,$19,$20,
        $21,$22,$23,$24,$25,$26,
        $27,$28,$29,$30,
        $31,$32,$33,$34,$35,
        $36,$37,$38,$39,$40,$41
      )
      RETURNING id, nombre, apellido, email, iniciales, nivel, edad, sexo, peso, altura, imc
    `

    const values = [
      nombre, apellido, email, hashedPassword, iniciales, nivel, edad, sexo, peso, altura, imc,
      nivel_actividad, experiencia, años_entrenando, metodologia_preferida, frecuencia_semanal,
      grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,
      cintura, pecho, brazos, muslos, cuello, antebrazos,
      historial_medico, limitaciones, alergias, medicamentos,
      objetivo_principal, meta_peso, meta_grasa, enfoque, horario_preferido,
      comidas_diarias, suplementacion, alimentos_excluidos,
      null, null, null // fecha_inicio_objetivo, fecha_meta_objetivo, notas_progreso
    ]

    const result = await query(insertText, values)
    const newUser = result.rows[0]

    res.status(201).json({ success: true, message: 'Usuario registrado exitosamente', user: newUser })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

/* ============================
 * Login
 * ============================ */
router.post('/login', async (req, res) => {
  try {
    const email = textOrNull(req.body?.email)?.toLowerCase()
    const password = req.body?.password

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password son requeridos' })
    }

    const result = await query('SELECT * FROM public.users WHERE email = $1', [email])
    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }

    const user = result.rows[0]
    const isValid = await bcrypt.compare(String(password), user.password)
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas' })
    }

    delete user.password
    user.limitaciones = normalizeLimitacionesOut(user.limitaciones)
    return res.json({ success: true, message: 'Login exitoso', user })
  } catch (error) {
    console.error('Error en login:', error)
    return res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

/* ============================
 * PATCH perfil
 * ============================ */
router.patch('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id
    const raw = req.body || {}

    // Solo permitidos:
    const allowed = new Set([
      'nombre', 'apellido', 'edad', 'sexo', 'peso', 'altura', 'imc', 'nivel_actividad',
      'nivel', 'años_entrenando', 'metodologia_preferida', 'frecuencia_semanal',
      'grasa_corporal', 'masa_muscular', 'agua_corporal', 'metabolismo_basal',
      'cintura', 'pecho', 'brazos', 'muslos', 'cuello', 'antebrazos',
      'historial_medico', 'limitaciones', 'alergias', 'medicamentos',
      'objetivo_principal', 'meta_peso', 'meta_grasa', 'enfoque', 'horario_preferido',
      'comidas_diarias', 'suplementacion', 'alimentos_excluidos',
      'fecha_inicio_objetivo', 'fecha_meta_objetivo', 'notas_progreso'
    ])

    // Filtrar y normalizar
    const patchData = {}
    for (const [k, v] of Object.entries(raw)) {
      if (!allowed.has(k)) continue

      // Numéricos
      if ([
        'edad', 'peso', 'altura', 'años_entrenando', 'frecuencia_semanal',
        'grasa_corporal', 'masa_muscular', 'agua_corporal', 'metabolismo_basal',
        'cintura', 'pecho', 'brazos', 'muslos', 'cuello', 'antebrazos',
        'meta_peso', 'meta_grasa', 'comidas_diarias'
      ].includes(k)) {
        patchData[k] = numOrNull(v)
        continue
      }

      // JSONB genéricos
      if (['historial_medico', 'alergias', 'medicamentos', 'suplementacion', 'alimentos_excluidos'].includes(k)) {
        patchData[k] = jsonbStringOrNull(v)
        continue
      }

      // Limitaciones (especial)
      if (k === 'limitaciones') {
        patchData[k] = limitacionesStringOrNull(v)
        continue
      }

      // Textos
      if (k === 'apellido') {
        patchData[k] = textOrNull(v) // apellido puede ser null
        continue
      }

      if (TEXT_FIELDS.includes(k) || ['nombre', 'nivel', 'sexo', 'metodologia_preferida', 'enfoque', 'horario_preferido', 'objetivo_principal', 'nivel_actividad', 'experiencia', 'notas_progreso'].includes(k)) {
        patchData[k] = textOrNull(v)
        continue
      }

      // Fechas
      if (['fecha_inicio_objetivo', 'fecha_meta_objetivo'].includes(k)) {
        patchData[k] = v && v.trim() ? v.trim() : null
        continue
      }

      // IMC directo si lo mandan
      if (k === 'imc') {
        patchData[k] = numOrNull(v)
        continue
      }
    }

    // Si vienen peso y/o altura, y no mandan IMC, lo recalculamos
    if ((patchData.peso != null || patchData.altura != null)) {
      // Necesitamos los valores actuales para calcular si falta uno
      const current = await query('SELECT peso, altura FROM public.users WHERE id = $1', [userId])
      if (current.rows.length > 0) {
        const peso = patchData.peso != null ? patchData.peso : numOrNull(current.rows[0].peso)
        const altura = patchData.altura != null ? patchData.altura : numOrNull(current.rows[0].altura)
        if (peso != null && altura != null && altura > 0) {
          const alturaM = altura / 100
          patchData.imc = Number((peso / (alturaM * alturaM)).toFixed(1))
        } else {
          patchData.imc = null
        }
      }
    }

    const entries = Object.entries(patchData)
    if (entries.length === 0) {
      return res.status(400).json({ success: false, error: 'Sin campos válidos para actualizar' })
    }

    // Construcción dinámica del UPDATE
    const setClauses = []
    const values = []
    let idx = 1
    for (const [k, v] of entries) {
      setClauses.push(`${k} = $${idx++}`)
      values.push(v)
    }
    values.push(userId)

    const sql = `UPDATE public.users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`
    const result = await query(sql, values)

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado' })
    }

    const user = result.rows[0]
    delete user.password
    user.limitaciones = normalizeLimitacionesOut(user.limitaciones)

    return res.json({ success: true, user })
  } catch (error) {
    console.error('Error actualizando usuario:', error)
    return res.status(500).json({ success: false, error: error.message || 'Error interno del servidor' })
  }
})

export default router
