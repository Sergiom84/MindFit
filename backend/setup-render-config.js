import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import readline from 'readline'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function question (prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve)
  })
}

async function setupRenderConfig () {
  console.log(`
🔧 Configuración de Base de Datos de Render para MindFit
========================================================

Este script te ayudará a configurar la conexión a tu base de datos PostgreSQL en Render.

📋 Información que necesitarás:
   • Host de la base de datos (ej: dpg-xxxxx-a.oregon-postgres.render.com)
   • Nombre de usuario
   • Contraseña
   • Nombre de la base de datos
   • Puerto (generalmente 5432)

🔍 Puedes encontrar esta información en:
   1. Ve a tu dashboard de Render (https://dashboard.render.com)
   2. Selecciona tu servicio de PostgreSQL
   3. Ve a la pestaña "Connect"
   4. Copia la información de "External Connection"

`)

  try {
    // Leer archivo .env actual
    const envPath = path.join(__dirname, '.env')
    let envContent = ''

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8')
      console.log('✅ Archivo .env encontrado, se actualizará con las nuevas credenciales.\n')
    } else {
      console.log('📝 Archivo .env no encontrado, se creará uno nuevo.\n')
      // Copiar desde .env.example si existe
      const examplePath = path.join(__dirname, '.env.example')
      if (fs.existsSync(examplePath)) {
        envContent = fs.readFileSync(examplePath, 'utf8')
        console.log('📋 Usando .env.example como plantilla.\n')
      }
    }

    // Solicitar credenciales
    console.log('Por favor, ingresa las credenciales de tu base de datos de Render:\n')

    const renderHost = await question('🌐 Host (ej: dpg-xxxxx-a.oregon-postgres.render.com): ')
    const renderUser = await question('👤 Usuario: ')
    const renderPassword = await question('🔐 Contraseña: ')
    const renderDatabase = await question('🗄️ Nombre de base de datos: ')
    const renderPort = await question('🔌 Puerto [5432]: ') || '5432'

    console.log('\n🔄 Validando credenciales...')

    // Validar que no estén vacías
    if (!renderHost || !renderUser || !renderPassword || !renderDatabase) {
      console.log('❌ Error: Todos los campos son obligatorios excepto el puerto.')
      rl.close()
      return
    }

    // Actualizar o agregar variables de entorno
    const renderVars = {
      RENDER_PGHOST: renderHost,
      RENDER_PGUSER: renderUser,
      RENDER_PGPASSWORD: renderPassword,
      RENDER_PGDATABASE: renderDatabase,
      RENDER_PGPORT: renderPort,
      DB_ENVIRONMENT: 'local' // Por defecto usar local
    }

    // Procesar contenido del .env
    let updatedEnvContent = envContent

    for (const [key, value] of Object.entries(renderVars)) {
      const regex = new RegExp(`^${key}=.*$`, 'm')
      const newLine = `${key}=${value}`

      if (regex.test(updatedEnvContent)) {
        // Actualizar línea existente
        updatedEnvContent = updatedEnvContent.replace(regex, newLine)
      } else {
        // Agregar nueva línea
        updatedEnvContent += `\n${newLine}`
      }
    }

    // Guardar archivo .env
    fs.writeFileSync(envPath, updatedEnvContent)

    console.log('✅ Configuración guardada en .env')

    // Mostrar resumen
    console.log(`
📋 Resumen de configuración:
   Host: ${renderHost}
   Usuario: ${renderUser}
   Base de datos: ${renderDatabase}
   Puerto: ${renderPort}
   
🔧 Variables agregadas/actualizadas en .env:
   RENDER_PGHOST=${renderHost}
   RENDER_PGUSER=${renderUser}
   RENDER_PGPASSWORD=***
   RENDER_PGDATABASE=${renderDatabase}
   RENDER_PGPORT=${renderPort}
   DB_ENVIRONMENT=local

🚀 Próximos pasos:
   1. Probar conexión: node sync-to-render.js --test-connection
   2. Sincronizar datos: node sync-to-render.js
   
⚠️ Nota: La variable DB_ENVIRONMENT está configurada como 'local'.
   Para usar Render en producción, cámbiala a 'render' en .env
`)

    // Preguntar si quiere probar la conexión
    const testConnection = await question('\n🔍 ¿Quieres probar la conexión ahora? (s/n): ')

    if (testConnection.toLowerCase() === 's' || testConnection.toLowerCase() === 'si') {
      console.log('\n🔄 Probando conexión a Render...')

      // Importar y ejecutar test de conexión
      try {
        const { testRenderConnection } = await import('./sync-to-render.js')
        await testRenderConnection()
      } catch (error) {
        console.log('❌ Error probando conexión:', error.message)
        console.log('💡 Verifica las credenciales y vuelve a intentar con: node sync-to-render.js --test-connection')
      }
    }
  } catch (error) {
    console.error('❌ Error durante la configuración:', error)
  } finally {
    rl.close()
  }
}

// Función para mostrar ayuda sobre cómo obtener credenciales de Render
function showRenderHelp () {
  console.log(`
📚 Cómo obtener las credenciales de tu base de datos PostgreSQL en Render:

1. 🌐 Ve a https://dashboard.render.com
2. 🔍 Busca y selecciona tu servicio de PostgreSQL
3. 📋 Ve a la pestaña "Connect" o "Info"
4. 📄 Busca la sección "External Connection" o "Connection Info"
5. 📝 Copia la información:

   Ejemplo de URL de conexión:
   postgresql://usuario:contraseña@host:puerto/database
   
   O información separada:
   • Host: dpg-xxxxx-a.oregon-postgres.render.com
   • Port: 5432
   • Database: nombre_db_xxxxx
   • Username: usuario
   • Password: contraseña_larga

🔐 Importante:
   • La contraseña es generada automáticamente por Render
   • El host incluye la región (oregon, frankfurt, etc.)
   • El puerto siempre es 5432 para PostgreSQL

💡 Si no tienes una base de datos en Render:
   1. Ve a https://dashboard.render.com
   2. Clic en "New +" → "PostgreSQL"
   3. Configura el nombre y región
   4. Espera a que se cree (puede tomar unos minutos)
   5. Sigue los pasos anteriores para obtener las credenciales
`)
}

// Manejo de argumentos
const args = process.argv.slice(2)

if (args.includes('--help')) {
  showRenderHelp()
} else {
  setupRenderConfig()
}

export { setupRenderConfig }
