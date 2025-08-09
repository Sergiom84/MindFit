import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la base de datos de Render
const getRenderDbConfig = () => {
  return {
    user: process.env.RENDER_PGUSER,
    host: process.env.RENDER_PGHOST,
    database: process.env.RENDER_PGDATABASE,
    password: process.env.RENDER_PGPASSWORD,
    port: process.env.RENDER_PGPORT || 5432,
    ssl: {
      rejectUnauthorized: false
    }
  };
};

async function applySchemaToRender() {
  console.log('🚀 Aplicando esquema actualizado a base de datos de Render...');
  
  const renderConfig = getRenderDbConfig();
  const pool = new Pool(renderConfig);
  let client;
  
  try {
    client = await pool.connect();
    console.log('✅ Conectado a Render');
    
    // Leer el archivo de esquema actualizado
    const schemaPath = path.join(__dirname, '..', 'database_schema_updated.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('🔄 Aplicando esquema desde database_schema_updated.sql...');
    
    // Primero, necesitamos actualizar el esquema para usar JSONB en limitaciones
    // según el CSV que proporcionaste
    const updatedSchemaSQL = schemaSQL.replace(
      'limitaciones TEXT,',
      'limitaciones JSONB DEFAULT \'[]\'::jsonb,'
    );
    
    // Ejecutar el esquema completo
    await client.query(updatedSchemaSQL);
    
    console.log('✅ Esquema aplicado exitosamente');
    
    // Verificar tablas creadas
    const tablesResult = await client.query(`
      SELECT 
        table_name, 
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('📊 Tablas creadas en Render:');
    for (const table of tablesResult.rows) {
      const countResult = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      console.log(`  📄 ${table.table_name}: ${table.column_count} columnas, ${countResult.rows[0].count} registros`);
    }
    
    // Verificar que las columnas importantes estén presentes
    console.log('\n🔍 Verificando estructura de tabla users...');
    const usersColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas en tabla users:');
    for (const col of usersColumnsResult.rows) {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    }
    
    console.log('\n🔍 Verificando estructura de tabla injuries...');
    const injuriesColumnsResult = await client.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'injuries' AND table_schema = 'public'
      ORDER BY ordinal_position
    `);
    
    console.log('Columnas en tabla injuries:');
    for (const col of injuriesColumnsResult.rows) {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    }
    
  } catch (error) {
    console.error('❌ Error aplicando esquema:', error);
    console.error('Detalle del error:', error.message);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('apply-schema-to-render.js')) {
  applySchemaToRender();
}

export { applySchemaToRender };
