import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTables() {
  try {
    const client = await pool.connect();
    
    console.log('🔍 Verificando tablas existentes...');
    
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log('\n📋 Tablas encontradas:');
    result.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Verificar específicamente la tabla users
    const usersCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    console.log(`\n👤 Tabla 'users' existe: ${usersCheck.rows[0].exists}`);
    
    if (usersCheck.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log(`👥 Número de usuarios: ${userCount.rows[0].count}`);
    }
    
    client.release();
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error:', error);
    await pool.end();
  }
}

checkTables();
