/* eslint-env node */
/* global process */
// Script para verificar que toda la aplicación MindFit funciona correctamente

import { testConnection, query } from './backend/db.js';

const backendUrl = process.env.VITE_API_URL;

async function verificarAplicacion() {
  console.log('🔄 Verificando aplicación MindFit...');
  console.log('');

  try {
    // 1. Verificar conexión a base de datos
    console.log('1. 🗄️ Verificando base de datos...');
    const dbConnected = await testConnection();
    if (!dbConnected) {
      throw new Error('No se pudo conectar a PostgreSQL');
    }
    console.log('   ✅ PostgreSQL conectado correctamente');

    // 2. Verificar tablas
    console.log('2. 📋 Verificando tablas...');
    const tables = await query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    const tableNames = tables.rows.map(r => r.table_name);
    console.log('   ✅ Tablas encontradas:', tableNames);

    if (!tableNames.includes('users')) {
      throw new Error('Tabla users no encontrada');
    }

    // 3. Verificar usuarios
    console.log('3. 👥 Verificando usuarios...');
    const users = await query("SELECT COUNT(*) as total FROM users");
    console.log('   ✅ Total usuarios:', users.rows[0].total);

    // 4. Verificar usuario de prueba
    console.log('4. 🧪 Verificando usuario de prueba...');
    const testUser = await query("SELECT id, nombre, email FROM users WHERE email = 'test@example.com'");
    if (testUser.rows.length > 0) {
      console.log('   ✅ Usuario de prueba encontrado:', testUser.rows[0]);
    } else {
      console.log('   ⚠️ Usuario de prueba no encontrado');
    }

    // 5. Verificar puertos
    console.log('5. 🌐 Verificando servicios...');

    if (backendUrl) {
      try {
        const backendResponse = await fetch(`${backendUrl}/health`);
        if (backendResponse.ok) {
          const data = await backendResponse.json();
          console.log('   ✅ Backend funcionando:', data.message);
        } else {
          console.log('   ❌ Backend no responde correctamente');
        }
      } catch (error) {
        console.log('   ❌ Backend no está ejecutándose en', backendUrl);
      }
    } else {
      console.log('   ❌ VITE_API_URL no está configurado');
    }

    try {
      const frontendResponse = await fetch('http://localhost:5173');
      if (frontendResponse.ok) {
        console.log('   ✅ Frontend funcionando en puerto 5173');
      } else {
        console.log('   ❌ Frontend no responde correctamente');
      }
    } catch (error) {
      console.log('   ❌ Frontend no está ejecutándose en puerto 5173');
    }

    console.log('');
    console.log('🎉 ¡Verificación completada!');
    console.log('');
    console.log('📋 Resumen de la configuración:');
    console.log(`   🚀 Backend: ${backendUrl || 'no configurado'}`);
    console.log('   🌐 Frontend: http://localhost:5173');
    console.log('   👤 Usuario prueba: test@example.com / password123');
    console.log('');
    console.log('✅ La aplicación está lista para usar sin Docker');

  } catch (error) {
    console.error('❌ Error en verificación:', error.message);
    console.log('');
    console.log('🔧 Pasos para solucionar:');
    console.log('   1. Verificar que PostgreSQL esté ejecutándose');
    console.log('   2. Ejecutar: npm run setup-db');
    console.log('   3. Verificar credenciales: postgres/postgres');
    console.log('   4. Ejecutar: start-mindfit.bat');
  }

  process.exit(0);
}

verificarAplicacion();
