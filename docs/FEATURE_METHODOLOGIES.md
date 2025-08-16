# FEATURE — Metodologías de Entrenamiento

## 1) Descripción general
Sistema de selección y gestión de metodologías de entrenamiento que permite al usuario elegir su enfoque preferido y generar planes personalizados basados en su perfil y objetivos.

## 2) Componente principal
**Archivo**: `src/components/MethodologiesScreen.jsx`
**Ruta**: `/methodologies`

### 2.1 Funcionalidades
- Visualización de metodologías disponibles
- Selección de metodología activa (exclusión mutua)
- Navegación automática a `/routines` tras selección
- Cancelación automática de metodología anterior

## 3) Tipos de metodologías disponibles

### 3.1 Hipertrofia
- **Objetivo**: Crecimiento muscular
- **Características**: 8-12 repeticiones, descansos medios
- **Duración**: 6-12 semanas
- **Frecuencia**: 4-6 días/semana

### 3.2 Fuerza
- **Objetivo**: Incremento de fuerza máxima
- **Características**: 1-6 repeticiones, descansos largos
- **Duración**: 4-8 semanas
- **Frecuencia**: 3-4 días/semana

### 3.3 HIIT (Alta Intensidad)
- **Objetivo**: Mejora cardiovascular y quema grasa
- **Características**: Intervalos intensos, descansos cortos
- **Duración**: 4-6 semanas
- **Frecuencia**: 3-4 días/semana

### 3.4 Híbrido (Strength-Hybrid)
- **Objetivo**: Combinación fuerza + hipertrofia
- **Características**: Periodización mixta
- **Duración**: 8-12 semanas
- **Frecuencia**: 4-5 días/semana

### 3.5 Resistencia
- **Objetivo**: Mejora capacidad aeróbica
- **Características**: Alto volumen, intensidad moderada
- **Duración**: 6-10 semanas
- **Frecuencia**: 5-6 días/semana

### 3.6 Funcional
- **Objetivo**: Movimientos prácticos del día a día
- **Características**: Patrones multiplanares, core integrado
- **Duración**: Indefinida/continua
- **Frecuencia**: 3-5 días/semana

## 4) API Backend
**Endpoint**: `/api/methodologies`
**Archivo**: `backend/routes/methodologies.js`

### 4.1 Endpoints disponibles

#### POST `/api/methodologies`
Crear nueva metodología seleccionada (cancela la anterior automáticamente)

**Request**:
```json
{
  "user_id": "<uuid>",
  "methodology_name": "Hipertrofia|Fuerza|HIIT|Híbrido|Resistencia|Funcional",
  "methodology_description": "Descripción del enfoque",
  "methodology_icon": "nombre-icono",
  "methodology_version": "1.0",
  "selection_mode": "manual|ai",
  "program_duration": 8,
  "difficulty_level": "beginner|intermediate|advanced",
  "fecha_inicio": "2025-01-01",
  "fecha_fin": "2025-03-01",
  "methodology_data": {
    "dias": [...],
    "parametros": {...}
  }
}
```

#### GET `/api/methodologies/active`
Obtener metodología activa del usuario

**Response**:
```json
{
  "success": true,
  "methodology": {
    "id": "<uuid>",
    "methodology_name": "Hipertrofia",
    "methodology_data": {...},
    "estado": "activo",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

## 5) Estructura de datos

### 5.1 Tabla: `user_selected_methodologies`
```sql
CREATE TABLE user_selected_methodologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  methodology_name TEXT NOT NULL,
  methodology_description TEXT,
  methodology_icon TEXT,
  methodology_version TEXT DEFAULT '1.0',
  selection_mode TEXT DEFAULT 'manual',
  program_duration INTEGER,
  difficulty_level TEXT,
  fecha_inicio DATE,
  fecha_fin DATE,
  methodology_data JSONB,
  ai_recommendation_data JSONB,
  estado TEXT DEFAULT 'activo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP
);
```

### 5.2 Campo `methodology_data` (JSONB)
```json
{
  "dias": [
    {
      "dia": 1,
      "nombre": "Pecho y Tríceps",
      "grupos_musculares": ["pecho", "triceps"],
      "ejercicios": [
        {
          "nombre": "Press de banca",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90s"
        }
      ]
    }
  ],
  "parametros": {
    "intensidad": "alta",
    "volumen": "moderado",
    "frecuencia_semanal": 4
  }
}
```

## 6) Flujos de usuario

### 6.1 Selección de metodología
1. Usuario accede a `/methodologies`
2. Visualiza tarjetas con metodologías disponibles
3. Selecciona una metodología
4. Confirmación → POST `/api/methodologies`
5. Navegación automática a `/routines`

### 6.2 Cambio de metodología
1. Usuario selecciona nueva metodología
2. Sistema cancela automáticamente la anterior
3. Crea nueva metodología activa
4. Actualiza estado en `UserContext`

## 7) Estados y validaciones

### 7.1 Estados posibles
- `activo`: metodología actualmente seleccionada
- `cancelado`: metodología reemplazada por otra
- `completado`: metodología finalizada por tiempo

### 7.2 Validaciones críticas
- **Perfil completo**: verificar datos mínimos antes de selección
- **Una activa**: solo una metodología activa por usuario
- **Coherencia temporal**: fechas inicio/fin lógicas
- **Nivel apropiado**: metodología acorde a experiencia usuario

## 8) Integración con otros módulos

### 8.1 Con Rutinas (`/routines`)
- Metodología activa determina tipo de entrenamientos generados
- Sin metodología → redirección desde `/routines`

### 8.2 Con IA Adaptativa
- Metodología influye en generación de planes personalizados
- Historial usado para recomendaciones futuras

### 8.3 Con UserContext
- Estado de metodología activa disponible globalmente
- Actualización automática tras cambios

## 9) UI/UX Considerations

### 9.1 Diseño visual
- Cards con iconos representativos
- Estado seleccionado claramente visible
- Información clave: duración, frecuencia, dificultad

### 9.2 Feedback al usuario
- Loading states durante selección
- Confirmación de cambio exitoso
- Warning si cambia metodología en progreso

### 9.3 Accesibilidad
- Navegación por teclado
- Aria-labels descriptivos
- Contraste adecuado en estados
