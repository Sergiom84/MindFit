// src/components/MethodologiesScreen.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Contextos (desde src con alias @)
import { useAuth } from '@/contexts/AuthContext'
import { useUserContext } from '@/contexts/UserContext'

// Handlers independientes para metodologías
import { useAutomaticAIHandler, useManualMethodologyHandler } from '@/components/methodology'

// UI (con .jsx para mantener consistencia)
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'

// Iconos
import {
  Loader2,
  Brain,
  User as UserIcon,
  Settings,
  CheckCircle,
  AlertCircle,
  Zap,
  Trophy,
  Dumbbell,
  Activity,
  Target,
  Home,
  User,
  Play
} from 'lucide-react'

// Convierte strings numéricos a números y deja el resto igual
const NUMBER_KEYS = [
  'edad', 'peso_kg', 'altura_cm', 'grasa_corporal', 'masa_muscular', 'agua_corporal', 'metabolismo_basal',
  'cintura', 'pecho', 'brazos', 'muslos', 'cuello', 'antebrazos',
  'comidas_diarias', 'frecuencia_semanal', 'años_entrenando', 'meta_peso', 'meta_grasa'
]

function sanitizeProfile (p) {
  const out = { ...p }
  NUMBER_KEYS.forEach((k) => {
    if (out[k] != null && typeof out[k] === 'string' && out[k].trim() !== '') {
      const n = Number(out[k])
      if (!Number.isNaN(n)) out[k] = n
    }
  })
  return out
}

