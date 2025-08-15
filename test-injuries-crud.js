// Test completo del CRUD de lesiones
const API_BASE = 'http://localhost:5000/api';

let createdInjuryId = null;

async function testCreateInjury() {
  console.log('🏥 1. Creando lesión de prueba...');
  
  try {
    const response = await fetch(`${API_BASE}/users/1/injuries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        titulo: 'Dolor de rodilla',
        zona: 'Rodilla derecha',
        tipo: 'Articular',
        gravedad: 'moderada',
        fecha_inicio: new Date().toISOString(),
        causa: 'Sobrecarga en entrenamiento',
        tratamiento: 'Reposo y fisioterapia',
        estado: 'activo',
        notas: 'Evitar saltos y impactos'
      })
    });

    const data = await response.json();
    if (data.success) {
      createdInjuryId = data.injury.id;
      console.log('✅ Lesión creada con ID:', createdInjuryId);
      console.log('   Título:', data.injury.titulo);
      console.log('   Estado:', data.injury.estado);
      return true;
    } else {
      console.log('❌ Error creando lesión:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testReadInjuries() {
  console.log('\n📋 2. Leyendo lesiones del usuario...');
  
  try {
    const response = await fetch(`${API_BASE}/users/1/injuries`);
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Lesiones obtenidas:', data.injuries.length);
      
      // Separar por estado
      const active = data.injuries.filter(i => i.estado === 'activo');
      const recovering = data.injuries.filter(i => i.estado === 'en recuperación');
      const recovered = data.injuries.filter(i => i.estado === 'recuperado');
      
      console.log('   - Activas:', active.length);
      console.log('   - En recuperación:', recovering.length);
      console.log('   - Recuperadas:', recovered.length);
      
      // Mostrar la lesión creada
      const createdInjury = data.injuries.find(i => i.id === createdInjuryId);
      if (createdInjury) {
        console.log('   - Lesión creada encontrada:', createdInjury.titulo);
      }
      
      return true;
    } else {
      console.log('❌ Error leyendo lesiones:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testUpdateInjury() {
  console.log('\n✏️ 3. Actualizando lesión...');
  
  if (!createdInjuryId) {
    console.log('❌ No hay lesión para actualizar');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/injuries/${createdInjuryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado: 'en recuperación',
        tratamiento: 'Fisioterapia avanzada y ejercicios específicos',
        notas: 'Mejorando progresivamente, reducir intensidad'
      })
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Lesión actualizada exitosamente');
      console.log('   Nuevo estado:', data.injury.estado);
      console.log('   Nuevo tratamiento:', data.injury.tratamiento);
      return true;
    } else {
      console.log('❌ Error actualizando lesión:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testIAIntegration() {
  console.log('\n🤖 4. Probando integración con IA...');
  
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
    if (data.success) {
      console.log('✅ IA generó entrenamiento considerando lesiones');
      console.log('   Lesiones detectadas:', data.meta.profile_used.lesiones);
      console.log('   Ejercicios adaptados:', data.data.ejercicios.length);
      
      // Mostrar algunos ejercicios
      data.data.ejercicios.slice(0, 2).forEach((ej, i) => {
        console.log(`   ${i+1}. ${ej.nombre} - ${ej.notas}`);
      });
      
      return true;
    } else {
      console.log('❌ Error en IA:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

async function testDeleteInjury() {
  console.log('\n🗑️ 5. Eliminando lesión de prueba...');
  
  if (!createdInjuryId) {
    console.log('❌ No hay lesión para eliminar');
    return false;
  }
  
  try {
    const response = await fetch(`${API_BASE}/injuries/${createdInjuryId}`, {
      method: 'DELETE'
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ Lesión eliminada exitosamente');
      return true;
    } else {
      console.log('❌ Error eliminando lesión:', data.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Ejecutar todos los tests
async function runCRUDTests() {
  console.log('🚀 Iniciando tests CRUD de lesiones\n');
  
  const results = [];
  
  results.push(await testCreateInjury());
  results.push(await testReadInjuries());
  results.push(await testUpdateInjury());
  results.push(await testIAIntegration());
  results.push(await testDeleteInjury());
  
  const passed = results.filter(r => r).length;
  const total = results.length;
  
  console.log(`\n📊 Resultados: ${passed}/${total} tests pasaron`);
  
  if (passed === total) {
    console.log('🎉 ¡Todos los tests pasaron! El sistema CRUD está funcionando correctamente.');
  } else {
    console.log('⚠️ Algunos tests fallaron. Revisar la implementación.');
  }
}

runCRUDTests();
