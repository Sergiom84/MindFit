// Test script for the new IA endpoints
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000/api/ia';

async function testGenerateToday() {
  console.log('🧪 Testing /home-training/generate-today...');
  
  try {
    const response = await fetch(`${API_BASE}/home-training/generate-today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        equipamiento: 'minimo',
        tipoEntrenamiento: 'hiit'
      })
    });

    const data = await response.json();
    console.log('✅ Generate Today Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error testing generate-today:', error.message);
  }
}

async function testLogSession() {
  console.log('🧪 Testing /home-training/log-session...');
  
  try {
    const response = await fetch(`${API_BASE}/home-training/log-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        fecha: '2025-08-14',
        equipamiento: 'minimo',
        tipoEntrenamiento: 'hiit',
        duracion_estimada_min: 30,
        duracion_real_seg: 1720,
        total_ejercicios: 6,
        completados: 6,
        status: 'completed',
        detalle: [
          { nombre: 'Jumping Jacks', tipo: 'time', series: 3, seriesCompletadas: 3, duracion_seg: 30 },
          { nombre: 'Sentadillas', tipo: 'reps', series: 3, seriesCompletadas: 3, repeticiones: '12-15' }
        ]
      })
    });

    const data = await response.json();
    console.log('✅ Log Session Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error testing log-session:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting endpoint tests...\n');
  
  await testGenerateToday();
  console.log('\n');
  await testLogSession();
  
  console.log('\n✨ Tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { testGenerateToday, testLogSession };
