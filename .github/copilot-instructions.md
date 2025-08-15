# MindFit — Instrucciones para GitHub Copilot (Repositorio)

## 0) Autoridad y referencias
- **Arquitectura**: `ARCHITECTURE.md` (autoridad sobre capas, flujos y módulos).
- **Decisiones**: `DECISIONS.md` (reglas vigentes).
- **Glosario** (resumen): 
  - *Entrenamiento en casa*: planificación semanal adaptada a perfil + material doméstico.
  - *Metodología*: enfoque preferido (p. ej., fuerza, HIIT, Híbrido, etc.).
  - *Lesiones activas*: restricciones que excluyen ejercicios concretos.
  - *Perfil mínimo*: ver sección 5.1.
> Cuando respondas, **cita** los archivos que usaste de estas referencias.

## 1) Contexto del proyecto
- **SPA**: React 19 + Vite 6. UI: Radix UI + Tailwind. Animaciones: Framer Motion. Formularios: RHF + Zod. Gráficas: Recharts. Iconos: Lucide.
- **Rutas frontend**: `/`, `/profile`, `/methodologies`, `/routines`, `/nutrition`, `/injuries`, `/progress`, `/settings`, `/ai-adaptive`, `/home-training`, `/video-correction`, `/openai-test`.
- **Backend**: Node/Express monolito (sirve SPA en prod). **PostgreSQL**. API bajo `/api/*` (auth, ia, iaAdaptativa, injuries, methodologies, music, pose, etc.).
- **Auth**: email/contraseña (bcrypt). **Sin** JWT/sesión persistente (estado en el cliente).
- **Objetivo clave**: “Generar mi entrenamiento” debe usar perfil + lesiones + preferencias y llamar **solo** a endpoints backend.

## 2) Estándares de código (obligatorios)
- **React**: solo componentes funcionales y hooks; `useEffect/useMemo/useCallback` con dependencias correctas.
- **Estado**: respeta `AuthContext.jsx` y `UserContext.jsx`. No dupliques estado.
- **Estilo**: utilidades Tailwind; reutiliza `src/components/ui/*`.
- **Accesibilidad**: preferir Radix; añade `aria-*` cuando aplique.
- **Validación**: RHF + Zod en formularios; no aceptes datos sin validar.
- **Nomenclatura**: `PascalCase.jsx` (componentes), `kebab-case.js` (utils). Evita archivos > ~300 líneas si puede dividirse.

## 3) Límites y seguridad (NO HACER)
- No tocar **migraciones** en `database_migrations/`, ni **scripts de despliegue** en `scripts/` o `backend/scripts/`.
- No modificar `.env*` ni exponer secretos (usar placeholders tipo `OPENAI_API_KEY`).
- No introducir JWT/OAuth ni cambios de esquema SQL salvo instrucción explícita.
- No reescribir archivos completos si basta con un bloque (preferir **diff mínimo**).

## 4) Forma de entrega
- Responde con **diff unificado** por archivo (formato patch), **limitado al alcance**.
- Si afecta front y back: usa commits separados `feat(frontend): ...` / `feat(backend): ...`.
- Incluye una nota corta de “por qué” y riesgos.
- Mantén **commits atómicos** y mensajes **conventional commits**.

## 5) IA de entrenamiento (reglas claras)
### 5.1 Campos mínimos del perfil (requeridos)
- edad, peso, altura, sexo, experiencia (años), **nivel** (inic/inter/avanzado),
- objetivos (p. ej., recomposición, fuerza), **metodología preferida**,
- medidas corporales (si hay), **lesiones activas** (tipo y limitación),
- **material disponible en casa**, disponibilidad semanal (días/tiempo),
- preferencias de alimentación y restricciones (para coherencia kcal/macros).
> Si falta alguno **crítico** (altura, nivel, material, lesiones), solicitar completar `InitialProfileForm` y **no** generar plan.

### 5.2 Flujo obligatorio (cliente → backend)
1. Leer `UserContext` (perfil, preferencias, objetivos).
2. Consultar `/api/injuries` para obtener **lesiones activas**.
3. Construir payload y **POST** a `/api/ia-adaptativa`.
4. Renderizar resultado en `RoutinesScreen`; guardar recomendación si aplica.

### 5.3 Contratos de API (estables)
**POST** `/api/ia-adaptativa`  
_Request_ (ejemplo):
```json
{
  "userId": "<uuid>",
  "profile": {
    "age": 35, "sex": "M", "heightCm": 178, "weightKg": 82,
    "level": "intermediate", "experienceYears": 3,
    "methodology": "strength-hybrid",
    "homeEquipment": ["adjustable-dumbbells","pullup-bar","bands"],
    "availability": {"daysPerWeek": 4, "minutesPerSession": 60},
    "goals": ["fat-loss","strength"],
    "nutrition": {"diet": "mediterranean", "allergies": ["lactose"]}
  },
  "injuries": [
    {"area": "knee", "constraint": "avoid-deep-squat"}
  ]
}
