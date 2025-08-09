import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import multer from 'multer';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import iaAdaptativa from './routes/iaAdaptativa.js';
import authRoutes from './routes/auth.js';
import injuriesRoutes from './routes/injuries.js';
import poseRoutes from './routes/pose.js';
import homeTrainingRoutes from './routes/homeTraining.js';
import methodologiesRoutes from './routes/methodologies.js';
import { testConnection } from './db.js';

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000; // Puerto estándar para MindFit

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

// Inicializar cliente OpenAI solo si hay API key
let openai = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Middlewares
app.use(helmet());
app.use(morgan('combined'));

const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://mindfit.onrender.com'
];

const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : defaultCorsOrigins;

app.use(cors({
origin: corsOrigins,
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
console.log('📋 Registrando rutas...');
app.use('/api', iaAdaptativa);
console.log('✅ iaAdaptativa registrado');
app.use('/api', authRoutes);
console.log('✅ authRoutes registrado');
app.use('/api', injuriesRoutes);
console.log('✅ injuriesRoutes registrado');
app.use('/api', poseRoutes);
console.log('✅ poseRoutes registrado');
app.use('/api/home-training', homeTrainingRoutes);
console.log('✅ homeTrainingRoutes registrado');
app.use('/api/methodologies', methodologiesRoutes);
console.log('✅ methodologiesRoutes registrado');

// Servir archivos estáticos del frontend (después de las rutas API)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  console.log('📁 Sirviendo archivos estáticos desde:', distPath);
  app.use(express.static(distPath));

  // Manejar rutas del frontend (SPA)
  app.get('*', (req, res) => {
    // Solo servir index.html para rutas que no sean de API
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health') && !req.path.startsWith('/debug')) {
      res.sendFile(path.join(distPath, 'index.html'));
    } else {
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado'
      });
    }
  });
} else {
  console.log('⚠️ Directorio dist no encontrado. Solo funcionará como API.');
}

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

// Endpoint para debug de rutas
app.get('/debug/routes', (req, res) => {
  const routes = [];
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });

  res.json({
    status: 'ok',
    message: 'Rutas registradas',
    routes: routes,
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

// El manejo de rutas no encontradas ahora se hace en el middleware del frontend

// Verificar que la API key esté configurada
if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'tu_api_key_de_openai_aqui') {
  console.warn('⚠️ OPENAI_API_KEY no está configurada. Algunas funcionalidades de IA no estarán disponibles.');
  console.warn('   Configura tu API key en backend/.env para habilitar todas las funciones.');
} else {
  console.log('🤖 OpenAI API configurada correctamente');
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
    if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
      console.log(`🤖 OpenAI API configurada correctamente`);
    }
    console.log(`🗄️ Base de datos PostgreSQL conectada`);
  });
};

startServer();
