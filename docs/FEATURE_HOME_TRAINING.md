# FEATURE — Entrenamiento en casa (Selección + Generación)

## 1) UI / patrón
- Patrón: **Radio Card Group** (exclusión mutua) en dos grupos:
  - **Equipamiento**: `minimo` | `basico` | `avanzado`
  - **Estilo**: `funcional` | `hiit` | `fuerza`
- Componente: usar `Card` de `src/components/ui/` o Tailwind + estado "seleccionado".

## 2) Enumeraciones
```ts
type Equipment = "minimo" | "basico" | "avanzado";
type Style = "funcional" | "hiit" | "fuerza";
```

## 3) Componente principal
**Archivo**: `src/components/HomeTrainingScreen.jsx`

### 3.1 Estado local
- `selectedEquipment: Equipment | null`
- `selectedStyle: Style | null`
- `isGenerating: boolean`

### 3.2 Flujo de generación
1. **Validación**: ambos campos seleccionados + perfil completo
2. **Request**: POST `/api/home-training/create-program`
3. **Payload**:
```json
{
  "userId": "<uuid>",
  "titulo": "Plan {style} - {equipment}",
  "equipamiento": "minimo|basico|avanzado",
  "tipoEntrenamiento": "funcional|hiit|fuerza",
  "duracionTotal": 60,
  "frecuencia": 4,
  "enfoque": "home-workout"
}
```

## 4) API Backend
**Endpoint**: `/api/home-training/create-program`
**Archivo**: `backend/routes/homeTraining.js`

### 4.1 Lógica
1. Validar campos requeridos
2. Consultar perfil usuario y lesiones activas
3. Generar ejercicios adaptados al equipamiento
4. Crear programa en tabla `home_training_programs`
5. Retornar programa completo

### 4.2 Tablas DB
- `home_training_programs`: programas creados
- `home_training_exercises`: ejercicios del programa
- `home_training_sessions`: sesiones completadas

## 5) Equipamiento y ejercicios

### 5.1 Equipamiento mínimo
- Peso corporal únicamente
- Ejercicios: flexiones, sentadillas, plancha, burpees

### 5.2 Equipamiento básico
- Mancuernas ajustables o fijas
- Barra de dominadas (opcional)
- Esterilla de ejercicio

### 5.3 Equipamiento avanzado
- Mancuernas + barra
- Bandas de resistencia
- TRX o sistema de suspensión
- Kettlebells

## 6) Estilos de entrenamiento

### 6.1 Funcional
- Movimientos compuestos
- Énfasis en patrones de movimiento
- Integración core en cada ejercicio

### 6.2 HIIT
- Intervalos de alta intensidad
- Descansos estructurados
- Ejercicios explosivos y cardio

### 6.3 Fuerza
- Progresión de cargas
- Repeticiones controladas
- Enfoque en grandes grupos musculares

## 7) Validaciones críticas
- **Perfil completo**: edad, peso, altura, nivel de experiencia
- **Lesiones activas**: consultar `/api/injuries` antes de generar
- **Espacio disponible**: considerar limitaciones de espacio doméstico
- **Material verificado**: confirmar disponibilidad real del equipamiento

## 8) Estados de error comunes
- **Sin selección**: mostrar mensaje "Selecciona equipamiento y estilo"
- **Perfil incompleto**: redirigir a `/profile` con toast explicativo
- **Sin conexión**: modo offline con entrenamientos preestablecidos
- **Error API**: fallback a patrones locales básicos

## 9) Integración con otros módulos
- **Lesiones**: exclusión automática de ejercicios contraindicados
- **Progreso**: tracking de sesiones completadas
- **IA Adaptativa**: personalización basada en rendimiento histórico
