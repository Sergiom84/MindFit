# FEATURE — Rutinas de Entrenamiento

## 1) Descripción general
Sistema de generación y visualización de rutinas de entrenamiento personalizadas, basado en la metodología activa del usuario, su perfil completo y restricciones por lesiones.

## 2) Componente principal
**Archivo**: `src/components/RoutinesScreen.jsx`
**Ruta**: `/routines`

### 2.1 Dependencias críticas
- **Metodología activa**: debe existir en `user_selected_methodologies`
- **Perfil completo**: datos mínimos en `UserContext`
- **Lesiones activas**: consulta a `/api/injuries`

## 3) Flujo de generación de rutinas

### 3.1 Validaciones previas
1. **Verificar metodología activa**
   - Si no existe → redirección a `/methodologies`
2. **Verificar perfil completo**
   - Campos críticos: edad, peso, altura, nivel, objetivos
   - Si incompleto → redirección a `/profile`
3. **Consultar lesiones activas**
   - GET `/api/injuries` para restricciones

### 3.2 Proceso de generación
1. **Preparar payload** desde `UserContext` + lesiones
2. **Llamada a IA Adaptativa**: POST `/api/ia-adaptativa`
3. **Procesar respuesta** y mostrar rutinas generadas
4. **Opción de guardar** rutina como favorita

## 4) Estructura del payload IA Adaptativa

### 4.1 Request a `/api/ia-adaptativa`
```json
{
  "userId": "<uuid>",
  "profile": {
    "age": 35,
    "sex": "M|F",
    "heightCm": 178,
    "weightKg": 82,
    "level": "beginner|intermediate|advanced",
    "experienceYears": 3,
    "methodology": "hipertrofia|fuerza|hiit|hibrido|resistencia|funcional",
    "homeEquipment": ["adjustable-dumbbells", "pullup-bar", "bands"],
    "availability": {
      "daysPerWeek": 4,
      "minutesPerSession": 60
    },
    "goals": ["fat-loss", "strength", "muscle-gain"],
    "nutrition": {
      "diet": "mediterranean|vegetarian|keto|flexible",
      "allergies": ["lactose", "gluten"]
    }
  },
  "injuries": [
    {
      "area": "knee|shoulder|back|wrist|ankle",
      "constraint": "avoid-deep-squat|no-overhead|low-impact"
    }
  ],
  "preferences": {
    "intensityPreference": "low|moderate|high",
    "focusAreas": ["upper-body", "core", "legs"],
    "avoidExercises": ["burpees", "jumping"]
  }
}
```

### 4.2 Response estructura
```json
{
  "success": true,
  "plan": {
    "programName": "Plan Hipertrofia Personalizado",
    "duration": "8 semanas",
    "frequency": "4 días/semana",
    "workouts": [
      {
        "day": 1,
        "name": "Tren Superior - Push",
        "duration": 60,
        "exercises": [
          {
            "name": "Press banca mancuernas",
            "sets": 4,
            "reps": "8-10",
            "rest": "90s",
            "notes": "Adaptado por lesión de hombro",
            "equipment": ["dumbbells"],
            "muscleGroups": ["chest", "triceps"],
            "difficulty": "intermediate"
          }
        ],
        "warmup": [...],
        "cooldown": [...]
      }
    ],
    "progressionNotes": "Incrementar peso 2.5kg cada 2 semanas",
    "adaptations": [
      "Ejercicios modificados por lesión de rodilla",
      "Intensidad ajustada al nivel intermedio"
    ]
  },
  "message": "Rutina generada exitosamente"
}
```

## 5) Patrones de rutinas por metodología

### 5.1 Hipertrofia
- **Estructura**: 4-6 días, divisiones por grupos musculares
- **Series**: 3-4 por ejercicio
- **Repeticiones**: 8-12
- **Descansos**: 60-90 segundos
- **Volumen**: Alto

### 5.2 Fuerza
- **Estructura**: 3-4 días, movimientos compuestos
- **Series**: 4-6 por ejercicio
- **Repeticiones**: 1-6
- **Descansos**: 2-5 minutos
- **Intensidad**: Muy alta

