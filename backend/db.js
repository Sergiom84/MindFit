// db.js
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

/** Decide configuración según variables de entorno */
const getDatabaseConfig = () => {
  // 1) Si hay DATABASE_URL (Render) la usamos directamente
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      application_name: 'mindfit-backend-render',
    };
  }

  // 2) Si DB_ENVIRONMENT=render con campos separados
  if ((process.env.DB_ENVIRONMENT || '').toLowerCase() === 'render') {
    return {
      user: process.env.RENDER_PGUSER,
      host: process.env.RENDER_PGHOST,
      database: process.env.RENDER_PGDATABASE,
      password: process.env.RENDER_PGPASSWORD,
      port: Number(process.env.RENDER_PGPORT || 5432),
      ssl: { rejectUnauthorized: false },
      application_name: 'mindfit-backend-render',
    };
  }

  // 3) Local por defecto
  return {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'mindfit',
    password: process.env.PGPASSWORD || 'postgres',
    port: Number(process.env.PGPORT || 5432),
    application_name: 'mindfit-backend-local',
  };
};

const dbConfig = getDatabaseConfig();
const pool = new Pool(dbConfig);

/** Log de errores del pool (evita procesos colgados) */
pool.on('error', (err) => {
  console.error('🛑 PG Pool error:', err);
});

/** Chequeo inmediato al arrancar: imprime BD/usuario/IP y search_path */
(async () => {
  try {
    const { rows } = await pool.query(`
      SELECT
        current_database()   AS db,
        current_user         AS usr,
        inet_server_addr()   AS server_ip,
        inet_client_addr()   AS client_ip,
        current_setting('search_path') AS search_path
    `);

    const info = rows[0];
    const mode =
      dbConfig.application_name?.includes('render') ? 'render' : 'local';

    console.log(
      `✅ PostgreSQL conectado (${mode}) → db=${info.db} user=${info.usr} server_ip=${info.server_ip} client_ip=${info.client_ip} search_path=${info.search_path}`
    );
  } catch (e) {
    console.error('❌ Error en DB CHECK:', e.message);
  }
})();

/** Comprobación explícita (si quieres llamarla desde server.js) */
export const testConnection = async () => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (e) {
    console.error('❌ Error conectando a PostgreSQL:', e.message);
    return false;
  }
};

/** Helper para queries con log de duración y filas */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('✅ Executed query', {
      text,
      duration,
      rows: res.rowCount,
    });
    return res;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

export default pool;
export { pool };
