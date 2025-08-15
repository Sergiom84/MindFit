// test-endpoint.js
// Script para probar el endpoint de entrenamiento en casa

import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testEndpoint() {
  console.log('🧪 Probando endpoint de entrenamiento en casa...\n');
  
  try {
    const response = await fetch(`${API_BASE}/ia/home-training/generate-today`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 1, // Usuario de prueba
        equipamiento: 'minimo',
        tipoEntrenamiento: 'hiit'
      })
    });

    console.log('📡 Status:', response.status);
    console.log('📡 Status Text:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response:', errorText);
      return;
    }

    const data = await response.json();
    console.log('✅ Respuesta exitosa:');
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
      console.log('     * IMC:', data.meta.profile_used.imc);
      console.log('     * Lesiones:', data.meta.profile_used.lesiones);
    }

    if (data.data?.ejercicios?.length > 0) {
      console.log('\n📋 Ejercicios generados:');
      data.data.ejercicios.forEach((ej, idx) => {
        console.log(`   ${idx + 1}. ${ej.nombre}`);
        console.log(`      - Tipo: ${ej.tipo}`);
        console.log(`      - Series: ${ej.series}`);
        if (ej.tipo === 'reps') {
          console.log(`      - Repeticiones: ${ej.repeticiones}`);
        } else {
          console.log(`      - Duración: ${ej.duracion_seg}s`);
        }
        console.log(`      - Descanso: ${ej.descanso_seg}s`);
        if (ej.notas) console.log(`      - Notas: ${ej.notas}`);
      });
    }

  } catch (error) {
    console.log('❌ Error en la prueba:', error.message);
  }
}

testEndpoint();