### 5.3 HIIT
- **Estructura**: 3-4 días, circuitos
- **Trabajo**: 20-45 segundos
- **Descanso**: 10-60 segundos
- **Rounds**: 3-6 por circuito
- **Enfoque**: Cardiovascular + metabólico

### 5.4 Híbrido
- **Estructura**: 4-5 días, periodización
- **Variación**: Alterna fuerza e hipertrofia
- **Flexibilidad**: Adaptable según progreso
- **Balance**: Fuerza + volumen

## 6) Adaptaciones por lesiones

### 6.1 Lesiones de rodilla
- **Evitar**: Sentadillas profundas, saltos, estocadas
- **Sustituir**: Extensiones, leg press, ejercicios sentado
- **Modificar**: Rango de movimiento reducido

### 6.2 Lesiones de hombro
- **Evitar**: Press militar, elevaciones laterales altas
- **Sustituir**: Press con mancuernas, movimientos neutros
- **Modificar**: Ángulos seguros, rotación externa

### 6.3 Lesiones de espalda baja
- **Evitar**: Peso muerto convencional, remo con barra
- **Sustituir**: Hip thrust, remo con apoyo
- **Modificar**: Posición neutral, core activado

## 7) Estados del componente

### 7.1 Estados locales
```jsx
const [isGenerating, setIsGenerating] = useState(false)
const [generatedPlan, setGeneratedPlan] = useState(null)
const [error, setError] = useState(null)
const [selectedWorkout, setSelectedWorkout] = useState(null)
```

### 7.2 Estados de carga
- **Initial**: Cargando metodología y perfil
- **Generating**: Generando rutinas con IA
- **Success**: Rutinas generadas exitosamente
- **Error**: Error en generación o validación

## 8) Funcionalidades adicionales

### 8.1 Visualización de rutinas
- **Lista expandible**: días de entrenamiento
- **Detalles por ejercicio**: sets, reps, descansos
- **Notas de adaptación**: modificaciones por lesiones
- **Media**: imágenes/videos de ejercicios (futuro)

### 8.2 Interacciones del usuario
- **Marcar completado**: tracking de sesiones
- **Modificar ejercicio**: sustituir si es necesario
- **Guardar favorito**: rutinas personalizadas
- **Generar nueva**: nueva llamada a IA

### 8.3 Persistencia
- **Rutina actual**: localStorage para sesión activa
- **Historial**: base de datos de rutinas generadas
- **Progreso**: tracking de entrenamientos completados

## 9) Integración con otros módulos

### 9.1 Con Metodologías
- Rutinas basadas en metodología activa
- Cambio de metodología → regeneración necesaria

### 9.2 Con Lesiones
- Consulta automática antes de generar
- Actualización dinámica si cambian lesiones

### 9.3 Con Progreso
- Historial de entrenamientos completados
- Métricas de adherencia al plan

### 9.4 Con Home Training
- Adaptación a equipamiento disponible en casa
- Integración con planes domésticos

## 10) Manejo de errores

### 10.1 Errores comunes
- **Sin metodología**: redirección + mensaje explicativo
- **Perfil incompleto**: redirección + campos faltantes
- **Error de IA**: mensaje + opción de reintentar
- **Sin conexión**: modo offline con rutinas básicas

### 10.2 Fallbacks
- **Patrones predefinidos**: por metodología si falla IA
- **Rutinas básicas**: sin personalización como último recurso
- **Ejercicios genéricos**: si no hay adaptación específica

## 11) Optimizaciones de rendimiento

### 11.1 Caché
- **Rutinas recientes**: evitar regeneración innecesaria
- **Perfiles estáticos**: datos que no cambian frecuentemente
- **Patrones base**: templates por metodología

### 11.2 Loading states
- **Skeleton screens**: mientras carga contenido
- **Progress indicators**: durante generación IA
- **Lazy loading**: contenido no crítico diferido
