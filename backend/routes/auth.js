import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const router = express.Router();

// Normalizar salida de limitaciones (al leer de la DB)
const normalizeLimitacionesOut = (value) => {
  try {
    if (value == null) return [];
    if (Array.isArray(value)) return value;
    if (typeof value === 'object') return value;
    const s = String(value).trim();
    if (!s) return [];
    try {
      const parsed = JSON.parse(s);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && typeof parsed === 'object') return [parsed];
    } catch (_) {}
    return [{ titulo: s }];
  } catch {
    return [];
  }
};

// Normalizar entrada para columnas JSONB genéricas
const prepareJSONBIn = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return null; }
  }
  return value;
};

// Normalizar entrada para columna JSONB "limitaciones"
const prepareLimitacionesIn = (value) => {
  if (value === '' || value === undefined || value === null) return null;
  if (typeof value === 'string') {
    try { return JSON.stringify(JSON.parse(value)); }
    catch { return JSON.stringify([value]); }
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

// Auxiliar para campos numéricos
const parseOrNull = v => (v === "" || v === undefined ? null : isNaN(Number(v)) ? null : Number(v));

/**
 * REGISTRO DE USUARIO
 */
router.post('/register', async (req, res) => {
  try {
    const data = req.body;
    if (!data.nombre || !data.apellido || !data.email || !data.password) {
      return res.status(400).json({
        success: false,
        error: 'Nombre, apellido, email y password son requeridos'
      });
    }

    // Verificar si el email ya existe
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [data.email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El email ya está registrado'
      });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Generar iniciales
    const iniciales = (data.nombre.charAt(0) + data.apellido.charAt(0)).toUpperCase();

    // Calcular IMC si hay peso y altura
    let imc = null;
    if (data.peso && data.altura) {
      const alturaEnMetros = data.altura / 100;
      imc = (data.peso / (alturaEnMetros * alturaEnMetros)).toFixed(1);
    }

    // Insertar usuario
    const insertText = `
      INSERT INTO users(
        nombre, apellido, email, password, iniciales, nivel, edad, sexo, peso, altura, imc,
        nivel_actividad, experiencia, años_entrenando, metodologia_preferida, frecuencia_semanal,
        grasa_corporal, masa_muscular, agua_corporal, metabolismo_basal,
        cintura, pecho, brazos, muslos, cuello, antebrazos,
        historial_medico, limitaciones, alergias, medicamentos,
        objetivo_principal, meta_peso, meta_grasa, enfoque, horario_preferido,
        comidas_diarias, suplementacion, alimentos_excluidos
      ) VALUES(
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,
        $12, $13, $14, $15, $16,
        $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26,
        $27, $28, $29, $30,
        $31, $32, $33, $34, $35,
        $36, $37, $38
      ) RETURNING id, nombre, apellido, email, iniciales, nivel, edad, sexo, peso, altura, imc
    `;

    const values = [
      data.nombre, data.apellido, data.email, hashedPassword, iniciales,
      data.nivel || 'principiante',
      parseOrNull(data.edad),
      data.sexo,
      parseOrNull(data.peso),
      parseOrNull(data.altura),
      imc,
      data.nivel_actividad,
      data.experiencia,
      parseOrNull(data.años_entrenando),
      data.metodologia_preferida,
      parseOrNull(data.frecuencia_semanal),
      parseOrNull(data.grasa_corporal),
      parseOrNull(data.masa_muscular),
      parseOrNull(data.agua_corporal),
      parseOrNull(data.metabolismo_basal),
      parseOrNull(data.cintura),
      parseOrNull(data.pecho),
      parseOrNull(data.brazos),
      parseOrNull(data.muslos),
      parseOrNull(data.cuello),
      parseOrNull(data.antebrazos),
      prepareJSONBIn(data.historial_medico),
      prepareLimitacionesIn(data.limitaciones),
      prepareJSONBIn(data.alergias),
      prepareJSONBIn(data.medicamentos),
      data.objetivo_principal,
      parseOrNull(data.meta_peso),
      parseOrNull(data.meta_grasa),
      data.enfoque,
      data.horario_preferido,
      parseOrNull(data.comidas_diarias),
      prepareJSONBIn(data.suplementacion),
      prepareJSONBIn(data.alimentos_excluidos)
    ];

    const result = await query(insertText, values);
    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

/**
 * LOGIN DE USUARIO
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('🟡 Intentando login:', email);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }

    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    console.log('🟢 Resultado SQL:', result.rows);

    if (result.rows.length === 0) {
      console.log('🔴 Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('🔴 Contraseña incorrecta para:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    delete user.password;
    user.limitaciones = normalizeLimitacionesOut(user.limitaciones);

    res.json({
      success: true,
      message: 'Login exitoso',
      user
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

/**
 * ACTUALIZAR PERFIL (PATCH)
 */
router.patch('/users/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const data = req.body || {};

    const allowed = [
      'nombre','apellido','edad','sexo','peso','altura','imc','nivel_actividad',
      'nivel','años_entrenando','metodologia_preferida','frecuencia_semanal',
      'grasa_corporal','masa_muscular','agua_corporal','metabolismo_basal',
      'cintura','pecho','brazos','muslos','cuello','antebrazos',
      'historial_medico','limitaciones','alergias','medicamentos',
      'objetivo_principal','meta_peso','meta_grasa','enfoque','horario_preferido',
      'comidas_diarias','suplementacion','alimentos_excluidos'
    ];

    const entries = Object.entries(data).filter(([k]) => allowed.includes(k));
    if (entries.length === 0) {
      return res.status(400).json({ success:false, error:'Sin campos válidos para actualizar' });
    }

    // Si vienen peso/altura recalcular IMC
    let patchData = Object.fromEntries(entries);
    if ((patchData.peso || patchData.altura) && (patchData.peso != null && patchData.altura != null)) {
      const alturaM = Number(patchData.altura) / 100;
      if (alturaM > 0) patchData.imc = (Number(patchData.peso) / (alturaM * alturaM)).toFixed(1);
    }

    // Construir SET dinámico con normalización
    const setClauses = [];
    const values = [];
    let idx = 1;
    for (const [key, valueRaw] of Object.entries(patchData)) {
      let value = valueRaw;

      // Normalizar numéricos
      if (['edad','peso','altura','años_entrenando','frecuencia_semanal',
           'grasa_corporal','masa_muscular','agua_corporal','metabolismo_basal',
           'cintura','pecho','brazos','muslos','cuello','antebrazos',
           'meta_peso','meta_grasa','comidas_diarias'].includes(key)) {
        value = parseOrNull(valueRaw);
      }

      // Normalizar JSONB
      if (['historial_medico','alergias','medicamentos','suplementacion','alimentos_excluidos'].includes(key)) {
        value = prepareJSONBIn(valueRaw);
      }

      // Normalizar limitaciones
      if (key === 'limitaciones') {
        value = prepareLimitacionesIn(valueRaw);
      }

      setClauses.push(`${key} = $${idx++}`);
      values.push(value);
    }
    values.push(userId);

    const sql = `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`;
    const result = await query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ success:false, error:'Usuario no encontrado' });
    }

    const user = result.rows[0];
    delete user.password;
    user.limitaciones = normalizeLimitacionesOut(user.limitaciones);

    res.json({ success:true, user });
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ success:false, error: error.message || 'Error interno del servidor' });
  }
});

export default router;
