import dotenv from 'dotenv';
import { testConnection } from './db.js';

dotenv.config();

console.log('🔧 DIAGNÓSTICO COMPLETO DE CONFIGURACIÓN');
console.log('=' .repeat(50));

// 1. Verificar variables de entorno
console.log('\n1️⃣ Variables de entorno:');
console.log('- DB_ENVIRONMENT:', process.env.DB_ENVIRONMENT);
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- PORT:', process.env.PORT);

console.log('\n📍 Configuración LOCAL:');
console.log('- PGHOST:', process.env.PGHOST);
console.log('- PGUSER:', process.env.PGUSER);
console.log('- PGDATABASE:', process.env.PGDATABASE);
console.log('- PGPORT:', process.env.PGPORT);
console.log('- PGPASSWORD:', process.env.PGPASSWORD ? '***' : 'NO CONFIGURADA');

console.log('\n🌍 Configuración RENDER:');
console.log('- RENDER_PGHOST:', process.env.RENDER_PGHOST);
console.log('- RENDER_PGUSER:', process.env.RENDER_PGUSER);
console.log('- RENDER_PGDATABASE:', process.env.RENDER_PGDATABASE);
console.log('- RENDER_PGPORT:', process.env.RENDER_PGPORT);
console.log('- RENDER_PGPASSWORD:', process.env.RENDER_PGPASSWORD ? '***' : 'NO CONFIGURADA');

// 2. Probar conexión actual
console.log('\n2️⃣ Probando conexión con configuración actual...');
try {
    const connectionResult = await testConnection();
    if (connectionResult) {
        console.log('✅ Conexión exitosa con configuración actual');
    } else {
        console.log('❌ Fallo en conexión con configuración actual');
    }
} catch (error) {
    console.log('❌ Error en prueba de conexión:', error.message);
}

// 3. Sugerir acciones
console.log('\n3️⃣ DIAGNÓSTICO:');
if (process.env.DB_ENVIRONMENT === 'local') {
    console.log('⚠️  Actualmente configurado para BASE DE DATOS LOCAL');
    console.log('📝 Para usar Render, cambia DB_ENVIRONMENT=render en .env');
} else if (process.env.DB_ENVIRONMENT === 'render') {
    console.log('🌍 Configurado para BASE DE DATOS RENDER');
    console.log('✅ Debería estar conectándose a Render');
} else {
    console.log('❌ DB_ENVIRONMENT no está configurado correctamente');
}

console.log('\n4️⃣ CORS ORIGINS configurados:');
console.log('-', process.env.CORS_ORIGINS);

console.log('\n5️⃣ OpenAI API:');
console.log('- Configurada:', process.env.OPENAI_API_KEY ? 'SÍ' : 'NO');

process.exit(0);
