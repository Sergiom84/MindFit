import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import { testConnection } from './db.js';

dotenv.config();

const app = express();
const PORT = 3001; // Puerto diferente para prueba

// Configurar CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Probar conexión a la base de datos
console.log('🔄 Probando conexión a la base de datos...');
const dbConnected = await testConnection();

if (!dbConnected) {
    console.log('❌ No se pudo conectar a la base de datos');
    process.exit(1);
}

// Rutas
app.use('/api', authRoutes);

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ 
        success: true, 
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        database: process.env.DB_ENVIRONMENT
    });
});

// Manejo de errores
app.use((error, req, res, next) => {
    console.error('❌ Error no manejado:', error);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        details: error.message
    });
});

app.listen(PORT, () => {
    console.log(`✅ Servidor de prueba ejecutándose en puerto ${PORT}`);
    console.log(`🌍 Database: ${process.env.DB_ENVIRONMENT}`);
    console.log(`🔗 Prueba: http://localhost:${PORT}/api/test`);
});
