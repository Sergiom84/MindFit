# 🔄 Guía de Sincronización: Base de Datos Local → Render

Esta guía te ayudará a sincronizar tu base de datos PostgreSQL local con una base de datos PostgreSQL en Render.

## 📋 Requisitos Previos

1. **Base de datos local funcionando** con datos de MindFit
2. **Cuenta en Render** con una base de datos PostgreSQL creada
3. **Node.js 18+** instalado
4. **Credenciales de Render** (host, usuario, contraseña, base de datos)

## 🚀 Proceso de Sincronización

### Paso 1: Configurar Credenciales de Render

```bash
# Desde el directorio backend
cd backend
npm run setup-render
```

Este comando te guiará para:
- ✅ Ingresar las credenciales de tu base de datos de Render
- ✅ Actualizar el archivo `.env` con la configuración
- ✅ Probar la conexión (opcional)

### Paso 2: Probar Conexión a Render

```bash
npm run test-render
```

Esto verificará que puedas conectarte correctamente a tu base de datos de Render.

### Paso 3: Sincronizar Datos

```bash
npm run sync-to-render
```

Este comando:
1. 📤 Exporta el esquema completo de tu base de datos local
2. 📤 Exporta todos los datos de tu base de datos local
3. 📥 Aplica el esquema a la base de datos de Render
4. 📥 Importa todos los datos a Render
5. ✅ Verifica que la sincronización fue exitosa

## 🔧 Comandos Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run setup-render` | Configurar credenciales de Render |
| `npm run test-render` | Probar conexión a Render |
| `npm run export-schema` | Solo exportar esquema local |
| `npm run export-data` | Solo exportar datos locales |
| `npm run sync-to-render` | Sincronización completa |

## 📁 Archivos Generados

Durante la sincronización se crean estos archivos en `database_migrations/`:

- `exported_schema.sql` - Estructura completa de la base de datos
- `exported_data.sql` - Todos los datos en formato SQL
- `export_summary.json` - Resumen de la exportación

## 🔍 Cómo Obtener Credenciales de Render

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Selecciona tu servicio PostgreSQL
3. Ve a la pestaña **"Connect"** o **"Info"**
4. Copia la información de **"External Connection"**:

```
Host: dpg-xxxxx-a.oregon-postgres.render.com
Port: 5432
Database: nombre_db_xxxxx
Username: usuario
Password: contraseña_generada
```

## ⚙️ Configuración de Entornos

El sistema soporta dos entornos:

### Entorno Local (por defecto)
```env
DB_ENVIRONMENT=local
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=mindfit
PGPORT=5432
```

### Entorno Render
```env
DB_ENVIRONMENT=render
RENDER_PGHOST=tu_host_render.com
RENDER_PGUSER=tu_usuario
RENDER_PGPASSWORD=tu_contraseña
RENDER_PGDATABASE=tu_database
RENDER_PGPORT=5432
```

## 🔄 Cambiar Entre Entornos

Para usar la base de datos de Render en tu aplicación:

1. Edita `backend/.env`
2. Cambia `DB_ENVIRONMENT=local` por `DB_ENVIRONMENT=render`
3. Reinicia tu aplicación

## 🛠️ Solución de Problemas

### Error: "Connection refused"
- ✅ Verifica que las credenciales sean correctas
- ✅ Asegúrate de que la base de datos de Render esté activa
- ✅ Revisa que el host incluya la región correcta

### Error: "SSL required"
- ✅ Las conexiones a Render requieren SSL (ya configurado automáticamente)

### Error: "Database does not exist"
- ✅ Verifica el nombre de la base de datos en Render
- ✅ Asegúrate de que la base de datos esté creada y activa

### Error: "Permission denied"
- ✅ Verifica usuario y contraseña
- ✅ Asegúrate de usar las credenciales de "External Connection"

## 📊 Verificación Post-Sincronización

Después de la sincronización, verifica:

1. **Tablas creadas**: `users`, `injuries`
2. **Datos importados**: Usuarios y lesiones
3. **Índices y constraints**: Claves primarias y foráneas
4. **Funciones y triggers**: Cálculo automático de IMC

## 🔐 Seguridad

- ✅ Las credenciales se almacenan en `.env` (no se suben a git)
- ✅ Las conexiones a Render usan SSL automáticamente
- ✅ Los scripts son idempotentes (se pueden ejecutar múltiples veces)

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs de error detallados
2. Verifica la configuración en `.env`
3. Prueba la conexión con `npm run test-render`
4. Consulta la documentación de Render PostgreSQL

---

## 🎯 Ejemplo Completo

```bash
# 1. Configurar Render
cd backend
npm run setup-render

# 2. Probar conexión
npm run test-render

# 3. Sincronizar
npm run sync-to-render

# 4. Verificar en Render Dashboard
# Ve a tu base de datos y revisa las tablas
```

¡Listo! Tu base de datos local ahora está sincronizada con Render. 🎉
