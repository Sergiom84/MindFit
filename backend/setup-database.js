import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de la base de datos local
const dbConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'mindfit',
  password: 'postgres',
  port: 5432,
};

// Configuración para conectar a postgres (para crear la base de datos)
const postgresConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'postgres',
  port: 5432,
};

async function setupDatabase() {
  console.log('🔄 Configurando base de datos PostgreSQL local...');
  
  let postgresPool;
  let mindFitPool;
  
  try {
    // 1. Conectar a PostgreSQL para crear la base de datos
    console.log('🔄 Conectando a PostgreSQL...');
    postgresPool = new Pool(postgresConfig);
    
    const postgresClient = await postgresPool.connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // 2. Verificar si la base de datos mindfit existe
    console.log('🔄 Verificando si la base de datos mindfit existe...');
    const dbExists = await postgresClient.query(
      "SELECT 1 FROM pg_database WHERE datname = 'mindfit'"
    );
    
    if (dbExists.rows.length === 0) {
      console.log('🔄 Creando base de datos mindfit...');
      await postgresClient.query('CREATE DATABASE mindfit');
      console.log('✅ Base de datos mindfit creada');
    } else {
      console.log('✅ Base de datos mindfit ya existe');
    }
    
    postgresClient.release();
    await postgresPool.end();
    
    // 3. Conectar a la base de datos mindfit
    console.log('🔄 Conectando a la base de datos mindfit...');
    mindFitPool = new Pool(dbConfig);
    
    const mindFitClient = await mindFitPool.connect();
    console.log('✅ Conectado a mindfit');
    
    // 4. Leer y ejecutar el script SQL
    console.log('🔄 Ejecutando script de inicialización...');
    const sqlScript = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'init.sql'), 'utf8');

    // Dividir el script en statements individuales
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      if (statement.trim()) {
        await mindFitClient.query(statement);
      }
    }
    console.log('✅ Tablas creadas exitosamente');
    
    // 5. Verificar las tablas creadas
    const result = await mindFitClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('📋 Tablas creadas:', result.rows.map(row => row.table_name));
    
    // 6. Verificar usuarios
    const users = await mindFitClient.query("SELECT COUNT(*) as total FROM users");
    console.log('👥 Total usuarios:', users.rows[0].total);
    
    mindFitClient.release();
    await mindFitPool.end();
    
    console.log('🎉 ¡Base de datos mindfit configurada completamente!');
    console.log('');
    console.log('📋 Configuración de la base de datos:');
    console.log('   Host: localhost');
    console.log('   Puerto: 5432');
    console.log('   Usuario: postgres');
    console.log('   Contraseña: postgres');
    console.log('   Base de datos: mindfit');
    console.log('');
    console.log('✅ Puedes iniciar la aplicación con: npm run start-app');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error.message);
    console.log('');
    console.log('🔧 Asegúrate de que:');
    console.log('   1. PostgreSQL esté instalado y ejecutándose');
    console.log('   2. El usuario "postgres" tenga contraseña "postgres"');
    console.log('   3. PostgreSQL esté ejecutándose en el puerto 5432');
    console.log('   4. Tengas permisos para crear bases de datos');
    process.exit(1);
  }
}

// Función para probar la conexión
export async function testDatabaseConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    const client = await pool.connect();
    console.log('✅ Conexión a PostgreSQL establecida correctamente');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('❌ Error conectando a PostgreSQL:', error.message);
    await pool.end();
    return false;
  }
}

// Ejecutar setup si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase();
}

export default setupDatabase;
