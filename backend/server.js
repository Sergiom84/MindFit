// backend/server.js (Unificado y Corregido)

// --- CONFIGURACIÓN DE ENTORNO ---
// Se carga la configuración de las variables de entorno al principio de todo.
// Esto asegura que estén disponibles para cualquier otro módulo que las necesite.
import dotenv from 'dotenv'

// --- IMPORTACIONES DE MÓDULOS ---
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import multer from 'multer'
import OpenAI from 'openai'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { testConnection } from './db.js'

// --- IMPORTACIONES DE RUTAS ---
import iaAdaptativa from './routes/iaAdaptativa.js'
import iaRoutes from './routes/ia.js'
import authRoutes from './routes/auth.js'
import injuriesRoutes from './routes/injuries.js'
import poseRoutes from './routes/pose.js'
import homeTrainingRoutes from './routes/homeTraining.js'
import methodologiesRoutes from './routes/methodologies.js'
import medicalDocsRoutes from './routes/medicalDocs.js'
import pdfAnalysisRoutes from './routes/pdfAnalysis.js'
import musicRoutes from './routes/music.js'
dotenv.config()

// --- CONFIGURACIÓN DE PATHS ---
// Se obtiene __dirname en ES modules para referenciar rutas de archivos de forma segura.
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// --- INICIALIZACIÓN DE EXPRESS ---
const app = express()
const PORT = process.env.PORT || 5000

console.log('⛔ INICIANDO SERVER.JS EN EL PUERTO:', PORT)

// --- CONFIGURACIÓN DE MULTER (MANEJO DE ARCHIVOS) ---
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // Límite de 10MB por archivo
  },
  fileFilter: (req, file, cb) => {
    // Se aceptan tanto imágenes como archivos PDF.
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true)
    } else {
      cb(new Error('Solo se permiten archivos de imagen o PDF'), false)
    }
  }
})

// --- INICIALIZACIÓN DEL CLIENTE DE OPENAI ---
let openai = null
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
  console.log('🤖 Cliente de OpenAI inicializado.')
} else {
  console.warn('⚠️ OPENAI_API_KEY no está configurada. Las funcionalidades de IA no estarán disponibles.')
}

// --- MIDDLEWARES GENERALES ---
app.use(helmet()) // Ayuda a securizar la app estableciendo varias cabeceras HTTP.
app.use(morgan('combined')) // Logger de peticiones HTTP.
app.use('/api/music', musicRoutes)

// Configuración de CORS para permitir peticiones desde el frontend.
const defaultCorsOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://mindfit.onrender.com'
]
const corsOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim()).filter(Boolean)
  : defaultCorsOrigins
app.use(cors({
  origin: corsOrigins,
  credentials: true
}))

// Middlewares para parsear el cuerpo de las peticiones.
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Middleware para servir archivos subidos estáticamente.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Middleware para loggear cada petición entrante (útil para debug).
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
  next()
})

// --- REGISTRO DE RUTAS DE LA API ---
console.log('📋 Registrando rutas de la API...')
app.use('/api', iaAdaptativa)
app.use('/api/ia', iaRoutes)
app.use('/api', authRoutes)
app.use('/api', injuriesRoutes)
app.use('/api', poseRoutes)
app.use('/api/home-training', homeTrainingRoutes)
app.use('/api/methodologies', methodologiesRoutes)
app.use('/api', pdfAnalysisRoutes)
app.use('/api', medicalDocsRoutes)
console.log('✅ Todas las rutas de la API han sido registradas.')

// --- SERVIR ARCHIVOS ESTÁTICOS DEL FRONTEND ---
const distPath = path.join(__dirname, '..', 'dist')
if (fs.existsSync(distPath)) {
  console.log('📁 Sirviendo archivos estáticos del frontend desde:', distPath)
  app.use(express.static(distPath))

  // Manejador de rutas para Single Page Application (SPA).
  // Si la ruta no es de la API, sirve el index.html principal.
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
      res.sendFile(path.join(distPath, 'index.html'))
    } else {
      // Si es una ruta de API no encontrada, devuelve 404.
      res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado'
      })
    }
  })
} else {
  console.log('⚠️ Directorio /dist del frontend no encontrado. El servidor solo funcionará como API.')
}

// --- ENDPOINTS DE UTILIDAD Y DEPURACIÓN ---

// Endpoint de salud para verificar que el servidor está activo.
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend MindFit funcionando correctamente',
    timestamp: new Date().toISOString()
  })
})

// Endpoint para listar todas las rutas registradas en la aplicación.
app.get('/debug/routes', (req, res) => {
  const routes = []
  app._router.stack.forEach((middleware) => {
    if (middleware.route) { // Rutas directas en app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      })
    } else if (middleware.name === 'router') { // Rutas dentro de un router
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          routes.push({
            path: `${middleware.regexp.source.replace('\\/?(?=\\/|$)', '')}${handler.route.path}`,
            methods: Object.keys(handler.route.methods)
          })
        }
      })
    }
  })
  res.json({ routes })
})

// --- MANEJO DE ERRORES ---
// Middleware centralizado para capturar y manejar errores.
app.use((error, req, res, next) => {
  console.error('❌ Error capturado:', error.stack)

  // Errores específicos de Multer
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'El archivo es demasiado grande. Máximo 10MB.' })
    }
  }

  // Error de tipo de archivo no permitido
  if (error.message === 'Solo se permiten archivos de imagen o PDF') {
    return res.status(400).json({ success: false, error: 'Tipo de archivo no válido. Solo se aceptan imágenes o PDF.' })
  }

  // Error genérico del servidor
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor.'
  })
})

// --- INICIO DEL SERVIDOR ---
const startServer = async () => {
  try {
    // 1. Verificar la conexión con la base de datos
    await testConnection()
    console.log('🗄️ Conexión con la base de datos verificada correctamente.')

    // 2. Crear directorio de uploads si no existe
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads')
      console.log('📁 Directorio "uploads" creado.')
    }

    // 3. Iniciar el servidor para escuchar peticiones
    // Se usa '0.0.0.0' para que sea accesible desde fuera del contenedor en entornos de producción (como Render).
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor MindFit Backend ejecutándose en puerto ${PORT}`)
      console.log(`    Health check disponible en: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ Error fatal al iniciar el servidor:', error)
    process.exit(1) // Termina el proceso si no se puede iniciar correctamente.
  }
}

startServer()