const METHODOLOGIES = [
  {
    name: 'Heavy Duty',
    description: 'Entrenamiento de alta intensidad con bajo volumen y máximo descanso',
    detailedDescription: 'Metodología desarrollada por Mike Mentzer que revolucionó el entrenamiento con pesas. Se basa en entrenamientos breves pero extremadamente intensos, seguidos de períodos de descanso prolongados para permitir la supercompensación muscular completa.',
    focus: 'Intensidad máxima',
    level: 'Intermedio-Avanzado',
    homeCompatible: true,
    icon: Zap,
    programDuration: '6-8 semanas',
    frequency: '2-3 días/semana',
    volume: 'Muy bajo',
    intensity: 'Muy alta',
    principles: [
      'Intensidad máxima en cada serie hasta el fallo muscular',
      'Descansos de 4-7 días entre entrenamientos del mismo grupo muscular',
      'Pocas series por grupo muscular (1-2 series efectivas)',
      'Progresión lenta pero constante en cargas',
      'Enfoque en ejercicios compuestos básicos'
    ],
    benefits: [
      'Máximo estímulo de crecimiento con mínimo volumen de entrenamiento',
      'Ideal para personas con poca disponibilidad de tiempo',
      'Previene el sobreentrenamiento y el burnout',
      'Permite recuperación completa entre sesiones',
      'Desarrolla fuerza mental y concentración extrema'
    ],
    targetAudience: 'Intermedios y avanzados con buena técnica y experiencia en fallo muscular',
    duration: '45-60 minutos por sesión',
    scientificBasis: 'Basado en la teoría de supercompensación, adaptación específica y el principio de sobrecarga progresiva de Arthur Jones',
    videoPlaceholder: true
  },
  {
    name: 'Powerlifting',
    description: 'Enfoque en los tres levantamientos básicos: sentadilla, press banca y peso muerto',
    detailedDescription: 'Deporte de fuerza que se centra en maximizar la carga en tres movimientos fundamentales. Combina entrenamiento técnico específico con desarrollo de fuerza absoluta, utilizando periodización avanzada para alcanzar picos de rendimiento.',
    focus: 'Fuerza máxima',
    level: 'Intermedio-Competición',
    homeCompatible: false,
    icon: Trophy,
    programDuration: '12-16 semanas',
    frequency: '4-6 días/semana',
    volume: 'Alto',
    intensity: 'Alta',
    principles: [
      'Especificidad absoluta en sentadilla, press banca y peso muerto',
      'Periodización lineal o ondulante según objetivos',
      'Técnica perfecta como prioridad número uno',
      'Trabajo de accesorios específico para debilidades',
      'Progresión gradual y medible en cada ciclo'
    ],
    benefits: [
      'Desarrollo de fuerza funcional máxima en patrones básicos',
      'Mejora significativa de la densidad ósea y conectiva',
      'Desarrollo de disciplina mental y concentración extrema',
      'Base sólida de fuerza para cualquier otro deporte',
      'Comunidad competitiva y objetivos medibles claros'
    ],
    targetAudience: 'Intermedios a avanzados con acceso a gimnasio completo y experiencia en levantamientos básicos',
    duration: '90-120 minutos por sesión',
    scientificBasis: 'Principios de especificidad, sobrecarga progresiva, adaptaciones neuromusculares y periodización del entrenamiento',
    videoPlaceholder: true
  },
  {
    name: 'Hipertrofia',
    description: 'Entrenamiento orientado al crecimiento muscular con volumen moderado-alto',
    detailedDescription: 'Metodología científicamente respaldada para maximizar el crecimiento muscular. Combina tensión mecánica, estrés metabólico y daño muscular controlado para estimular la síntesis proteica y el desarrollo de masa muscular magra.',
    focus: 'Volumen muscular',
    level: 'Principiante-Avanzado',
    homeCompatible: true,
    icon: Dumbbell,
    programDuration: '8-12 semanas',
    frequency: '4-5 días/semana',
    volume: 'Moderado-Alto',
    intensity: 'Moderada-Alta',
    principles: [
      'Volumen de entrenamiento optimizado (10-20 series por grupo muscular/semana)',
      'Rango de repeticiones 6-20 con énfasis en 8-15',
      'Tensión mecánica sostenida y tiempo bajo tensión controlado',
      'Frecuencia de 2-3 veces por semana por grupo muscular',
      'Progresión en volumen, intensidad o densidad'
    ],
    benefits: [
      'Aumento significativo y visible de masa muscular',
      'Mejora del metabolismo basal y composición corporal',
      'Fortalecimiento de articulaciones y tejido conectivo',
      'Mejor definición muscular y simetría corporal',
      'Aumento de la autoestima y confianza personal'
    ],
    targetAudience: 'Desde principiantes hasta avanzados que buscan maximizar el crecimiento muscular',
    duration: '60-90 minutos por sesión',
    scientificBasis: 'Basado en investigación sobre síntesis proteica muscular, mTOR, tensión mecánica y adaptaciones metabólicas',
    videoPlaceholder: true
  },
  {
    name: 'Funcional',
    description: 'Movimientos naturales y ejercicios que mejoran la funcionalidad diaria',
    detailedDescription: 'Entrenamiento basado en patrones de movimiento que replican actividades de la vida cotidiana. Integra múltiples grupos musculares trabajando en diferentes planos de movimiento para mejorar la coordinación, estabilidad y transferencia al rendimiento diario.',
    focus: 'Funcionalidad',
    level: 'Principiante-Intermedio',
    homeCompatible: true,
    icon: Activity,
    programDuration: '6-10 semanas',
    frequency: '3-4 días/semana',
    volume: 'Moderado',
    intensity: 'Moderada',
    principles: [
      'Movimientos multiplanares (sagital, frontal, transversal)',
      'Integración de cadenas musculares completas',
      'Desarrollo simultáneo de estabilidad y movilidad',
      'Transferencia directa a actividades de la vida diaria',
      'Progresión desde estabilidad a movilidad dinámica'
    ],
    benefits: [
      'Mejora significativa de coordinación y propiocepción',
      'Prevención efectiva de lesiones cotidianas',
      'Mayor eficiencia en movimientos diarios',
      'Desarrollo de equilibrio y estabilidad core',
      'Rehabilitación y corrección de desequilibrios musculares'
    ],
    targetAudience: 'Ideal para principiantes, personas en rehabilitación y atletas buscando transferencia',
    duration: '45-75 minutos por sesión',
    scientificBasis: 'Basado en principios de biomecánica, control motor, cadenas cinéticas y neuroplasticidad',
    videoPlaceholder: true
  },
  {
    name: 'Oposiciones',
    description: 'Preparación física específica para pruebas de oposiciones',
    detailedDescription: 'Programa especializado diseñado para superar las pruebas físicas de oposiciones (policía, bomberos, militar, etc.). Combina resistencia cardiovascular, fuerza funcional y agilidad específica según los requerimientos de cada convocatoria.',
    focus: 'Acondicionamiento específico',
    level: 'Principiante-Intermedio',
    homeCompatible: true,
    icon: Target,
    programDuration: '8-16 semanas',
    frequency: '4-5 días/semana',
    volume: 'Alto',
    intensity: 'Moderada-Alta',
    principles: [
      'Especificidad según pruebas de la oposición',
      'Periodización hacia fecha de examen',
      'Combinación de resistencia y fuerza funcional',
      'Simulacros de pruebas reales',
      'Progresión gradual y sostenible'
    ],
    benefits: [
      'Preparación específica para superar baremos oficiales',
      'Mejora integral de capacidades físicas requeridas',
      'Desarrollo de resistencia mental bajo presión',
      'Optimización del rendimiento en fecha clave',
      'Reducción del riesgo de lesiones durante pruebas'
    ],
    targetAudience: 'Opositores de cuerpos de seguridad, bomberos, militar y similares',
    duration: '60-90 minutos por sesión',
    scientificBasis: 'Entrenamiento específico, periodización deportiva y adaptaciones cardiorrespiratorias',
    videoPlaceholder: true
  },
  {
    name: 'CrossFit',
    description: 'Entrenamiento funcional de alta intensidad con movimientos variados',
    detailedDescription: 'Metodología que combina levantamiento olímpico, gimnasia y acondicionamiento metabólico. Busca desarrollar las 10 capacidades físicas generales a través de movimientos funcionales ejecutados a alta intensidad y constantemente variados.',
    focus: 'Condición física general',
    level: 'Intermedio-Avanzado',
    homeCompatible: false,
    icon: Target,
    programDuration: '8-12 semanas',
    frequency: '3-5 días/semana',
    volume: 'Alto',
    intensity: 'Alta',
    principles: [
      'Movimientos funcionales constantemente variados',
      'Alta intensidad relativa adaptada al individuo',
      'Escalabilidad universal para todos los niveles',
      'Comunidad y competición como motivación',
      'Medición y registro constante del progreso'
    ],
    benefits: [
      'Desarrollo completo de las 10 capacidades físicas',
      'Mejora dramática de la composición corporal',
      'Versatilidad atlética y preparación física general',
      'Motivación grupal y sentido de comunidad',
      'Transferencia a actividades deportivas y cotidianas'
    ],
    targetAudience: 'Intermedios a avanzados con buena base técnica y capacidad de aprendizaje motor',
    duration: '60-75 minutos por sesión',
    scientificBasis: 'Adaptaciones metabólicas mixtas, transferencia atlética y principios de entrenamiento concurrente',
    videoPlaceholder: true
  },
  {
    name: 'Calistenia',
    description: 'Entrenamiento con peso corporal enfocado en control y fuerza relativa',
    detailedDescription: 'Arte del movimiento corporal que desarrolla fuerza, flexibilidad y control motor usando únicamente el peso del cuerpo. Progresa desde movimientos básicos hasta habilidades avanzadas como muscle-ups, handstands y human flags.',
    focus: 'Fuerza relativa',
    level: 'Principiante-Avanzado',
    homeCompatible: true,
    icon: User,
    programDuration: '10-16 semanas',
    frequency: '4-6 días/semana',
    volume: 'Moderado-Alto',
    intensity: 'Moderada-Alta',
    principles: [
      'Progresión gradual con peso corporal únicamente',
      'Desarrollo de control motor y propiocepción avanzada',
      'Integración de movimientos artísticos y funcionales',
      'Fuerza funcional relativa al peso corporal',
      'Paciencia y consistencia en la progresión'
    ],
    benefits: [
      'Desarrollo de fuerza relativa excepcional',
      'Control corporal y coordinación avanzada',
      'Mejora significativa de flexibilidad y movilidad',
      'Entrenamiento accesible sin necesidad de equipamiento',
      'Desarrollo de habilidades impresionantes y motivadoras'
    ],
    targetAudience: 'Desde principiantes hasta avanzados con paciencia para progresión gradual',
    duration: '45-90 minutos por sesión',
    scientificBasis: 'Adaptaciones neuromusculares, control motor, plasticidad neural y biomecánica corporal',
    videoPlaceholder: true
  },
  {
    name: 'Entrenamiento en Casa',
    description: 'Rutinas adaptadas para entrenar en casa con equipamiento mínimo',
    detailedDescription: 'Programa versátil diseñado para maximizar resultados con equipamiento básico del hogar. Combina peso corporal, bandas elásticas y objetos domésticos para crear rutinas efectivas adaptadas a cualquier espacio y horario.',
    focus: 'Adaptabilidad',
    level: 'Principiante-Intermedio',
    homeCompatible: true,
    icon: Home,
    programDuration: '4-8 semanas',
    frequency: '3-5 días/semana',
    volume: 'Moderado',
    intensity: 'Moderada',
    principles: [
      'Máximo resultado con equipamiento mínimo disponible',
      'Adaptación creativa al espacio y recursos disponibles',
      'Progresión con resistencia variable y peso corporal',
      'Flexibilidad horaria total sin dependencias externas',
      'Sostenibilidad a largo plazo desde casa'
    ],
    benefits: [
      'Conveniencia total y accesibilidad las 24 horas',
      'Ahorro significativo de tiempo y dinero en gimnasios',
      'Privacidad completa y comodidad del hogar',
      'Flexibilidad de horarios adaptada a tu rutina',
      'Eliminación de excusas y barreras para entrenar'
    ],
    targetAudience: 'Ideal para todos los niveles sin acceso a gimnasio o con limitaciones de tiempo',
    duration: '30-60 minutos por sesión',
    scientificBasis: 'Adaptaciones musculares con resistencia progresiva variable, entrenamiento funcional y biomecánica adaptativa',
    videoPlaceholder: true,
    isNew: true
  }
]

