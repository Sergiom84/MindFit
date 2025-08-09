// Test para verificar si las rutas se cargan correctamente
import express from 'express';

console.log('🔄 Probando carga de rutas...\n');

try {
  console.log('1️⃣ Cargando iaAdaptativa...');
  const iaAdaptativa = await import('./routes/iaAdaptativa.js');
  console.log('✅ iaAdaptativa cargado:', typeof iaAdaptativa.default);
} catch (error) {
  console.log('❌ Error cargando iaAdaptativa:', error.message);
}

try {
  console.log('2️⃣ Cargando authRoutes...');
  const authRoutes = await import('./routes/auth.js');
  console.log('✅ authRoutes cargado:', typeof authRoutes.default);
} catch (error) {
  console.log('❌ Error cargando authRoutes:', error.message);
}

try {
  console.log('3️⃣ Cargando injuriesRoutes...');
  const injuriesRoutes = await import('./routes/injuries.js');
  console.log('✅ injuriesRoutes cargado:', typeof injuriesRoutes.default);
} catch (error) {
  console.log('❌ Error cargando injuriesRoutes:', error.message);
}

try {
  console.log('4️⃣ Cargando poseRoutes...');
  const poseRoutes = await import('./routes/pose.js');
  console.log('✅ poseRoutes cargado:', typeof poseRoutes.default);
} catch (error) {
  console.log('❌ Error cargando poseRoutes:', error.message);
}

console.log('\n🎯 Prueba completada!');
