// Test simple para el endpoint de IA usando fetch nativo de Node.js
const API_BASE = 'http://localhost:5000/api/ia';

async function testGenerateToday() {
  console.log('🧪 Testing /home-training/generate-today...');

  try {
    const response = await fetch(`${API_BASE}/home-training/generate-today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        equipamiento: 'basico',
        tipoEntrenamiento: 'hiit'
      })
    });

    const data = await response.json();
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('🎉 ¡Entrenamiento generado exitosamente!');
      console.log('📋 Título:', data.data.titulo);
      console.log('⏱️ Duración:', data.data.duracion_estimada_min, 'minutos');
      console.log('🏋️ Ejercicios:', data.data.ejercicios.length);
      console.log('🤖 Fuente:', data.meta.source);
      console.log('🏥 Lesiones consideradas:', data.meta.profile_used.lesiones);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing generate-today:', error.message);
  }
}

async function testRecommendAndGenerate() {
  console.log('\n🧪 Testing /recommend-and-generate...');

  try {
    const response = await fetch(`${API_BASE}/recommend-and-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        profile: {
          objetivo_principal: 'ganar masa muscular',
          frecuencia_semanal: 4
        },
        forcedMethodology: null
      })
    });

    const data = await response.json();
    console.log('✅ Response status:', response.status);
    console.log('✅ Response data:', JSON.stringify(data, null, 2));

    if (data.success) {
      console.log('🎉 ¡Recomendación generada exitosamente!');
      console.log('📋 Metodología:', data.data.methodology);
      console.log('💡 Razón:', data.data.reason);
      console.log('🏥 Lesiones consideradas:', data.data.profile_used.lesiones);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing recommend-and-generate:', error.message);
  }
}

// Ejecutar tests
async function runTests() {
  await testGenerateToday();
  await testRecommendAndGenerate();
}

runTests();