export default function MethodologiesScreen () {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const { userData, activarIAAdaptativa, isLoading: contextLoading, setMetodologiaActiva } = useUserContext()

  // UI state
  const [selectionMode, setSelectionMode] = useState('automatico') // 'automatico' | 'manual'
  const [error, setError] = useState(null)

  // UI state para detalles y modal de éxito (DECLARAR PRIMERO)
  const [showDetails, setShowDetails] = useState(false)
  const [detailsMethod, setDetailsMethod] = useState(null)
  const [successData, setSuccessData] = useState(null)

  // Handlers independientes para cada modo (DESPUÉS de setSuccessData)
  const automaticHandler = useAutomaticAIHandler(currentUser, activarIAAdaptativa, setSuccessData, setError)
  const manualHandler = useManualMethodologyHandler(currentUser, activarIAAdaptativa, setSuccessData, setError)

  // Usar el loading del contexto o de los handlers
  const isLoading = contextLoading || automaticHandler.iaLoading || manualHandler.iaLoading

  const handleOpenDetails = (m) => {
    setDetailsMethod(m)
    setShowDetails(true)
  }

  // --- REEMPLAZA COMPLETO handleCloseSuccessDialog ---
  const handleCloseSuccessDialog = () => {
    if (successData) {
      const today = new Date()
      const toYMD = (d) => d.toISOString().split('T')[0]
      const fechaInicio = toYMD(today)
      const fechaFin = toYMD(new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000)))

      // La IA puede venir como successData.respuestaIA o successData.data?.respuestaIA
      const ai = successData?.respuestaIA || successData?.data?.respuestaIA || {}

      const metodologiaSeleccionada =
        ai?.metodologiaSeleccionada ||
        successData?.metodologia ||
        successData?.modo ||
        'IA Adaptativa'

      // Construye los días normalizados
      const dias = generateWeeklyRoutineFromIA(ai, today)

      const metodologiaData = {
        methodology_name: metodologiaSeleccionada,
        methodology_data: { dias },
        fechaInicio,
        fechaFin,
        generadaPorIA: true,
        respuestaCompleta: successData
      }

      // 👇 Esta función, tras el Bloque 1, guarda "plano" en el contexto
      setMetodologiaActiva(metodologiaData, fechaInicio, fechaFin)
    }

    setSuccessData(null)
    navigate('/routines')
  }

  // --- REEMPLAZA COMPLETO generateWeeklyRoutineFromIA ---
  const generateWeeklyRoutineFromIA = (respuestaIA, startDate) => {
    const toYMD = (d) => d.toISOString().split('T')[0]

    // Pequeño normalizador de ejercicios (por si IA usa otras claves)
    const normalizeExercises = (list) => {
      const src = Array.isArray(list) ? list : []
      return src.map((ex) => {
        const nombre = ex.nombre || ex.name || ex.ejercicio || 'Ejercicio'
        const series = ex.series != null ? ex.series : ex.sets != null ? ex.sets : 3
        const repeticiones = ex.repeticiones || ex.reps || ex.repetitions || '10-12'
        const descanso = ex.descanso || ex.rest || '60-90 seg'
        const peso = ex.peso || ex.weight || 'corporal'
        return { nombre, series, repeticiones, descanso, peso }
      })
    }

    // Si la IA ya devolvió una rutina estructurada
    if (respuestaIA?.rutinaSemanal && Array.isArray(respuestaIA.rutinaSemanal)) {
      return respuestaIA.rutinaSemanal.map((dia, index) => {
        const nombreSesion =
          dia.nombre_sesion || dia.nombreSesion || dia.titulo || `Sesión ${index + 1}`
        const ejercicios = normalizeExercises(dia.ejercicios || dia.exercises)

        return {
          dia: index + 1,
          fecha: toYMD(new Date(startDate.getTime() + (index * 24 * 60 * 60 * 1000))),
          nombre_sesion: nombreSesion,
          ejercicios
        }
      })
    }

    // Si la IA NO trajo rutina diaria, generamos una básica
    const dias = []
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    const metodologia =
      respuestaIA?.metodologiaSeleccionada ||
      respuestaIA?.ajustesRecomendados?.metodologia ||
      'Hipertrofia'

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000))
      const dayName = dayNames[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1]
      const isRestDay = i > 0 && (i === 2 || i === 4 || i === 6) // Descanso: Mié, Vie, Dom

      if (isRestDay) {
        dias.push({
          dia: i + 1,
          fecha: toYMD(currentDate),
          nombre_sesion: `Descanso - ${dayName}`,
          ejercicios: []
        })
      } else {
        const ejercicios = generateExercisesFromIA(respuestaIA, i + 1, metodologia)
        dias.push({
          dia: i + 1,
          fecha: toYMD(currentDate),
          nombre_sesion: `${metodologia} - ${dayName}`,
          ejercicios
        })
      }
    }

    return dias
  }

  // Función para generar ejercicios basados en recomendaciones de IA
  const generateExercisesFromIA = (respuestaIA, dayNumber, metodologia) => {
    // Ejercicios específicos por metodología
    const exercisesByMethodology = {
      'Heavy Duty': [
        { nombre: 'Calentamiento', series: 1, repeticiones: '10 min', peso: 'corporal', descanso: '2-3 min' },
        { nombre: 'Sentadilla', series: 1, repeticiones: '6-8', peso: 'máximo', descanso: '3-5 min' },
        { nombre: 'Press Banca', series: 1, repeticiones: '6-8', peso: 'máximo', descanso: '3-5 min' },
        { nombre: 'Peso Muerto', series: 1, repeticiones: '6-8', peso: 'máximo', descanso: '3-5 min' }
      ],
      'Powerlifting': [
        { nombre: 'Calentamiento específico', series: 1, repeticiones: '15 min', peso: 'progresivo', descanso: '2 min' },
        { nombre: 'Sentadilla', series: 5, repeticiones: '3-5', peso: '85-95% 1RM', descanso: '3-5 min' },
        { nombre: 'Press Banca', series: 5, repeticiones: '3-5', peso: '85-95% 1RM', descanso: '3-5 min' },
        { nombre: 'Peso Muerto', series: 3, repeticiones: '1-3', peso: '90-100% 1RM', descanso: '5 min' }
      ],
      'Hipertrofia': [
        { nombre: 'Calentamiento', series: 1, repeticiones: '10 min', peso: 'ligero', descanso: '1 min' },
        { nombre: 'Press Banca', series: 4, repeticiones: '8-12', peso: '70-80% 1RM', descanso: '60-90 seg' },
        { nombre: 'Remo con Barra', series: 4, repeticiones: '8-12', peso: '70-80% 1RM', descanso: '60-90 seg' },
        { nombre: 'Press Militar', series: 3, repeticiones: '10-15', peso: '60-70% 1RM', descanso: '60 seg' },
        { nombre: 'Curl Bíceps', series: 3, repeticiones: '12-15', peso: 'moderado', descanso: '45 seg' }
      ],
      'Calistenia': [
        { nombre: 'Movilidad articular', series: 1, repeticiones: '10 min', peso: 'corporal', descanso: '30 seg' },
        { nombre: 'Flexiones', series: 4, repeticiones: '8-15', peso: 'corporal', descanso: '60 seg' },
        { nombre: 'Dominadas', series: 4, repeticiones: '5-12', peso: 'corporal', descanso: '90 seg' },
        { nombre: 'Sentadillas', series: 4, repeticiones: '15-25', peso: 'corporal', descanso: '60 seg' },
        { nombre: 'Plancha', series: 3, repeticiones: '30-60 seg', peso: 'corporal', descanso: '60 seg' }
      ],
      'Funcional': [
        { nombre: 'Calentamiento dinámico', series: 1, repeticiones: '10 min', peso: 'corporal', descanso: '30 seg' },
        { nombre: 'Burpees', series: 4, repeticiones: '8-12', peso: 'corporal', descanso: '60 seg' },
        { nombre: 'Kettlebell Swing', series: 4, repeticiones: '15-20', peso: 'moderado', descanso: '60 seg' },
        { nombre: 'Mountain Climbers', series: 3, repeticiones: '20-30', peso: 'corporal', descanso: '45 seg' },
        { nombre: 'Farmer Walk', series: 3, repeticiones: '30-60 seg', peso: 'pesado', descanso: '90 seg' }
      ]
    }

    // Usar ejercicios específicos de la metodología o ejercicios por defecto
    let baseExercises = exercisesByMethodology[metodologia] || exercisesByMethodology['Hipertrofia']

    // Ajustar según las recomendaciones de volumen e intensidad
    if (respuestaIA?.ajustesRecomendados) {
      const ajustes = respuestaIA.ajustesRecomendados

      if (ajustes.volumenEntrenamiento === 'aumentar') {
        baseExercises = [...baseExercises, {
          nombre: 'Ejercicio adicional',
          series: 2,
          repeticiones: '12-15',
          peso: 'moderado',
          descanso: '60 seg'
        }]
      }

      if (ajustes.intensidad === 'aumentar') {
        baseExercises = baseExercises.map(ex => ({
          ...ex,
          repeticiones: ex.nombre.includes('Calentamiento') ? ex.repeticiones : '6-8 (alta intensidad)',
          descanso: ex.nombre.includes('Calentamiento') ? ex.descanso : '2-3 min'
        }))
      }
    }

    return baseExercises
  }

  return (
    <div className="p-6 bg-black text-white min-h-screen pt-20 pb-24">
      <h1 className="text-3xl font-bold text-yellow-400 mb-2">Metodologías de Entrenamiento</h1>
      <p className="text-gray-400 mb-6">
        {/* Texto actualizado */}
        Automático (IA) o Manual (IA pero eligiendo que metodología realizar)
      </p>

      {/* Errores */}
      {error && (
        <Alert className="mb-6 bg-red-900/30 border-red-400/40">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <AlertDescription className="text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Selección de modo (tarjetas clicables con borde iluminado) */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-8">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="mr-2 text-yellow-400" />
            Modo de selección
          </CardTitle>
          <CardDescription className="text-gray-400">
            Automático (IA) o Manual (IA pero eligiendo que metodología realizar)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Automático */}
            <div
              onClick={() => setSelectionMode('automatico')}
              className={`p-4 rounded-lg transition-all bg-gray-950 cursor-pointer
                ${selectionMode === 'automatico'
                  ? 'border border-yellow-400 ring-2 ring-yellow-400/30'
                  : 'border border-yellow-400/20 hover:border-yellow-400/40'}`}
            >
              <div className="flex items-start gap-3">
                <RadioGroup value={selectionMode} onValueChange={setSelectionMode}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="automatico" id="automatico" />
                    <Label htmlFor="automatico" className="text-white font-semibold flex items-center gap-2">
                      <Brain className="w-4 h-4 text-yellow-400" />
                      Automático (Recomendado)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-gray-400 text-sm mt-2">La IA elige la mejor metodología para tu perfil.</p>
              {selectionMode === 'automatico' && (
                <div className="mt-4">
                  <Button
                    onClick={automaticHandler.handleActivateAutomaticIA}
                    disabled={isLoading}
                    className="bg-yellow-400 text-black hover:bg-yellow-300"
                  >
                    <Zap className={`w-4 h-4 mr-2 ${isLoading ? 'animate-pulse' : ''}`} />
                    {isLoading ? 'Procesando…' : 'Activar IA'}
                  </Button>
                </div>
              )}
            </div>

            {/* Manual (tú eliges) */}
            <div
              onClick={() => setSelectionMode('manual')}
              className={`p-4 rounded-lg transition-all cursor-pointer bg-gray-950
                ${selectionMode === 'manual'
                  ? 'border border-yellow-400 ring-2 ring-yellow-400/30'
                  : 'border border-yellow-400/20 hover:border-yellow-400/40'}`}
              title="Pulsa para activar el modo manual y luego elige una metodología"
            >
              <div className="flex items-start gap-3">
                <RadioGroup value={selectionMode} onValueChange={setSelectionMode}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="manual" id="manual" />
                    <Label htmlFor="manual" className="text-white font-semibold flex items-center gap-2">
                      <UserIcon className="w-4 h-4 text-yellow-400" />
                      Manual (tú eliges)
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              <p className="text-gray-400 text-sm mt-2">
                Selecciona una metodología y la IA creará tu plan con esa base.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grid de metodologías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METHODOLOGIES.map((m) => {
          const Icon = m.icon
          const manualActive = selectionMode === 'manual'
          return (
            <Card
              key={m.name}
              className={`bg-gray-900/90 border-gray-700 transition-all duration-300
                ${manualActive ? 'cursor-pointer hover:border-yellow-400/60 hover:scale-[1.01]' : 'hover:border-gray-600'}
              `}
              onClick={() => manualActive && manualHandler.handleManualCardClick(m)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {Icon && <Icon className="w-7 h-7 text-yellow-400" />}
                    <CardTitle className="text-white text-xl">{m.name}</CardTitle>
                  </div>
                  <span className="text-xs px-2 py-1 border border-gray-600 text-gray-300 rounded">
                    {m.level}
                  </span>
                </div>
                <CardDescription className="text-gray-400 mt-2">{m.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frecuencia:</span>
                  <span className="text-white">{m.frequency}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Volumen:</span>
                  <span className="text-white">{m.volume}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Intensidad:</span>
                  <span className="text-white">{m.intensity}</span>
                </div>

                {/* Botones: Ver Detalles / Seleccionar */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenDetails(m)
                    }}
                  >
                    Ver Detalles
                  </Button>

                  <Button
                    disabled={!manualActive}
                    className={`flex-1 ${manualActive ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (manualActive) manualHandler.handleManualCardClick(m)
                    }}
                  >
                    Seleccionar Metodología
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Loader (IA) */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-yellow-400/30 rounded-lg p-8 text-center shadow-xl">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-white font-semibold text-lg">La IA está generando tu entrenamiento</p>
            <p className="text-gray-400 text-sm mt-2">Analizando tu perfil para crear la rutina idónea…</p>
          </div>
        </div>
      )}

      {/* Modal de selección manual */}
      <Dialog open={manualHandler.showManualSelectionModal} onOpenChange={manualHandler.cancelManualSelection}>
        <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-md bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-yellow-400" />
              Confirmar selección
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Has elegido <span className="font-semibold text-white">{manualHandler.pendingMethodology?.name}</span>. ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>

          {manualHandler.pendingMethodology && (
            <div className="mt-2 text-sm grid grid-cols-2 gap-2">
              <p><span className="text-gray-400">Nivel:</span> {manualHandler.pendingMethodology.level}</p>
              <p><span className="text-gray-400">Frecuencia:</span> {manualHandler.pendingMethodology.frequency}</p>
              <p><span className="text-gray-400">Volumen:</span> {manualHandler.pendingMethodology.volume}</p>
              <p><span className="text-gray-400">Intensidad:</span> {manualHandler.pendingMethodology.intensity}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={manualHandler.cancelManualSelection}>Cancelar</Button>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300" onClick={manualHandler.confirmManualSelection}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar selección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles Mejorado */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl md:max-w-4xl bg-gray-900 border-yellow-400/20 text-white max-h-[calc(100vh-1rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center">
              {detailsMethod?.icon && React.createElement(detailsMethod.icon, { className: 'w-6 h-6 mr-3 text-yellow-400' })}
              {detailsMethod?.name || 'Detalles'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Información completa de la metodología seleccionada.
            </DialogDescription>
          </DialogHeader>

          {detailsMethod && (
            <div className="space-y-6">
              {/* Descripción detallada */}
              {detailsMethod.detailedDescription && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-2">Descripción Completa</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {detailsMethod.detailedDescription}
                  </p>
                </div>
              )}

              {/* Video placeholder */}
              {detailsMethod.videoPlaceholder && (
                <div className="p-6 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 text-center">
                  <Play className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">Video Explicativo</h4>
                  <p className="text-gray-400 text-sm">
                    Próximamente: Video detallado sobre la metodología {detailsMethod.name}
                  </p>
                </div>
              )}

              <Tabs defaultValue="principles" className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                  <TabsTrigger value="principles" className="text-xs">Principios</TabsTrigger>
                  <TabsTrigger value="benefits" className="text-xs">Beneficios</TabsTrigger>
                  <TabsTrigger value="target" className="text-xs">Dirigido a</TabsTrigger>
                  <TabsTrigger value="science" className="text-xs">Ciencia</TabsTrigger>
                </TabsList>

                <TabsContent value="principles" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Principios Fundamentales</h4>
                  <ul className="space-y-1">
                    {detailsMethod.principles?.map((principle, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        {principle}
                      </li>
                    )) || <li className="text-gray-400 text-sm">No hay principios disponibles</li>}
                  </ul>
                </TabsContent>

                <TabsContent value="benefits" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Beneficios Principales</h4>
                  <ul className="space-y-1">
                    {detailsMethod.benefits?.map((benefit, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {benefit}
                      </li>
                    )) || <li className="text-gray-400 text-sm">No hay beneficios disponibles</li>}
                  </ul>
                </TabsContent>

                <TabsContent value="target" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Público Objetivo</h4>
                  <p className="text-gray-300 text-sm">{detailsMethod.targetAudience || 'No especificado'}</p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-gray-400 text-xs">Duración por sesión:</span>
                      <p className="text-white text-sm">{detailsMethod.duration || 'No especificado'}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Duración del programa:</span>
                      <p className="text-white text-sm">{detailsMethod.programDuration}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Frecuencia:</span>
                      <p className="text-white text-sm">{detailsMethod.frequency}</p>
                    </div>
                    <div>
                      <span className="text-gray-400 text-xs">Compatible con casa:</span>
                      <p className="text-white text-sm">{detailsMethod.homeCompatible ? 'Sí' : 'No'}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="science" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Base Científica</h4>
                  <p className="text-gray-300 text-sm">{detailsMethod.scientificBasis || 'No especificado'}</p>
                </TabsContent>
              </Tabs>
            </div>
          )}

          <DialogFooter className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs rounded">
                {detailsMethod?.focus || 'General'}
              </span>
              <span className="px-2 py-1 bg-blue-400/20 text-blue-400 text-xs rounded">
                {detailsMethod?.level || 'Todos los niveles'}
              </span>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setShowDetails(false)}>Cerrar</Button>
              <Button
                className={`${
                  selectionMode === 'manual'
                    ? 'bg-yellow-400 text-black hover:bg-yellow-300'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
                disabled={selectionMode !== 'manual'}
                onClick={() => {
                  if (selectionMode === 'manual' && detailsMethod) {
                    setShowDetails(false)
                    manualHandler.handleManualCardClick(detailsMethod)
                  }
                }}
              >
                Seleccionar Metodología
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- POPUP: Cargando IA --- */}
      <Dialog open={isLoading}>
        <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-sm bg-gray-900 border-yellow-400/20">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-yellow-400 animate-spin" />
            <DialogTitle className="text-yellow-400">La IA está comprobando tu perfil…</DialogTitle>
          </div>
          <DialogDescription className="text-gray-300 mt-2">
            Preparando tu mejor entrenamiento para hoy según tu equipamiento y nivel.
          </DialogDescription>
        </DialogContent>
      </Dialog>

      {/* --- POPUP: Resumen IA --- */}
      {successData?.respuestaIA && (
        <Dialog
          open={!!successData}
          onOpenChange={(open) => { if (!open) handleCloseSuccessDialog() }}
        >
          <DialogContent className="w-full max-w-[calc(100vw-1rem)] sm:max-w-xl bg-gray-900 border-yellow-400/20">
            <DialogHeader>
              <DialogTitle className="text-yellow-400 flex items-center gap-2">
                <Brain className="w-4 h-4 text-yellow-400" />
                Recomendación de la IA
              </DialogTitle>
              <DialogDescription className="text-gray-300">
                Análisis basado en tu perfil actual
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-400">Metodología seleccionada</p>
                <p className="text-white font-semibold">
                  {successData.respuestaIA.metodologiaSeleccionada || successData.metodologia || '—'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-gray-400">Estado metabólico</p>
                  <p className="text-white">{successData.respuestaIA.estadoMetabolico || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Recuperación neural</p>
                  <p className="text-white">{successData.respuestaIA.recuperacionNeural || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Eficiencia adaptativa</p>
                  <p className="text-white">{successData.respuestaIA.eficienciaAdaptativa || '—'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Próxima revisión</p>
                  <p className="text-white">{successData.respuestaIA.proximaRevision || '—'}</p>
                </div>
              </div>

              <div>
                <p className="text-gray-400">Recomendación</p>
                <p className="text-white">
                  {successData.respuestaIA.recomendacionIA || '—'}
                </p>
              </div>
            </div>

            <DialogFooter className="mt-4">
              <Button
                onClick={handleCloseSuccessDialog}
                className="bg-yellow-400 text-black hover:bg-yellow-300"
              >
                Usar esta metodología
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
