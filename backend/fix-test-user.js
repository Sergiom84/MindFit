import bcrypt from 'bcryptjs';
import { query } from './db.js';

async function fixTestUser() {
  try {
    console.log('🔄 Corrigiendo usuario de prueba...');
    
    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Actualizar el usuario de prueba
    const result = await query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING id, nombre, email',
      [hashedPassword, 'test@example.com']
    );
    
    if (result.rows.length > 0) {
      console.log('✅ Usuario de prueba actualizado:', result.rows[0]);
    } else {
      console.log('⚠️ Usuario de prueba no encontrado, creando...');
      
      // Crear usuario de prueba con contraseña hasheada
      const insertResult = await query(`
        INSERT INTO users (nombre, apellido, email, password, edad, sexo, objetivo_principal, iniciales)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, nombre, email
      `, ['Test', 'User', 'test@example.com', hashedPassword, 25, 'masculino', 'mantener_forma', 'TU']);
      
      console.log('✅ Usuario de prueba creado:', insertResult.rows[0]);
    }
    
    console.log('🎉 Usuario de prueba configurado correctamente');
    console.log('📋 Credenciales:');
    console.log('   Email: test@example.com');
    console.log('   Contraseña: password123');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  process.exit(0);
}

fixTestUser();
