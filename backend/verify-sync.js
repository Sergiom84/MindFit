import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Configuración de la base de datos local
const localDbConfig = {
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'mindfit',
  password: process.env.PGPASSWORD || 'postgres',
  port: process.env.PGPORT || 5432,
};

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

async function verifySync() {
  console.log('🔍 Verificando sincronización entre base de datos local y Render...\n');
  
  const localPool = new Pool(localDbConfig);
  const renderPool = new Pool(getRenderDbConfig());
  
  let localClient, renderClient;
  
  try {
    // Conectar a ambas bases de datos
    localClient = await localPool.connect();
    renderClient = await renderPool.connect();
    
    console.log('✅ Conectado a base de datos local');
    console.log('✅ Conectado a base de datos de Render\n');
    
    // 1. Comparar estructura de tablas
    console.log('📊 COMPARACIÓN DE ESTRUCTURA DE TABLAS\n');
    
    const localTables = await localClient.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    const renderTables = await renderClient.query(`
      SELECT table_name, 
             (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    
    console.log('Local:');
    for (const table of localTables.rows) {
      console.log(`  📄 ${table.table_name}: ${table.column_count} columnas`);
    }
    
    console.log('\nRender:');
    for (const table of renderTables.rows) {
      console.log(`  📄 ${table.table_name}: ${table.column_count} columnas`);
    }
    
    // 2. Comparar cantidad de datos
    console.log('\n📊 COMPARACIÓN DE DATOS\n');
    
    for (const table of localTables.rows) {
      const tableName = table.table_name;
      
      const localCount = await localClient.query(`SELECT COUNT(*) FROM ${tableName}`);
      const renderCount = await renderClient.query(`SELECT COUNT(*) FROM ${tableName}`);
      
      const localTotal = parseInt(localCount.rows[0].count);
      const renderTotal = parseInt(renderCount.rows[0].count);
      
      const status = localTotal === renderTotal ? '✅' : '⚠️';
      
      console.log(`${status} ${tableName}:`);
      console.log(`    Local: ${localTotal} registros`);
      console.log(`    Render: ${renderTotal} registros`);
      
      if (localTotal !== renderTotal) {
        console.log(`    ⚠️ Diferencia: ${Math.abs(localTotal - renderTotal)} registros`);
      }
      console.log('');
    }
    
    // 3. Verificar usuarios específicos
    console.log('👥 VERIFICACIÓN DE USUARIOS\n');
    
    const localUsers = await localClient.query('SELECT id, nombre, apellido, email FROM users ORDER BY id');
    const renderUsers = await renderClient.query('SELECT id, nombre, apellido, email FROM users ORDER BY id');
    
    console.log('Usuarios en Local:');
    for (const user of localUsers.rows) {
      console.log(`  👤 ${user.id}: ${user.nombre} ${user.apellido} (${user.email})`);
    }
    
    console.log('\nUsuarios en Render:');
    for (const user of renderUsers.rows) {
      console.log(`  👤 ${user.id}: ${user.nombre} ${user.apellido} (${user.email})`);
    }
    
    // 4. Verificar lesiones
    console.log('\n🩹 VERIFICACIÓN DE LESIONES\n');
    
    const localInjuries = await localClient.query(`
      SELECT i.id, i.titulo, i.zona, i.estado, u.email as user_email 
      FROM injuries i 
      JOIN users u ON i.user_id = u.id 
      ORDER BY i.id
    `);
    
    const renderInjuries = await renderClient.query(`
      SELECT i.id, i.titulo, i.zona, i.estado, u.email as user_email 
      FROM injuries i 
      JOIN users u ON i.user_id = u.id 
      ORDER BY i.id
    `);
    
    console.log('Lesiones en Local:');
    for (const injury of localInjuries.rows) {
      console.log(`  🩹 ${injury.id}: ${injury.titulo || 'Sin título'} - ${injury.zona || 'Sin zona'} (${injury.user_email})`);
    }
    
    console.log('\nLesiones en Render:');
    for (const injury of renderInjuries.rows) {
      console.log(`  🩹 ${injury.id}: ${injury.titulo || 'Sin título'} - ${injury.zona || 'Sin zona'} (${injury.user_email})`);
    }
    
    // 5. Verificar integridad referencial
    console.log('\n🔗 VERIFICACIÓN DE INTEGRIDAD REFERENCIAL\n');
    
    const renderOrphanInjuries = await renderClient.query(`
      SELECT COUNT(*) FROM injuries i 
      WHERE NOT EXISTS (SELECT 1 FROM users u WHERE u.id = i.user_id)
    `);
    
    const orphanCount = parseInt(renderOrphanInjuries.rows[0].count);
    
    if (orphanCount === 0) {
      console.log('✅ Todas las lesiones tienen usuarios válidos');
    } else {
      console.log(`⚠️ ${orphanCount} lesiones sin usuario válido`);
    }
    
    // 6. Resumen final
    console.log('\n📋 RESUMEN DE SINCRONIZACIÓN\n');
    
    const totalLocalRecords = localTables.rows.reduce(async (acc, table) => {
      const count = await localClient.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      return (await acc) + parseInt(count.rows[0].count);
    }, Promise.resolve(0));
    
    const totalRenderRecords = renderTables.rows.reduce(async (acc, table) => {
      const count = await renderClient.query(`SELECT COUNT(*) FROM ${table.table_name}`);
      return (await acc) + parseInt(count.rows[0].count);
    }, Promise.resolve(0));
    
    const localTotal = await totalLocalRecords;
    const renderTotal = await totalRenderRecords;
    
    console.log(`📊 Total registros Local: ${localTotal}`);
    console.log(`📊 Total registros Render: ${renderTotal}`);
    
    if (localTotal === renderTotal) {
      console.log('✅ Sincronización completa: Todos los registros coinciden');
    } else {
      console.log(`⚠️ Diferencia total: ${Math.abs(localTotal - renderTotal)} registros`);
    }
    
    console.log('\n🎉 Verificación completada!');
    
  } catch (error) {
    console.error('❌ Error durante la verificación:', error);
  } finally {
    if (localClient) localClient.release();
    if (renderClient) renderClient.release();
    await localPool.end();
    await renderPool.end();
  }
}

// Ejecutar si se llama directamente
if (process.argv[1] && process.argv[1].endsWith('verify-sync.js')) {
  verifySync();
}

export { verifySync };
