// debug-home-training.js
// Script para diagnosticar problemas con el entrenamiento en casa

import { getOpenAI } from './backend/lib/openaiClient.js';
import { query } from './backend/db.js';

console.log('🔍 Iniciando diagnóstico del sistema de entrenamiento en casa...\n');

// 1. Verificar conexión a OpenAI
console.log('1. Verificando conexión a OpenAI...');
const openai = getOpenAI();
if (openai) {
  console.log('✅ Cliente OpenAI inicializado correctamente');
  try {
    // Hacer una llamada de prueba simple
    const testResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Responde solo con "OK"' }],
      max_tokens: 10
    });
    console.log('✅ Conexión a OpenAI funcional:', testResponse.choices[0]?.message?.content);
  } catch (error) {
    console.log('❌ Error en conexión a OpenAI:', error.message);
  }
} else {
  console.log('❌ Cliente OpenAI no disponible (revisar OPENAI_API_KEY)');
}

// 2. Verificar conexión a base de datos
console.log('\n2. Verificando conexión a base de datos...');
try {
  const dbTest = await query('SELECT NOW() as current_time');
  console.log('✅ Conexión a BD funcional:', dbTest.rows[0]?.current_time);
} catch (error) {
  console.log('❌ Error en conexión a BD:', error.message);
}

// 3. Verificar tabla de usuarios
console.log('\n3. Verificando tabla de usuarios...');
try {
  const userCount = await query('SELECT COUNT(*) as count FROM users');
  console.log('✅ Tabla users accesible, usuarios registrados:', userCount.rows[0]?.count);
  
  // Mostrar algunos usuarios de ejemplo
  const sampleUsers = await query('SELECT id, nombre, email FROM users LIMIT 3');
  console.log('📋 Usuarios de ejemplo:');
  sampleUsers.rows.forEach(user => {
    console.log(`   - ID: ${user.id}, Nombre: ${user.nombre}, Email: ${user.email}`);
  });
} catch (error) {
  console.log('❌ Error accediendo tabla users:', error.message);
}

// 4. Verificar datos de perfil en tabla users
console.log('\n4. Verificando datos de perfil en tabla users...');
try {
  const profileData = await query('SELECT COUNT(*) as count, COUNT(edad) as with_age, COUNT(peso) as with_weight FROM users');
  const row = profileData.rows[0];
  console.log('✅ Datos de perfil en users:', `${row.count} usuarios, ${row.with_age} con edad, ${row.with_weight} con peso`);
} catch (error) {
  console.log('❌ Error accediendo datos de perfil:', error.message);
}

// 5. Verificar tabla de lesiones
console.log('\n5. Verificando tabla de lesiones...');
try {
  const injuryCount = await query('SELECT COUNT(*) as count FROM injuries');
  console.log('✅ Tabla injuries accesible, lesiones registradas:', injuryCount.rows[0]?.count);
} catch (error) {
  console.log('❌ Error accediendo tabla injuries:', error.message);
}

// 6. Probar endpoint completo con usuario de prueba
console.log('\n6. Probando endpoint completo...');
try {
  // Obtener primer usuario disponible
  const firstUser = await query('SELECT id FROM users LIMIT 1');
  if (firstUser.rows.length > 0) {
    const userId = firstUser.rows[0].id;
    console.log(`📋 Usando usuario ID: ${userId} para prueba`);
    
    // Simular llamada al endpoint
    const { default: express } = await import('express');
    const { default: iaRoutes } = await import('./backend/routes/ia.js');
    
    // Crear request simulado
    const mockReq = {
      body: {
        userId,
        equipamiento: 'minimo',
        tipoEntrenamiento: 'hiit'
      }
    };
    
    const mockRes = {
      json: (data) => {
        console.log('✅ Respuesta del endpoint:');
        console.log('   - Success:', data.success);
        console.log('   - Meta source:', data.meta?.source);
        console.log('   - Plan título:', data.data?.titulo);
        console.log('   - Ejercicios:', data.data?.ejercicios?.length || 0);
        if (data.meta?.profile_used) {
          console.log('   - Perfil usado:');
          console.log('     * Edad:', data.meta.profile_used.edad);
          console.log('     * Peso:', data.meta.profile_used.peso_kg);
          console.log('     * Altura:', data.meta.profile_used.altura_cm);
          console.log('     * Nivel:', data.meta.profile_used.nivel);
        }
      },
      status: (code) => ({
        json: (data) => {
          console.log('❌ Error del endpoint:', code, data);
        }
      })
    };
    
    // Esto requeriría importar y ejecutar la función del endpoint directamente
    console.log('⚠️ Para prueba completa del endpoint, ejecutar servidor y hacer POST a /api/ia/home-training/generate-today');
    
  } else {
    console.log('❌ No hay usuarios en la base de datos para probar');
  }
} catch (error) {
  console.log('❌ Error en prueba del endpoint:', error.message);
}

console.log('\n🏁 Diagnóstico completado');
process.exit(0);
