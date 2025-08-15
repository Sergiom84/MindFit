import fetch from 'node-fetch'

async function testLogin () {
  try {
    console.log('🔄 Probando login con usuario de prueba...')

    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    })

    const result = await response.json()

    console.log('📊 Status:', response.status)
    console.log('📊 Response:', JSON.stringify(result, null, 2))

    if (result.success) {
      console.log('✅ Login exitoso!')
      console.log('👤 Usuario:', result.user.nombre, result.user.apellido)
    } else {
      console.log('❌ Login falló:', result.error)
    }
  } catch (error) {
    console.error('❌ Error en la prueba:', error.message)
  }
}

testLogin()
