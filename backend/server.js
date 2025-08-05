import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import iaAdaptativa from './routes/iaAdaptativa.js';
import authRoutes from './routes/auth.js';
import { testConnection } from './db.js';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar multer para manejo de archivos
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Middlewares
app.use(helmet());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://mindfit.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rutas
app.use('/api', iaAdaptativa);
app.use('/api', authRoutes);

// Crear directorio de uploads si no existe
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Endpoint de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend MindFit funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

// OPCIÓN 1: Evaluación mediante imagen (GPT-4 Vision)
app.post('/api/evaluar-espacio-imagen', upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No se encontró imagen en la solicitud'
      });
    }

    console.log(`Procesando imagen: ${req.file.filename}, tamaño: ${req.file.size} bytes`);

    // Leer la imagen y convertirla a base64
    const imagePath = req.file.path;
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = req.file.mimetype;

    // Prompt para GPT-4 Vision
    const messages = [
      {
        role: "system",
        content: `Eres un entrenador personal experto especializado en entrenamientos en casa. 
        Vas a evaluar una imagen del espacio de entrenamiento del usuario y proporcionar un análisis detallado.
        
        Tu análisis debe incluir:
        1. Evaluación del espacio disponible (dimensiones aproximadas)
        2. Identificación de obstáculos o limitaciones
        3. Equipamiento visible o muebles que se puedan usar
        4. Recomendaciones de ejercicios seguros para ese espacio
        5. Ejercicios que se deben evitar por seguridad
        6. Sugerencias para optimizar el espacio
        
        Responde en español de forma clara y estructurada.`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Analiza mi espacio de entrenamiento en casa. ¿Qué ejercicios puedo hacer de forma segura aquí? ¿Qué recomendaciones tienes para optimizar este espacio?"
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`
            }
          }
        ]
      }
    ];

    // Llamada a GPT-4 Vision
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    const resultado = response.choices[0].message.content;

    // Limpiar archivo temporal
    fs.unlinkSync(imagePath);

    console.log('Análisis de imagen completado exitosamente');

    res.json({
      success: true,
      tipo_evaluacion: 'imagen',
      analisis_espacio: resultado
    });

  } catch (error) {
    console.error('Error en evaluación por imagen:', error);
    
    // Limpiar archivo temporal en caso de error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      error: `Error al procesar la imagen: ${error.message}`
    });
  }
});

// OPCIÓN 2: Evaluación mediante preguntas (sin imagen)
app.post('/api/evaluar-espacio-texto', async (req, res) => {
  try {
    const { respuestas } = req.body;

    if (!respuestas) {
      return res.status(400).json({
        success: false,
        error: 'No se encontraron respuestas en la solicitud'
      });
    }

    // Construir el texto con las respuestas del usuario
    const textoUsuario = `
    Información sobre mi espacio de entrenamiento:
    
    Espacio disponible: ${respuestas.espacio || 'No especificado'}
    Dimensiones aproximadas: ${respuestas.dimensiones || 'No especificado'}
    Equipamiento disponible: ${respuestas.equipamiento || 'No especificado'}
    Tipo de suelo: ${respuestas.suelo || 'No especificado'}
    Obstáculos o limitaciones: ${respuestas.obstaculos || 'No especificado'}
    Nivel de ruido permitido: ${respuestas.ruido || 'No especificado'}
    Horarios disponibles: ${respuestas.horarios || 'No especificado'}
    Objetivos de entrenamiento: ${respuestas.objetivos || 'No especificado'}
    `;

    console.log(`Procesando evaluación por texto: ${textoUsuario.length} caracteres`);

    // Prompt para GPT-4
    const messages = [
      {
        role: "system",
        content: `Eres un entrenador personal experto especializado en entrenamientos en casa.
        El usuario te describe su espacio para entrenar. 
        
        Debes proporcionar:
        1. Análisis del espacio descrito
        2. Recomendaciones específicas de ejercicios
        3. Rutina adaptada a sus limitaciones
        4. Consejos de seguridad
        5. Sugerencias para optimizar el espacio
        6. Plan de progresión
        
        Responde en español de forma estructurada y práctica.`
      },
      {
        role: "user",
        content: textoUsuario
      }
    ];

    // Llamada a GPT-4
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      max_tokens: 1000,
      temperature: 0.7
    });

    const resultado = response.choices[0].message.content;

    console.log('Análisis por texto completado exitosamente');

    res.json({
      success: true,
      tipo_evaluacion: 'texto',
      sugerencias_entrenamiento: resultado
    });

  } catch (error) {
    console.error('Error en evaluación por texto:', error);
    res.status(500).json({
      success: false,
      error: `Error al procesar las respuestas: ${error.message}`
    });
  }
});

// Manejo de errores de multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'El archivo es demasiado grande. Máximo 10MB.'
      });
    }
  }
  
  if (error.message === 'Solo se permiten archivos de imagen') {
    return res.status(400).json({
      success: false,
      error: 'Solo se permiten archivos de imagen'
    });
  }

  console.error('Error no manejado:', error);
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

// Manejo de rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint no encontrado'
  });
});

// Verificar que la API key esté configurada
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ OPENAI_API_KEY no está configurada en las variables de entorno');
  process.exit(1);
}

// Inicializar conexión a base de datos y servidor
const startServer = async () => {
  // Probar conexión a base de datos
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  // Iniciar servidor
  app.listen(PORT, () => {
    console.log(`🚀 Servidor MindFit Backend ejecutándose en puerto ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 OpenAI API configurada correctamente`);
    console.log(`🗄️ Base de datos PostgreSQL conectada`);
  });
};

startServer();
