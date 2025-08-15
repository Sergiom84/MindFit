// Test completo del sistema de lesiones integrado con IA
const API_BASE = 'http://localhost:5000/api';

async function createTestInjury() {
  console.log('🏥 Creando lesión de prueba...');
  
  try {
    const response = await fetch(`${API_BASE}/users/1/injuries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Dolor lumbar',
        zona: 'Espalda baja',
        tipo: 'Muscular',
        gravedad: 'leve',
        fecha_inicio: new Date().toISOString(),
        causa: 'Mala postura',
        tratamiento: 'Fisioterapia',
        estado: 'activo',
        notas: 'Evitar ejercicios de impacto'
      })
    });

    const data = await response.json();
    console.log('✅ Lesión creada:', data.success ? 'Éxito' : 'Error');
    return data.success;
  } catch (error) {
    console.error('❌ Error creando lesión:', error.message);
    return false;
  }
}

async function testIAWithInjuries() {
  console.log('\n🧪 Testing IA con lesiones...');
  
  try {
    const response = await fetch(`${API_BASE}/ia/home-training/generate-today`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        equipamiento: 'basico',
        tipoEntrenamiento: 'funcional'
      })
    });

    const data = await response.json();
    console.log('✅ Response status:', response.status);
    
    if (data.success) {
      console.log('🎉 ¡Entrenamiento generado con lesiones consideradas!');
      console.log('📋 Título:', data.data.titulo);
      console.log('🏥 Lesiones consideradas:', data.meta.profile_used.lesiones);
      console.log('🏋️ Ejercicios adaptados:');
      data.data.ejercicios.forEach((ej, i) => {
        console.log(`  ${i+1}. ${ej.nombre} - ${ej.notas}`);
      });
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing IA with injuries:', error.message);
  }
}

async function testMethodologyWithInjuries() {
  console.log('\n🧪 Testing metodología con lesiones...');
  
  try {
    const response = await fetch(`${API_BASE}/ia/recommend-and-generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 1,
        profile: {
          objetivo_principal: 'rehabilitación',
          frecuencia_semanal: 3
        },
        forcedMethodology: null
      })
    });

    const data = await response.json();
    console.log('✅ Response status:', response.status);
    
    if (data.success) {
      console.log('🎉 ¡Metodología recomendada con lesiones consideradas!');
      console.log('📋 Metodología:', data.data.methodology);
      console.log('💡 Razón:', data.data.reason);
      console.log('🏥 Lesiones consideradas:', data.data.profile_used.lesiones);
    } else {
      console.log('❌ Error:', data.error);
    }
  } catch (error) {
    console.error('❌ Error testing methodology with injuries:', error.message);
  }
}

async function cleanupTestInjury() {
  console.log('\n🧹 Limpiando lesión de prueba...');
  
  try {
    // Obtener lesiones del usuario
    const response = await fetch(`${API_BASE}/users/1/injuries`);
    const data = await response.json();
    
    if (data.success && data.injuries.length > 0) {
      // Eliminar la última lesión creada
      const lastInjury = data.injuries[0];
      const deleteResponse = await fetch(`${API_BASE}/injuries/${lastInjury.id}`, {
        method: 'DELETE'
      });
      
      const deleteData = await deleteResponse.json();
      console.log('✅ Lesión eliminada:', deleteData.success ? 'Éxito' : 'Error');
    }
  } catch (error) {
    console.error('❌ Error limpiando lesión:', error.message);
  }
}

// Ejecutar tests completos
async function runCompleteTest() {
  console.log('🚀 Iniciando test completo del sistema de lesiones + IA\n');
  
  // 1. Crear lesión de prueba
  const injuryCreated = await createTestInjury();
  
  if (injuryCreated) {
    // 2. Probar IA de entrenamiento en casa con lesiones
    await testIAWithInjuries();
    
    // 3. Probar recomendación de metodología con lesiones
    await testMethodologyWithInjuries();
    
    // 4. Limpiar datos de prueba
    await cleanupTestInjury();
  }
  
  console.log('\n✅ Test completo finalizado');
}

runCompleteTest();
