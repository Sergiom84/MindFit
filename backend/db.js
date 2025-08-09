import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Función para obtener configuración de base de datos según el entorno
const getDatabaseConfig = () => {
  const dbEnvironment = process.env.DB_ENVIRONMENT || 'local';

  if (dbEnvironment === 'render') {
    return {
      user: process.env.RENDER_PGUSER,
      host: process.env.RENDER_PGHOST,
      database: process.env.RENDER_PGDATABASE,
      password: process.env.RENDER_PGPASSWORD,
      port: process.env.RENDER_PGPORT || 5432,
      ssl: {
        rejectUnauthorized: false // Render requiere SSL
      }
    };
  }

  // Configuración local por defecto
  return {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'mindfit',
    password: process.env.PGPASSWORD || 'postgres',
    port: process.env.PGPORT || 5432,
  };
};

// Configuración de la base de datos
const dbConfig = getDatabaseConfig();
const pool = new Pool(dbConfig);

// Función para probar la conexión
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const dbEnvironment = process.env.DB_ENVIRONMENT || 'local';
    const dbInfo = dbEnvironment === 'render' ?
      `${process.env.RENDER_PGHOST}/${process.env.RENDER_PGDATABASE}` :
      `${process.env.PGHOST || 'localhost'}/${process.env.PGDATABASE || 'mindfit'}`;

    console.log(`✅ Conexión a PostgreSQL establecida correctamente (${dbEnvironment}: ${dbInfo})`);
    client.release();
    return true;
  } catch (error) {
    const dbEnvironment = process.env.DB_ENVIRONMENT || 'local';
    console.error(`❌ Error conectando a PostgreSQL (${dbEnvironment}):`, error.message);
    return false;
  }
};

// Función helper para ejecutar queries
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

export default pool;
export { pool };
