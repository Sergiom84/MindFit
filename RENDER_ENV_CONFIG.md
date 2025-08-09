# 🔧 Configuración de Variables de Entorno para Render

## 🚨 Problema Identificado

Tu aplicación en Render está fallando porque el backend no puede conectarse a la base de datos. El error 500 en `/api/login` indica que falta la configuración de variables de entorno en Render.

## 📋 Variables de Entorno Requeridas

Debes configurar estas variables en tu servicio de **Web Service** en Render:

### 🔑 Variables Básicas
```
NODE_ENV=production
PORT=10000
```

### 🗄️ Variables de Base de Datos
```
DB_ENVIRONMENT=render
RENDER_PGHOST=dpg-d28teajuibrs73dus4u0-a.frankfurt-postgres.render.com
RENDER_PGUSER=mindfit_user
RENDER_PGPASSWORD=ki879BUruwiv0NnSRs5Sewu0mYtAub45
RENDER_PGDATABASE=mindfit_db
RENDER_PGPORT=5432
```

### 🤖 Variables de OpenAI
```
OPENAI_API_KEY=tu_api_key_de_openai_aqui
```

### 🌐 Variables de CORS
```
CORS_ORIGINS=https://mindfit.onrender.com,http://localhost:5173,http://127.0.0.1:5173
```

## 🛠️ Cómo Configurar en Render

### Paso 1: Acceder a tu Web Service
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Busca y selecciona tu **Web Service** (no la base de datos)
3. Ve a la pestaña **"Environment"**

### Paso 2: Agregar Variables
Para cada variable de la lista anterior:

1. Clic en **"Add Environment Variable"**
2. **Key**: Nombre de la variable (ej: `DB_ENVIRONMENT`)
3. **Value**: Valor de la variable (ej: `render`)
4. Clic en **"Save Changes"**

### Paso 3: Verificar Configuración
Asegúrate de tener **exactamente** estas variables:

| Variable | Valor |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `DB_ENVIRONMENT` | `render` |
| `RENDER_PGHOST` | `dpg-d28teajuibrs73dus4u0-a.frankfurt-postgres.render.com` |
| `RENDER_PGUSER` | `mindfit_user` |
| `RENDER_PGPASSWORD` | `ki879BUruwiv0NnSRs5Sewu0mYtAub45` |
| `RENDER_PGDATABASE` | `mindfit_db` |
| `RENDER_PGPORT` | `5432` |
| `OPENAI_API_KEY` | `tu_api_key_de_openai_aqui` |
| `CORS_ORIGINS` | `https://mindfit.onrender.com,http://localhost:5173,http://127.0.0.1:5173` |

### Paso 4: Redesplegar
1. Después de agregar todas las variables, clic en **"Manual Deploy"**
2. Selecciona **"Deploy latest commit"**
3. Espera a que termine el despliegue

## 🔍 Verificar que Funciona

### 1. Health Check
Visita: `https://tu-app.onrender.com/health`

Deberías ver:
```json
{
  "status": "ok",
  "message": "Backend MindFit funcionando correctamente",
  "timestamp": "2025-08-09T..."
}
```

### 2. Logs del Servidor
En la pestaña **"Logs"** de tu Web Service, deberías ver:
```
✅ Conexión a PostgreSQL establecida correctamente (render: dpg-d28teajuibrs73dus4u0-a.frankfurt-postgres.render.com/mindfit_db)
🚀 Servidor MindFit Backend ejecutándose en puerto 10000
🗄️ Base de datos PostgreSQL conectada
```

### 3. Probar Login
Intenta hacer login en tu aplicación con:
- **Email**: `test@example.com`
- **Password**: `password123`

## 🚨 Errores Comunes

### Error: "Connection refused"
- ✅ Verifica que `DB_ENVIRONMENT=render`
- ✅ Verifica que todas las variables `RENDER_PG*` estén configuradas
- ✅ Verifica que la base de datos PostgreSQL esté activa

### Error: "SSL required"
- ✅ Ya está configurado automáticamente en el código

### Error: "User not found"
- ✅ Asegúrate de que la sincronización de datos se completó
- ✅ Usa las credenciales del usuario de prueba: `test@example.com` / `password123`

## 📞 Siguiente Paso

Una vez configuradas las variables:

1. **Espera** a que termine el redespliegue (2-3 minutos)
2. **Verifica** el health check
3. **Prueba** el login en tu aplicación
4. **Revisa** los logs si hay errores

## 🎯 Resultado Esperado

Después de esta configuración:
- ✅ El backend se conectará a la base de datos de Render
- ✅ El login funcionará correctamente
- ✅ Los errores 500 desaparecerán
- ✅ La aplicación estará completamente funcional

---

**¿Necesitas ayuda?** Si encuentras problemas, revisa los logs en la pestaña "Logs" de tu Web Service en Render.
