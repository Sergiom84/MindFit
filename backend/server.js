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

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5050; // Usa 5050 para pruebas

console.log('⛔ INICIANDO SERVER.JS EN EL PUERTO:', PORT);

// Configurar multer para manejo de archivos
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB límite
  },
  fileFilter: (req, file, cb) => {
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
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://mindfit.onrender.com'
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Log para cada petición entrante (debug)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

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

// ...[resto de tu código de endpoints de imagen y texto, igual que antes]...

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
  const dbConnected = await testConnection();
  if (!dbConnected) {
    console.error('❌ No se pudo conectar a la base de datos');
    process.exit(1);
  }

  // OJO: Aquí especifica '0.0.0.0' para aceptar todas las IPs
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor MindFit Backend ejecutándose en puerto ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🤖 OpenAI API configurada correctamente`);
    console.log(`🗄️ Base de datos PostgreSQL conectada`);
  });
};

startServer();
