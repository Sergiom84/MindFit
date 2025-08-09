import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'mindfit',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
});

async function checkSequences() {
  const client = await pool.connect();
  
  try {
    const result = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    console.log('Secuencias encontradas:', result.rows);
    
    // También verificar con pg_class
    const pgClassResult = await client.query(`
      SELECT relname 
      FROM pg_class 
      WHERE relkind = 'S' 
      AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);
    
    console.log('Secuencias desde pg_class:', pgClassResult.rows);
    
  } finally {
    client.release();
    await pool.end();
  }
}

checkSequences();
