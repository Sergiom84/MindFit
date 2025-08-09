import fetch from 'node-fetch';

async function testRenderLogin() {
  const baseUrl = 'https://mindfit.onrender.com';
  
  console.log('🔄 Probando endpoints de Render...\n');
  
  // Test 1: Health check
  try {
    console.log('1️⃣ Probando /health...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthResponse.status, healthData);
  } catch (error) {
    console.log('❌ Health error:', error.message);
  }
  
  // Test 2: API base
  try {
    console.log('\n2️⃣ Probando /api...');
    const apiResponse = await fetch(`${baseUrl}/api`);
    const apiData = await apiResponse.json();
    console.log('📊 API base:', apiResponse.status, apiData);
  } catch (error) {
    console.log('❌ API base error:', error.message);
  }
  
  // Test 3: Login endpoint
  try {
    console.log('\n3️⃣ Probando /api/login...');
    const loginResponse = await fetch(`${baseUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('📊 Login:', loginResponse.status, loginData);
    
    if (loginData.success) {
      console.log('✅ Login exitoso!');
    } else {
      console.log('❌ Login falló:', loginData.error);
    }
    
  } catch (error) {
    console.log('❌ Login error:', error.message);
  }
  
  // Test 4: Verificar si las rutas están registradas
  try {
    console.log('\n4️⃣ Probando otros endpoints...');
    
    const endpoints = ['/api/register', '/api/users', '/api/injuries'];
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${baseUrl}${endpoint}`);
        const data = await response.json();
        console.log(`📊 ${endpoint}:`, response.status, data.error || data.message || 'OK');
      } catch (err) {
        console.log(`❌ ${endpoint}:`, err.message);
      }
    }
    
  } catch (error) {
    console.log('❌ Error general:', error.message);
  }
}

testRenderLogin();
