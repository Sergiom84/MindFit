# MindFit Backend API

Backend en Node.js/Express para la aplicación MindFit que proporciona funcionalidades de evaluación de espacio de entrenamiento usando ChatGPT.

## 🚀 Características

- **Evaluación por imagen**: Análisis de espacios usando GPT-4 Vision
- **Evaluación por texto**: Análisis basado en respuestas del usuario
- **API RESTful**: Endpoints bien estructurados
- **Manejo de archivos**: Subida segura de imágenes
- **CORS configurado**: Para desarrollo y producción
- **Logging**: Registro detallado de actividades

## 📋 Requisitos

- Node.js >= 18.0.0
- npm o yarn
- API Key de OpenAI

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env
   ```
   
   Editar `.env` y agregar tu API key de OpenAI:
   ```
   OPENAI_API_KEY=tu_api_key_aqui
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```

   O usar el script de Windows:
   ```bash
   start.bat
   ```

## 📡 Endpoints

### Health Check
- **GET** `/health`
- Verifica que el servidor esté funcionando

### Evaluación por Imagen
- **POST** `/api/evaluar-espacio-imagen`
- **Content-Type**: `multipart/form-data`
- **Body**: `imagen` (archivo de imagen)
- **Response**: Análisis del espacio usando GPT-4 Vision

### Evaluación por Texto
- **POST** `/api/evaluar-espacio-texto`
- **Content-Type**: `application/json`
- **Body**: 
  ```json
  {
    "respuestas": {
      "espacio": "Sala de estar",
      "dimensiones": "3x4 metros",
      "equipamiento": "Mancuernas, esterilla",
      "suelo": "Parquet",
      "obstaculos": "Mesa en el centro",
      "ruido": "Medio",
      "horarios": "Mañanas",
      "objetivos": "Perder peso"
    }
  }
  ```
- **Response**: Recomendaciones personalizadas

## 🔧 Scripts

- `npm start`: Iniciar servidor en producción
- `npm run dev`: Iniciar servidor con nodemon (desarrollo)
- `start.bat`: Script de Windows para desarrollo

## 📁 Estructura

```
backend/
├── server.js          # Servidor principal
├── package.json       # Dependencias y scripts
├── .env               # Variables de entorno
├── .env.example       # Ejemplo de variables
├── .gitignore         # Archivos ignorados por git
├── uploads/           # Directorio temporal para imágenes
└── README.md          # Este archivo
```

## 🔒 Seguridad

- Helmet.js para headers de seguridad
- Validación de tipos de archivo
- Límites de tamaño de archivo (10MB)
- CORS configurado para dominios específicos
- Limpieza automática de archivos temporales

## 🌐 Despliegue

El servidor está configurado para funcionar en:
- **Desarrollo**: `http://localhost:5000`
- **Producción**: Render.com (configurado en CORS)

## 📝 Logs

El servidor usa Morgan para logging HTTP y console.log para eventos importantes.

## ⚠️ Notas Importantes

- Las imágenes se almacenan temporalmente y se eliminan después del procesamiento
- La API key de OpenAI debe mantenerse segura
- El servidor maneja errores de forma robusta
- Compatible con el frontend React de MindFit
