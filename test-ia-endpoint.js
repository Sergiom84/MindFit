// Script de prueba para verificar el endpoint de IA
const testProfile = {
  id: 1,
  edad: 30,
  sexo: 'masculino',
  peso: 75,
  altura: 175,
  objetivo_principal: 'ganar masa muscular',
  nivel: 'intermedio',
  frecuencia_semanal: 4,
  limitaciones: 'Ninguna',
  prefiere_entrenar_en_casa: false,
  acceso_gimnasio: 'si'
};

async function testIAEndpoint() {
  try {
    console.log('🧪 Probando endpoint de IA...');
    console.log('📊 Perfil de prueba:', testProfile);
    
    const response = await fetch('http://localhost:5002/api/ia/recommend-and-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: testProfile.id,
        profile: testProfile,
        forcedMethodology: null // Modo automático
      })
    });
    
    const result = await response.json();
    
    console.log('📤 Status:', response.status);
    console.log('📥 Respuesta:', JSON.stringify(result, null, 2));
    
    if (result.success) {
      console.log('✅ ¡Endpoint funcionando correctamente!');
      console.log('🎯 Metodología recomendada:', result.data.methodology_name);
      console.log('📋 Rutina generada:', result.data.methodology_data);
    } else {
      console.log('❌ Error en el endpoint:', result.error);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message);
  }
}

// Ejecutar la prueba si se ejecuta directamente
if (typeof window === 'undefined') {
  testIAEndpoint();
}

export default testIAEndpoint;
