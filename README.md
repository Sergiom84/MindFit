# 🏋️‍♂️ MindFit AI - Entrenador Personal Inteligente

Una aplicación de entrenamiento personal impulsada por IA que adapta rutinas, nutrición y seguimiento automáticamente según tu progreso y objetivos.

## 🚀 Características Principales

### 🤖 **IA Adaptativa Avanzada**
- Análisis en tiempo real de evolución anatómica y metabólica
- Ajuste automático de rutinas según progreso
- Personalización basada en feedback del usuario

### 📹 **Corrección por Video IA**
- Análisis de técnica en tiempo real con MediaPipe
- Detección de errores de postura fotograma a fotograma
- Feedback inmediato visual, sonoro y háptico
- Integración con GPT-4o para análisis personalizado

### 🏠 **Entrenamiento en Casa**
- Modalidad multifuncional con bandas, mancuernas y peso corporal
- Adaptación al espacio disponible
- Equipamiento mínimo, máximo resultado

### 🍎 **Nutrición Inteligente**
- Planes nutricionales personalizados
- Seguimiento de macronutrientes
- Recomendaciones de suplementos basadas en IA
- Integración con objetivos de entrenamiento

### 🩺 **Prevención de Lesiones**
- Monitoreo automático de factores de riesgo
- Historial médico integrado
- Adaptaciones preventivas automáticas
- Sistema de alertas tempranas

### 📊 **Análisis de Progreso**
- Métricas detalladas de rendimiento
- Insights de IA sobre evolución
- Comparativas temporales
- Predicciones de progreso

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + Vite
- **UI Components**: Radix UI + Tailwind CSS
- **IA**: OpenAI GPT-4o con prompts personalizados
- **Análisis de Video**: MediaPipe (Pose Detection)
- **Gestión de Estado**: React Context
- **Routing**: React Router DOM
- **Iconos**: Lucide React

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o yarn
- API Key de OpenAI
- Cámara web (para corrección por video)

## 🚀 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Sergiom84/MindFit.git
cd MindFit
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega tu API key de OpenAI:
```env
VITE_OPENAI_API_KEY=tu_api_key_aqui
VITE_OPENAI_PROMPT_ID=tu_prompt_id_aqui
VITE_OPENAI_PROMPT_VERSION=2
```

4. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
```

5. **Abrir en el navegador:**
```
http://localhost:5173
```

## 🔧 Configuración de OpenAI

### Obtener API Key:
1. Ve a [OpenAI Platform](https://platform.openai.com/api-keys)
2. Crea una nueva API key
3. Cópiala en tu archivo `.env`

### Prompt Personalizado (Opcional):
Si tienes un prompt personalizado para el análisis de entrenamiento:
1. Obtén el ID de tu prompt
2. Agrégalo a `VITE_OPENAI_PROMPT_ID` en `.env`

## 📱 Funcionalidades por Pantalla

### 🏠 **Inicio**
- Dashboard principal con acceso rápido
- Resumen de progreso diario
- Accesos directos a funciones principales

### 👤 **Perfil**
- Datos personales y antropométricos
- Historial médico y lesiones
- Objetivos y preferencias

### 🏋️ **Metodologías**
- Heavy Duty, Powerlifting, Hipertrofia
- Entrenamiento Funcional, HIIT
- Versiones adaptadas vs estrictas

### 📅 **Rutinas**
- Planificación semanal inteligente
- Seguimiento de ejercicios
- Progresión automática

### 🍎 **Nutrición**
- Planes alimentarios personalizados
- Tracking de macronutrientes
- Recomendaciones de suplementos

### 🩺 **Lesiones**
- Prevención basada en IA
- Historial médico
- Adaptaciones automáticas

### 📊 **Progreso**
- Métricas de rendimiento
- Análisis de evolución
- Insights de IA

### ⚙️ **Configuración**
- Ajustes de la aplicación
- Preferencias de entrenamiento
- Configuración de IA

## 🎥 Corrección por Video IA

### Ejercicios Soportados:
- **Sentadilla**: Detección de rodillas valgo, profundidad, postura
- **Press de Banca**: Simetría de brazos, ángulo de codos, trayectoria
- **Peso Muerto**: Alineación de espalda, posición de barra, extensión

### Métricas Analizadas:
- Ángulos articulares en tiempo real
- Tempo concéntrico/excéntrico
- Rango de movimiento
- Simetría bilateral
- Precisión general del movimiento

## 🔒 Seguridad y Privacidad

- **API Keys protegidas**: Nunca se suben al repositorio
- **Datos locales**: Información personal almacenada localmente
- **Conexión segura**: Todas las comunicaciones con OpenAI son encriptadas
- **Sin tracking**: No se recopilan datos de usuario sin consentimiento

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Sergio M** - [GitHub](https://github.com/Sergiom84)

## 🙏 Agradecimientos

- OpenAI por la API de GPT-4o
- Google por MediaPipe
- Radix UI por los componentes
- Lucide por los iconos

## 📞 Soporte

Si tienes problemas o preguntas:
1. Revisa la [documentación](#)
2. Busca en [Issues](https://github.com/Sergiom84/MindFit/issues)
3. Crea un nuevo issue si es necesario

---

⭐ **¡Dale una estrella al proyecto si te gusta!** ⭐
