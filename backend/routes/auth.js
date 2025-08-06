import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';

const router = express.Router();

// Registro de usuario
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
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [data.email]
    );
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

    // Calcular IMC si se proporcionan peso y altura
    let imc = null;
    if (data.peso && data.altura) {
      const alturaEnMetros = data.altura / 100;
      imc = (data.peso / (alturaEnMetros * alturaEnMetros)).toFixed(1);
    }

    // Función auxiliar para números
    const parseOrNull = v => (v === "" || v === undefined ? null : isNaN(Number(v)) ? null : Number(v));

    // Insertar usuario en la base de datos
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
      parseOrNull(data.edad), // INT
      data.sexo,
      parseOrNull(data.peso), // DECIMAL
      parseOrNull(data.altura), // DECIMAL
      imc,
      data.nivel_actividad,
      data.experiencia,
      parseOrNull(data.años_entrenando), // INT
      data.metodologia_preferida,
      parseOrNull(data.frecuencia_semanal), // INT
      parseOrNull(data.grasa_corporal), // DECIMAL
      parseOrNull(data.masa_muscular), // DECIMAL
      parseOrNull(data.agua_corporal), // DECIMAL
      parseOrNull(data.metabolismo_basal), // INT
      parseOrNull(data.cintura), // DECIMAL
      parseOrNull(data.pecho), // DECIMAL
      parseOrNull(data.brazos), // DECIMAL
      parseOrNull(data.muslos), // DECIMAL
      parseOrNull(data.cuello), // DECIMAL
      parseOrNull(data.antebrazos), // DECIMAL
      data.historial_medico,
      data.limitaciones,
      data.alergias,
      data.medicamentos,
      data.objetivo_principal,
      parseOrNull(data.meta_peso), // DECIMAL
      parseOrNull(data.meta_grasa), // DECIMAL
      data.enfoque,
      data.horario_preferido,
      parseOrNull(data.comidas_diarias), // INT
      data.suplementacion,
      data.alimentos_excluidos
    ];

    const result = await query(insertText, values);

    // Retornar usuario creado (sin password)
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

// Login de usuario
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

    // Buscar usuario por email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    console.log('🟢 Resultado SQL:', result.rows);

    if (result.rows.length === 0) {
      console.log('🔴 Usuario no encontrado:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = result.rows[0];

    // Verificar password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      console.log('🔴 Contraseña incorrecta para:', email);
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Remover password del objeto usuario
    delete user.password;

    res.json({
      success: true,
      message: 'Login exitoso',
      user: user
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error interno del servidor'
    });
  }
});

export default router;
