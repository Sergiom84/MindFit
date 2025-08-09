import fetch from 'node-fetch';

async function testRenderEndpoints() {
  const baseUrl = 'https://mindfit.onrender.com/api';
  
  console.log('🔄 Probando endpoints correctos de Render...\n');
  
  // Test 1: Register (POST)
  try {
    console.log('1️⃣ Probando POST /api/register...');
    const registerResponse = await fetch(`${baseUrl}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: 'Test2',
        apellido: 'User2',
        email: 'test2@example.com',
        password: 'password123',
        edad: 30,
        sexo: 'masculino'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('📊 Register:', registerResponse.status, registerData.success ? '✅ Exitoso' : '❌ ' + registerData.error);
    
  } catch (error) {
    console.log('❌ Register error:', error.message);
  }
  
  // Test 2: Get user injuries (GET)
  try {
    console.log('\n2️⃣ Probando GET /api/users/1/injuries...');
    const injuriesResponse = await fetch(`${baseUrl}/users/1/injuries`);
    const injuriesData = await injuriesResponse.json();
    console.log('📊 User injuries:', injuriesResponse.status, injuriesData.success ? '✅ Exitoso' : '❌ ' + injuriesData.error);
    
  } catch (error) {
    console.log('❌ User injuries error:', error.message);
  }
  
  // Test 3: Update user (PATCH)
  try {
    console.log('\n3️⃣ Probando PATCH /api/users/1...');
    const updateResponse = await fetch(`${baseUrl}/users/1`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        peso: '76.0'
      })
    });
    
    const updateData = await updateResponse.json();
    console.log('📊 Update user:', updateResponse.status, updateData.success ? '✅ Exitoso' : '❌ ' + updateData.error);
    
  } catch (error) {
    console.log('❌ Update user error:', error.message);
  }
  
  // Test 4: IA Adaptativa (POST)
  try {
    console.log('\n4️⃣ Probando POST /api/activar-ia-adaptativa...');
    const iaResponse = await fetch(`${baseUrl}/activar-ia-adaptativa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: 1
      })
    });
    
    const iaData = await iaResponse.json();
    console.log('📊 IA Adaptativa:', iaResponse.status, iaData.success ? '✅ Exitoso' : '❌ ' + iaData.error);
    
  } catch (error) {
    console.log('❌ IA Adaptativa error:', error.message);
  }
  
  console.log('\n🎯 Prueba completada!');
}

testRenderEndpoints();
