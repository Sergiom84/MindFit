# 🏠 Evaluación de Espacio de Entrenamiento - MindFit

## 📋 Descripción

Funcionalidad implementada para evaluar espacios de entrenamiento en casa usando inteligencia artificial (ChatGPT). Los usuarios pueden obtener recomendaciones personalizadas para optimizar su espacio y recibir sugerencias de ejercicios seguros.

## 🚀 Características Implementadas

### ✅ Opción 1: Evaluación por Imagen (GPT-4 Vision)
- **Captura de imagen**: Desde cámara o galería
- **Análisis IA**: GPT-4 Vision analiza el espacio
- **Recomendaciones**: Ejercicios seguros y optimización del espacio

### ✅ Opción 2: Evaluación por Preguntas
- **Formulario interactivo**: 8 campos de información
- **Análisis personalizado**: Basado en las respuestas del usuario
- **Sugerencias detalladas**: Rutinas adaptadas al espacio

## 🛠️ Arquitectura Técnica

### Frontend (React)
- **Componente**: `SpaceEvaluationModal.jsx`
- **UI Components**: Dialog, Tabs, Input, Textarea, Button
- **Funcionalidades**:
  - Captura de imágenes (cámara/galería)
  - Formulario de evaluación por texto
  - Interfaz responsive y accesible
  - Manejo de estados de carga y errores

### Backend (Node.js/Express)
- **Servidor**: `backend/server.js`
- **Puerto**: 5000
- **Endpoints**:
  - `POST /api/evaluar-espacio-imagen`
  - `POST /api/evaluar-espacio-texto`
  - `GET /health`

### Integración ChatGPT
- **Modelo**: GPT-4o (con capacidades de visión)
- **API**: OpenAI API v4
- **Prompts**: Especializados para entrenamiento en casa

## 📡 API Endpoints

### 1. Evaluación por Imagen
```http
POST /api/evaluar-espacio-imagen
Content-Type: multipart/form-data

Body:
- imagen: [archivo de imagen]

Response:
{
  "success": true,
  "tipo_evaluacion": "imagen",
  "analisis_espacio": "Análisis detallado del espacio..."
}
```

### 2. Evaluación por Texto
```http
POST /api/evaluar-espacio-texto
Content-Type: application/json

Body:
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

Response:
{
  "success": true,
  "tipo_evaluacion": "texto",
  "sugerencias_entrenamiento": "Recomendaciones personalizadas..."
}
```

## 🎯 Flujo de Usuario

1. **Acceso**: Usuario hace clic en "Comenzar Evaluación de Espacio"
2. **Selección**: Elige entre evaluación por imagen o por texto
3. **Captura/Formulario**: 
   - Imagen: Toma foto o sube archivo
   - Texto: Completa formulario de 8 campos
4. **Procesamiento**: IA analiza la información
5. **Resultados**: Recibe recomendaciones personalizadas
6. **Acciones**: Puede hacer nueva evaluación o cerrar

## 🔧 Instalación y Uso

### Requisitos Previos
- Node.js >= 18.0.0
- API Key de OpenAI
- Navegador moderno con soporte para cámara

### Instalación

1. **Clonar repositorio**:
   ```bash
   git clone https://github.com/Sergiom84/MindFit_IA.git
   cd MindFit_IA
   ```

2. **Instalar dependencias del frontend**:
   ```bash
   npm install
   ```

3. **Instalar dependencias del backend**:
   ```bash
   cd backend
   npm install
   ```

4. **Configurar variables de entorno**:
   ```bash
   cp backend/.env.example backend/.env
   # Editar .env y agregar OPENAI_API_KEY
   ```

### Ejecución

**Opción 1: Script automático**
```bash
start-mindfit.bat
```

**Opción 2: Manual**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
npm run dev
```

## 📱 Interfaz de Usuario

### Modal de Evaluación
- **Diseño**: Tema oscuro consistente con MindFit
- **Tabs**: Navegación entre opciones de imagen y texto
- **Responsive**: Adaptable a diferentes tamaños de pantalla
- **Accesibilidad**: Labels, ARIA attributes, navegación por teclado

### Campos del Formulario
1. **Tipo de espacio**: Sala, garaje, habitación, etc.
2. **Dimensiones**: Metros cuadrados aproximados
3. **Equipamiento**: Mancuernas, bandas, esterilla, etc.
4. **Tipo de suelo**: Parquet, baldosa, alfombra, etc.
5. **Obstáculos**: Muebles, limitaciones de altura, etc.
6. **Nivel de ruido**: Restricciones de vecinos
7. **Horarios**: Disponibilidad para entrenar
8. **Objetivos**: Perder peso, ganar músculo, etc.

## 🔒 Seguridad

- **Validación de archivos**: Solo imágenes permitidas
- **Límite de tamaño**: 10MB máximo
- **CORS configurado**: Dominios específicos
- **Limpieza automática**: Archivos temporales eliminados
- **Headers de seguridad**: Helmet.js implementado

## 🚀 Despliegue

### Desarrollo
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`

### Producción
- Configurado para Render.com
- Variables de entorno en producción
- Build optimizado con Vite

## 📊 Análisis IA

### Evaluación por Imagen
GPT-4 Vision analiza:
- Dimensiones del espacio
- Obstáculos y limitaciones
- Equipamiento visible
- Tipo de suelo y superficie
- Iluminación y ventilación
- Seguridad del entorno

### Evaluación por Texto
GPT-4 considera:
- Información proporcionada por el usuario
- Limitaciones específicas mencionadas
- Objetivos de entrenamiento
- Equipamiento disponible
- Restricciones de ruido y horarios

## 🎯 Recomendaciones Generadas

### Tipos de Análisis
1. **Evaluación del espacio disponible**
2. **Identificación de obstáculos**
3. **Equipamiento recomendado**
4. **Ejercicios seguros sugeridos**
5. **Ejercicios a evitar**
6. **Optimización del espacio**
7. **Plan de progresión**

## 🔄 Estados de la Aplicación

- **Inicial**: Modal cerrado
- **Selección**: Tabs de imagen/texto
- **Captura**: Tomando foto o subiendo archivo
- **Formulario**: Completando campos de texto
- **Cargando**: Procesando con IA
- **Resultados**: Mostrando recomendaciones
- **Error**: Manejo de errores con mensajes claros

## 📈 Próximas Mejoras

- [ ] Guardar evaluaciones en localStorage
- [ ] Compartir resultados por email/WhatsApp
- [ ] Integración con rutinas personalizadas
- [ ] Historial de evaluaciones
- [ ] Comparación de espacios
- [ ] Recomendaciones de equipamiento con enlaces de compra

## 🐛 Solución de Problemas

### Errores Comunes
1. **"Error de conexión"**: Verificar que el backend esté ejecutándose
2. **"API Key no válida"**: Revisar configuración en .env
3. **"Imagen muy grande"**: Reducir tamaño a menos de 10MB
4. **"Cámara no disponible"**: Verificar permisos del navegador

### Logs
- Backend: Console logs detallados
- Frontend: Errores en DevTools
- Network: Verificar requests en Network tab

---

**Desarrollado para MindFit App** 🏋️‍♂️  
*Entrenamiento inteligente en casa con IA*
