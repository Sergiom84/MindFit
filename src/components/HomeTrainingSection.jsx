import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpaceEvaluationModal from './SpaceEvaluationModal'
import WorkoutExerciseModal from './WorkoutExerciseModal'
import IAHomeTraining from '@/components/IAHomeTraining'
import { useUserContext } from '@/contexts/UserContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Dumbbell,
  Target,
  Clock,
  CheckCircle,
  Play,
  Calendar,
  TrendingUp,
  Home
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

// 🔗 Constantes centralizadas
import {
  EQUIPMENT,
  STYLE,
  EQUIPMENT_LABELS,
  STYLE_GUIDELINES
} from '@/lib/home-training-consts'

// Helper para formatear tiempo
function toHm (totalSec = 0) {
  const s = Math.max(0, Number(totalSec) || 0)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

// Evita crashear si el servidor responde 304/204 o body vacío
async function safeJson (res) {
  if (res.status === 304 || res.status === 204) return null
  const text = await res.text()
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

// Parsear listas de ejercicios de forma segura
function parseExercises (content) {
  try {
    return JSON.parse(content || '[]')
  } catch {
    return []
  }
}

const HomeTrainingSection = () => {
  // Props para IAHomeTraining (mantén tu contrato actual)
  const [equipamiento, setEquipamiento] = useState('minimo') // 'minimo' | 'basico' | 'avanzado'
  const [tipo, setTipo] = useState('funcional') // 'funcional' | 'hiit' | 'fuerza'

  // UI local (tu patrón actual)
  const [showIAPlan, setShowIAPlan] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState('minimal') // minimal|basic|advanced (UI)
  const [selectedTrainingType, setSelectedTrainingType] = useState('functional') // functional|hiit|strength (UI)

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [activeProgram, setActiveProgram] = useState(null)
  const [weeklyCalendar, setWeeklyCalendar] = useState([])

  // Estado para estadísticas del API
  const [stats, setStats] = React.useState({
    sessions_completed: 0,
    total_duration_sec: 0,
    streak_days: 0,
    nivel_actual: 'principiante'
  })
  const [statsLoading, setStatsLoading] = React.useState(false)

  const { entrenamientoCasa, userData } = useUserContext()
  const { getCurrentUserInfo } = useAuth()
  const user = getCurrentUserInfo()

  // Movemos la lógica de carga a una función que podamos llamar cuando queramos
  const loadStats = React.useCallback(async () => {
    if (!user?.id) return
    try {
      setStatsLoading(true)
      const r = await fetch(`/api/home-training/stats?userId=${user.id}`)
      const j = await r.json()
      if (j?.success && j?.data) setStats(j.data)
    } catch (e) {
      console.error("Error cargando estadísticas:", e)
    } finally {
      setStatsLoading(false)
    }
  }, [user?.id])

  // useEffect para cargar estadísticas del API la primera vez
  React.useEffect(() => {
    loadStats()
  }, [loadStats])

  // 👤 Perfil mínimo requerido (usa tu naming actual)
  const edad = userData?.edad
  const altura = userData?.altura
  const peso = userData?.peso

  const hasMinProfile = useMemo(() => {
    // acepta 0 como falsy -> exigimos valores reales > 0
    const okEdad = Number(edad) > 0
    const okAltura = Number(altura) > 0
    const okPeso = Number(peso) > 0
    return okEdad && okAltura && okPeso
  }, [edad, altura, peso])

  const isGenerateDisabled =
    !hasMinProfile ||
    !selectedEquipment ||
    !selectedTrainingType

  // Campos que faltan para guiar al usuario
  const missingFields = useMemo(() => {
    const m = []
    if (!(Number(edad) > 0)) m.push('edad')
    if (!(Number(altura) > 0)) m.push('altura')
    if (!(Number(peso) > 0)) m.push('peso')
    if (!selectedEquipment) m.push('equipamiento (mínimo/básico/avanzado)')
    if (!selectedTrainingType) m.push('tipo de entrenamiento (funcional/HIIT/fuerza)')
    return m
  }, [edad, altura, peso, selectedEquipment, selectedTrainingType])

  // Determinar equipamiento inicial basado en el usuario (tu lógica, adaptando a keys UI)
  useEffect(() => {
    if (entrenamientoCasa?.equipoDisponible?.length) {
      const equipoUsuario = entrenamientoCasa.equipoDisponible.join(' ').toLowerCase()
      if (equipoUsuario.includes('barra') || equipoUsuario.includes('rack') || equipoUsuario.includes('kettlebell')) {
        setSelectedEquipment('advanced')
        setEquipamiento(EQUIPMENT.AVANZADO) // para IA
      } else if (equipoUsuario.includes('mancuernas') || equipoUsuario.includes('banda')) {
        setSelectedEquipment('basic')
        setEquipamiento(EQUIPMENT.BASICO)
      } else {
        setSelectedEquipment('minimal')
        setEquipamiento(EQUIPMENT.MINIMO)
      }
    }
  }, [entrenamientoCasa?.equipoDisponible])

  // 👉 desactiva efectos cuando showIAPlan = true
  useEffect(() => {
    if (showIAPlan) return
    if (!userData?.id) return

    loadActiveProgram(userData.id)
  }, [showIAPlan, userData?.id])

  const loadActiveProgram = async (userId) => {
    try {
      const response = await fetch(`/api/home-training/active-program/${userId}`)
      const data = await safeJson(response)
      if (data && data.success && data.program) {
        setActiveProgram(data.program)
        generateWeeklyCalendar(data.program)
      }
    } catch (error) {
      console.error('Error cargando programa activo:', error)
    }
  }

  const generateWeeklyCalendar = (program) => {
    const safeProgram = program || {}
    const safeDias = Array.isArray(safeProgram.dias) ? safeProgram.dias : []

    if (safeDias.length > 0) {
      const calendar = safeDias.map(day => {
        const exercises = parseExercises(day.ejercicios_asignados)
        const exerciseCount = exercises.length
        return {
          id: day.dia_semana.toLowerCase(),
          dayName: day.dia_semana.charAt(0).toUpperCase() + day.dia_semana.slice(1),
          dayNumber: new Date(day.fecha).getDate(),
          date: day.fecha,
          isToday: new Date(day.fecha).toDateString() === new Date().toDateString(),
          exercises,
          exerciseCount: day.es_descanso ? 0 : exerciseCount,
          completed: day.ejercicios_completados,
          total: day.es_descanso ? 0 : exerciseCount,
          status: day.es_descanso ? 'rest' : day.estado,
          isRest: day.es_descanso
        }
      })
      setWeeklyCalendar(calendar)
    } else if (generatedWorkout) {
      generateMockWeeklyCalendar()
    }
  }

  const generateMockWeeklyCalendar = () => {
    const today = new Date()
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
    const dayIds = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

    const calendar = dayNames.map((dayName, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - today.getDay() + 1 + index) // Lunes + index

      const isToday = date.toDateString() === today.toDateString()
      const isRest = index === 6 // Domingo descanso
      const isPast = date < today && !isToday
      const isFuture = date > today

      let status = 'pendiente'
      let completed = 0
      let total = generatedWorkout?.ejercicios?.length || 5

      if (isRest) {
        status = 'rest'
        total = 0
      } else if (isPast) {
        status = Math.random() > 0.3 ? 'completado' : 'perdido'
        completed = status === 'completado' ? total : Math.floor(total * 0.6)
      } else if (isToday) {
        status = 'en_progreso'
        completed = Math.floor(total * 0.3)
      }

      return {
        id: dayIds[index],
        dayName,
        dayNumber: date.getDate(),
        date: date.toISOString().split('T')[0],
        isToday,
        exercises: isRest ? [] : Array.from({ length: total }, (_, i) => i + 1),
        exerciseCount: isRest ? 0 : total,
        completed,
        total,
        status,
        isRest
      }
    })

    setWeeklyCalendar(calendar)
  }

  const calculateMockProgress = () => {
    if (weeklyCalendar.length === 0) return 0
    const completedDays = weeklyCalendar.filter(day => day.status === 'completado').length
    const totalWorkoutDays = weeklyCalendar.filter(day => !day.isRest).length
    return totalWorkoutDays > 0 ? Math.round((completedDays / totalWorkoutDays) * 100) : 0
  }

  // 🧭 UI: definición de niveles (apoyándonos en EQUIPMENT_LABELS)
  const equipmentLevels = {
    minimal: {
      name: 'Equipamiento Mínimo',
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
      equipment: EQUIPMENT_LABELS[EQUIPMENT.MINIMO],
      workouts: ['Flexiones variadas', 'Sentadillas', 'Plancha', 'Burpees'],
      color: 'border-green-400'
    },
    basic: {
      name: 'Equipamiento Básico',
      icon: <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />,
      equipment: EQUIPMENT_LABELS[EQUIPMENT.BASICO],
      workouts: ['Press de pecho', 'Remo con banda', 'Peso muerto', 'Curl bíceps'],
      color: 'border-yellow-400'
    },
    advanced: {
      name: 'Equipamiento Avanzado',
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
      equipment: EQUIPMENT_LABELS[EQUIPMENT.AVANZADO],
      workouts: ['Dominadas', 'Swing kettlebell', 'Sentadilla goblet', 'Turkish get-up'],
      color: 'border-red-400'
    }
  }

  // 🔁 Render
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent" style={{ fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)' }}>
            Entrenamiento en Casa
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Modalidad multifuncional diseñada para maximizar resultados con el equipamiento
            que tengas disponible, adaptándose a tu espacio y nivel.
          </p>
        </div>

        {/* Selector de Equipamiento */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {Object.entries(equipmentLevels).map(([key, level]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                selectedEquipment === key
                  ? `${level.color} bg-yellow-400/5`
                  : 'border-gray-600 hover:border-yellow-400/50'
              }`}
              onClick={() => {
                setSelectedEquipment(key)
                // Mapea a valores del contrato IA
                if (key === 'minimal') setEquipamiento(EQUIPMENT.MINIMO)
                else if (key === 'basic') setEquipamiento(EQUIPMENT.BASICO)
                else if (key === 'advanced') setEquipamiento(EQUIPMENT.AVANZADO)
              }}
            >
              <CardHeader>
                <div className="flex items-center space-x-2">
                  {level.icon}
                  <CardTitle className="text-white text-lg">{level.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Equipamiento:</h4>
                    <div className="flex flex-wrap gap-1">
                      {level.equipment.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Ejercicios ejemplo:</h4>
                    <ul className="text-xs text-gray-400 space-y-1">
                      {level.workouts.slice(0, 3).map((workout, idx) => (
                        <li key={idx} className="flex items-center space-x-1">
                          <CheckCircle className="w-3 h-3 text-green-400" />
                          <span>{workout}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Estilos de Entrenamiento */}
        <Tabs
          value={selectedTrainingType}
          onValueChange={(value) => {
            setSelectedTrainingType(value)
            // Mapea UI -> contrato IA
            if (value === 'functional') setTipo(STYLE.FUNCIONAL)
            else if (value === 'hiit') setTipo(STYLE.HIIT)
            else if (value === 'strength') setTipo(STYLE.FUERZA)
          }}
          className="mb-8"
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="functional">Funcional</TabsTrigger>
            <TabsTrigger value="hiit">HIIT</TabsTrigger>
            <TabsTrigger value="strength">Fuerza</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Guías del estilo elegido */}
        {tipo && (
          <section className="mt-6">
            <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
              <h4 className="text-white font-semibold mb-3">Guías para {tipo.toUpperCase()}</h4>
              <ul className="list-disc pl-6 space-y-1 text-sm text-gray-300">
                {STYLE_GUIDELINES[tipo]?.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* Botón para Generar Entrenamiento con IA */}
        <div className="text-center my-8">
          <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              Generar Entrenamiento Personalizado
            </h3>
            <p className="text-gray-400 mb-6">
              Basado en tu equipamiento: <span className="text-yellow-400 font-semibold">
                {selectedEquipment === 'minimal'
                  ? 'Equipamiento Mínimo'
                  : selectedEquipment === 'basic' ? 'Equipamiento Básico' : 'Equipamiento Avanzado'}
              </span> y tipo de entrenamiento: <span className="text-yellow-400 font-semibold">
                {selectedTrainingType === 'functional'
                  ? 'Funcional'
                  : selectedTrainingType === 'hiit' ? 'HIIT' : 'Fuerza'}
              </span>
            </p>
            <Button
              disabled={isGenerateDisabled}
              onClick={() => setShowIAPlan(true)}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Target className="w-5 h-5 mr-2" />
              Generar Mi Entrenamiento
            </Button>
            {isGenerateDisabled && (
              <div className="mt-4">
                <Alert className="border-red-400/40 bg-red-500/10">
                  <AlertTitle className="text-red-300">Faltan datos para generar tu plan</AlertTitle>
                  <AlertDescription className="text-red-200/90">
                    Para entregar la tabla de entrenamiento, completa:{' '}
                    <span className="font-medium">
                      {missingFields.join(', ')}
                    </span>.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </div>

        {/* Render condicional */}
        {showIAPlan ? (
          <IAHomeTraining
            key={`${equipamiento}-${tipo}`}
            equipamiento={equipamiento}
            tipo={tipo}
            autoStart
            onSessionComplete={loadStats} // <-- ¡LA MAGIA! Pasamos la función para refrescar
          />
        ) : (
          // Dejas tu contenido de selección / cards / etc.
          generatedWorkout && (
            <Card className="bg-gray-900 border-yellow-400/20 mb-8">
              <CardHeader>
                <CardTitle className="text-white text-xl">
                  {generatedWorkout.titulo || 'Entrenamiento Personalizado'}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {generatedWorkout.descripcion || 'Entrenamiento adaptado a tu equipamiento'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* Información del entrenamiento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{generatedWorkout.duracionTotal || '30-45 min'}</div>
                    <div className="text-gray-400 text-sm">Duración</div>
                  </div>
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Calendar className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{generatedWorkout.frecuencia || '4-5 días/semana'}</div>
                    <div className="text-gray-400 text-sm">Frecuencia</div>
                  </div>
                  <div className="text-center bg-gray-800 rounded-lg p-4">
                    <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <div className="text-white font-semibold">{generatedWorkout.enfoque || 'Fuerza funcional y movilidad'}</div>
                    <div className="text-gray-400 text-sm">Enfoque</div>
                  </div>
                </div>

                {/* Lista de ejercicios */}
                <div className="mb-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center">
                    <Play className="w-5 h-5 mr-2 text-green-400" />
                    Ejercicios Principales:
                  </h3>
                  <div className="space-y-3">
                    {generatedWorkout.ejercicios?.map((ejercicio, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
                            {idx + 1}
                          </div>
                          <div>
                            <h4 className="text-white font-semibold">{ejercicio.nombre}</h4>
                            <p className="text-gray-400 text-sm">
                              {ejercicio.series} series × {ejercicio.tipo === 'tiempo' ? `${ejercicio.duracion}s` : `${ejercicio.repeticiones} reps`}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                          {ejercicio.descanso}s descanso
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => {
                        if (generatedWorkout?.ejercicios?.length) {
                          setCurrentExerciseIndex(0)
                          setIsExerciseModalOpen(true)
                        }
                      }}
                      className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Comenzar Entrenamiento
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Estadísticas / Info (sin cambios estructurales) */}
        <Card className="bg-gray-900 border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
              Tu Progreso en Casa - {userData?.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">
                  {statsLoading ? '…' : stats.sessions_completed}
                </div>
                <div className="text-sm text-gray-400">Rutinas Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {statsLoading ? '…' : toHm(stats.total_duration_sec)}
                </div>
                <div className="text-sm text-gray-400">Tiempo Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {statsLoading ? '…' : (stats.nivel_actual?.charAt(0).toUpperCase() + stats.nivel_actual?.slice(1))}
                </div>
                <div className="text-sm text-gray-400">Nivel Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">
                  {statsLoading ? '…' : `${stats.streak_days} ${stats.streak_days === 1 ? 'día' : 'días'}`}
                </div>
                <div className="text-sm text-gray-400">Racha Actual</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Tu Espacio de Entrenamiento:</h4>
                <p className="text-gray-300 text-sm">{entrenamientoCasa?.espacioDisponible || 'No especificado'}</p>
              </div>
            </div>

            {entrenamientoCasa?.ejerciciosFavoritos?.length > 0 && (
              <div className="mt-4">
                <h4 className="text-white font-semibold mb-2">Tus Ejercicios Favoritos:</h4>
                <div className="flex flex-wrap gap-2">
                  {entrenamientoCasa.ejerciciosFavoritos.map((ejercicio, idx) => (
                    <Badge key={idx} className="bg-yellow-400/20 text-yellow-400">
                      {ejercicio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <Button
            onClick={() => setIsEvaluationModalOpen(true)}
            className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3"
          >
            Comenzar Evaluación de Espacio
          </Button>
        </div>

        {/* Modal de Evaluación de Espacio */}
        <SpaceEvaluationModal
          isOpen={isEvaluationModalOpen}
          onClose={() => setIsEvaluationModalOpen(false)}
        />

        {/* Modal de Ejercicio Individual */}
        <WorkoutExerciseModal
          exercise={generatedWorkout?.ejercicios?.[currentExerciseIndex]}
          exerciseIndex={currentExerciseIndex}
          totalExercises={generatedWorkout?.ejercicios?.length || 0}
          onNext={() => {
            if (currentExerciseIndex < (generatedWorkout?.ejercicios?.length || 0) - 1) {
              setCurrentExerciseIndex((i) => i + 1)
            } else {
              setIsExerciseModalOpen(false)
              setGeneratedWorkout(null)
              alert('¡Entrenamiento completado! ¡Excelente trabajo!')
            }
          }}
          onClose={() => {
            setIsExerciseModalOpen(false)
            setCurrentExerciseIndex(0)
          }}
          isOpen={isExerciseModalOpen}
        />
      </div>
    </div>
  )
}

export default HomeTrainingSection
