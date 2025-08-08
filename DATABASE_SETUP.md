# Configuración de Base de Datos PostgreSQL Local para MindFit

## 📋 Requisitos Previos

1. **PostgreSQL instalado** en tu sistema local
2. **DBeaver** (opcional, para administración visual)
3. **Node.js 18+** para ejecutar los scripts

## 🛠️ Configuración Paso a Paso

### 1. Verificar PostgreSQL

Asegúrate de que PostgreSQL esté ejecutándose:

```bash
# En Windows (PowerShell como administrador)
Get-Service postgresql*

# O verificar si el puerto está en uso
netstat -an | findstr :5432
```

### 2. Configurar Usuario y Base de Datos

La aplicación espera esta configuración:

- **Host**: localhost
- **Puerto**: 5432
- **Usuario**: postgres
- **Contraseña**: postgres
- **Base de datos**: mindfit

### 3. Configuración Automática

Ejecuta el script de configuración automática:

```bash
# Desde la raíz del proyecto
npm run setup-db
```

Este script:
- ✅ Verifica la conexión a PostgreSQL
- ✅ Crea la base de datos `mindfit` si no existe
- ✅ Ejecuta el script de inicialización de tablas
- ✅ Inserta un usuario de prueba
- ✅ Verifica que todo esté configurado correctamente

### 4. Configuración Manual (Alternativa)

Si prefieres configurar manualmente:

#### 4.1 Crear Base de Datos
```sql
-- Conectar a PostgreSQL como usuario postgres
CREATE DATABASE mindfit;
```

#### 4.2 Ejecutar Script de Tablas
```sql
-- Conectar a la base de datos mindfit
-- Copiar y ejecutar el contenido de scripts/init.sql
```

### 5. Verificar Configuración

#### 5.1 Con DBeaver
1. Crear nueva conexión PostgreSQL
2. Host: `localhost`
3. Puerto: `5432`
4. Base de datos: `mindfit`
5. Usuario: `postgres`
6. Contraseña: `postgres`

#### 5.2 Con Script de Prueba
```bash
# Desde el directorio backend
cd backend
node quick-test.js
```

## 🚀 Iniciar la Aplicación

Una vez configurada la base de datos:

```bash
# Opción 1: Script automático (Windows)
start-mindfit.bat

# Opción 2: Manual
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 🔧 Solución de Problemas

### Error: "Connection refused"
- ✅ Verificar que PostgreSQL esté ejecutándose
- ✅ Verificar puerto 5432 disponible
- ✅ Verificar credenciales (postgres/postgres)

### Error: "Database does not exist"
- ✅ Ejecutar `npm run setup-db`
- ✅ O crear manualmente: `CREATE DATABASE mindfit;`

### Error: "Table does not exist"
- ✅ Ejecutar script de inicialización: `scripts/init.sql`
- ✅ O ejecutar `npm run setup-db`

### Error: "Authentication failed"
- ✅ Verificar contraseña del usuario postgres
- ✅ Configurar contraseña: `ALTER USER postgres PASSWORD 'postgres';`

## 📊 Estructura de la Base de Datos

### Tabla: users
Contiene toda la información del perfil del usuario:

- **Información básica**: nombre, apellido, email, password
- **Datos físicos**: edad, sexo, peso, altura, IMC
- **Métricas corporales**: grasa corporal, masa muscular, agua corporal
- **Medidas**: cintura, pecho, brazos, muslos, cuello, antebrazos
- **Información médica**: historial, limitaciones, alergias, medicamentos
- **Objetivos**: objetivo principal, metas de peso y grasa corporal
- **Preferencias**: horario, metodología, frecuencia de entrenamiento

### Usuario de Prueba
- **Email**: test@example.com
- **Contraseña**: password123
- **Datos**: Usuario básico para pruebas

## 🔄 Migración desde Docker

Si venías usando Docker:

1. ✅ **Exportar datos** (si los tienes):
   ```bash
   docker exec mindfit pg_dump -U postgres mindfit > backup.sql
   ```

2. ✅ **Detener contenedores**:
   ```bash
   docker-compose down
   ```

3. ✅ **Configurar PostgreSQL local** siguiendo esta guía

4. ✅ **Importar datos** (si los tienes):
   ```bash
   psql -U postgres -d mindfit < backup.sql
   ```

## 📝 Variables de Entorno

Asegúrate de tener configuradas las variables de entorno:

### Frontend (.env)
```env
VITE_OPENAI_API_KEY=tu_api_key_aqui
VITE_API_URL=http://localhost:5000
```

### Backend (backend/.env)
```env
OPENAI_API_KEY=tu_api_key_aqui
PORT=5000
PGUSER=postgres
PGHOST=localhost
PGDATABASE=mindfit
PGPASSWORD=postgres
PGPORT=5432
```
