// src/components/MethodologiesScreen.jsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Contextos (desde src con alias @)
import { useAuth } from '@/contexts/AuthContext'
import { useUserContext } from '@/contexts/UserContext'

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
  const { userData, activarIAAdaptativa, isLoading: contextLoading } = useUserContext()

  // UI state
  const [selectionMode, setSelectionMode] = useState('automatico') // 'automatico' | 'manual'
  const [error, setError] = useState(null)

  // Usar el loading del contexto
  const isLoading = contextLoading

  // Manual selection / details
  const [showManualSelectionModal, setShowManualSelectionModal] = useState(false)
  const [pendingMethodology, setPendingMethodology] = useState(null)

  const [showDetails, setShowDetails] = useState(false)
  const [detailsMethod, setDetailsMethod] = useState(null)

  // Success dialog with DB row from backend
  const [successData, setSuccessData] = useState(null)

  // --- Activar IA (automático o forzado) ---
  const handleActivateIA = async (forcedMethodology = null) => {
    if (!selectionMode) {
      setError('Selecciona un modo de adaptación')
      return
    }

    setError(null)

    try {
      // Usar la función del contexto que ya está bien implementada
      const result = await activarIAAdaptativa(selectionMode)

      if (result.success) {
        setSuccessData(result.data)   // Guardar todo el objeto de respuesta
      } else {
        setError(result.error || 'Error al activar IA adaptativa')
      }
    } catch (e) {
      console.error('[handleActivateIA]', e)
      setError(e.message)
    }
  }

  // --- Flujo manual ---
  const handleManualCardClick = (methodology) => {
    if (selectionMode === 'manual') {
      setPendingMethodology(methodology)
      setShowManualSelectionModal(true)
    }
  }

  const confirmManualSelection = () => {
    if (pendingMethodology) {
      handleActivateIA(pendingMethodology.name)
      setShowManualSelectionModal(false)
      setPendingMethodology(null)
    }
  }

  const handleOpenDetails = (m) => {
    setDetailsMethod(m)
    setShowDetails(true)
  }

  const handleCloseSuccessDialog = () => {
    setSuccessData(null)
    navigate('/routines')
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
                    onClick={() => handleActivateIA(null)}
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
              onClick={() => manualActive && handleManualCardClick(m)}
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
                      if (manualActive) handleManualCardClick(m)
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
      <Dialog open={showManualSelectionModal} onOpenChange={setShowManualSelectionModal}>
        <DialogContent className="max-w-md bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-yellow-400" />
              Confirmar selección
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Has elegido <span className="font-semibold text-white">{pendingMethodology?.name}</span>. ¿Deseas continuar?
            </DialogDescription>
          </DialogHeader>

          {pendingMethodology && (
            <div className="mt-2 text-sm grid grid-cols-2 gap-2">
              <p><span className="text-gray-400">Nivel:</span> {pendingMethodology.level}</p>
              <p><span className="text-gray-400">Frecuencia:</span> {pendingMethodology.frequency}</p>
              <p><span className="text-gray-400">Volumen:</span> {pendingMethodology.volume}</p>
              <p><span className="text-gray-400">Intensidad:</span> {pendingMethodology.intensity}</p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManualSelectionModal(false)}>Cancelar</Button>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300" onClick={confirmManualSelection}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar selección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles Mejorado */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl bg-gray-900 border-yellow-400/20 text-white max-h-[90vh] overflow-y-auto">
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
                    handleManualCardClick(detailsMethod)
                  }
                }}
              >
                Seleccionar Metodología
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de éxito (respuesta de /api/ia/recommend-and-generate) */}
      <Dialog open={!!successData} onOpenChange={(open) => { if (!open) handleCloseSuccessDialog() }}>
        <DialogContent className="max-w-lg bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center">
              <Brain className="w-5 h-5 mr-2 text-yellow-400" />
              ¡Rutina generada!
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Hemos guardado tu metodología activa y su rutina semanal.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-400">Metodología:</span>{' '}
              <span className="text-white font-semibold">{successData?.metodologia || successData?.modo || '—'}</span>
            </p>
            <p className="text-gray-300">
              {successData?.respuestaIA?.recomendacionIA || 'Rutina generada exitosamente'}
            </p>

            {/* Mostrar información adicional de la IA */}
            {successData?.respuestaIA && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                <h4 className="text-yellow-400 font-semibold mb-2">Análisis de IA:</h4>
                <div className="space-y-1 text-xs">
                  <p><span className="text-gray-400">Estado Metabólico:</span> {successData.respuestaIA.estadoMetabolico}</p>
                  <p><span className="text-gray-400">Recuperación Neural:</span> {successData.respuestaIA.recuperacionNeural}</p>
                  <p><span className="text-gray-400">Eficiencia Adaptativa:</span> {successData.respuestaIA.eficienciaAdaptativa}</p>
                  <p><span className="text-gray-400">Próxima Revisión:</span> {successData.respuestaIA.proximaRevision}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="mt-2">
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300" onClick={handleCloseSuccessDialog}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Ir a Rutinas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
