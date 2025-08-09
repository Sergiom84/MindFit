import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpaceEvaluationModal from './SpaceEvaluationModal'
import WorkoutExerciseModal from './WorkoutExerciseModal'
import { useUserContext } from '@/contexts/UserContext'
import {
  Home,
  Dumbbell,
  Target,
  Clock,
  Users,
  CheckCircle,
  Play,
  Smartphone,
  Wifi,
  Calendar,
  TrendingUp
} from 'lucide-react'

const HomeTrainingSection = () => {
  const [selectedEquipment, setSelectedEquipment] = useState('minimal')
  const [selectedTrainingType, setSelectedTrainingType] = useState('functional')
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const { entrenamientoCasa, userData, progreso } = useUserContext()

  // Determinar equipamiento inicial basado en el usuario
  useEffect(() => {
    if (entrenamientoCasa.equipoDisponible) {
      const equipoUsuario = entrenamientoCasa.equipoDisponible.join(' ').toLowerCase();
      if (equipoUsuario.includes('barra') || equipoUsuario.includes('rack') || equipoUsuario.includes('kettlebell')) {
        setSelectedEquipment('advanced');
      } else if (equipoUsuario.includes('mancuernas') || equipoUsuario.includes('banda')) {
        setSelectedEquipment('basic');
      } else {
        setSelectedEquipment('minimal');
      }
    }
  }, [entrenamientoCasa.equipoDisponible]);

  // Función para generar entrenamiento con IA
  const generateWorkout = async () => {
    setIsGeneratingWorkout(true);

    try {
      const equipmentLevel = equipmentLevels[selectedEquipment];
      const trainingStyle = trainingStyles.find((style, index) => {
        if (selectedTrainingType === 'functional') return index === 0;
        if (selectedTrainingType === 'hiit') return index === 1;
        if (selectedTrainingType === 'strength') return index === 2;
        return false;
      });

      const response = await fetch('/api/recomendar-metodologia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipamiento: selectedEquipment,
          tipoEntrenamiento: selectedTrainingType,
          equipoDisponible: equipmentLevel.equipment,
          estiloEntrenamiento: trainingStyle,
          datosUsuario: {
            nombre: userData.nombre,
            nivel: userData.nivel || 'intermedio',
            objetivos: userData.objetivo_principal || 'mantener_forma',
            limitaciones: userData.limitaciones || []
          }
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar entrenamiento');
      }

      const data = await response.json();
      setGeneratedWorkout(data.entrenamiento);
      setCurrentExerciseIndex(0);
      // No abrir modal, mostrar en la página

    } catch (error) {
      console.error('Error generando entrenamiento:', error);
      alert('Error al generar entrenamiento. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const startWorkout = () => {
    if (generatedWorkout && generatedWorkout.ejercicios && generatedWorkout.ejercicios.length > 0) {
      setCurrentExerciseIndex(0);
      setIsExerciseModalOpen(true);
    }
  };

  const nextExercise = () => {
    if (currentExerciseIndex < generatedWorkout.ejercicios.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Entrenamiento completado
      setIsExerciseModalOpen(false);
      setGeneratedWorkout(null);
      alert('¡Entrenamiento completado! ¡Excelente trabajo!');
    }
  };

  const closeExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setCurrentExerciseIndex(0);
  };

  const equipmentLevels = {
    minimal: {
      name: 'Equipamiento Mínimo',
      icon: <Home className="w-5 h-5" />,
      equipment: ['Peso corporal', 'Toallas', 'Silla/Sofá', 'Pared'],
      workouts: ['Flexiones variadas', 'Sentadillas', 'Plancha', 'Burpees'],
      color: 'border-green-400'
    },
    basic: {
      name: 'Equipamiento Básico',
      icon: <Dumbbell className="w-5 h-5" />,
      equipment: ['Mancuernas ajustables', 'Bandas elásticas', 'Esterilla', 'Banco/Step'],
      workouts: ['Press de pecho', 'Remo con banda', 'Peso muerto', 'Curl bíceps'],
      color: 'border-yellow-400'
    },
    advanced: {
      name: 'Equipamiento Avanzado',
      icon: <Target className="w-5 h-5" />,
      equipment: ['Barra dominadas', 'Kettlebells', 'TRX', 'Discos olímpicos'],
      workouts: ['Dominadas', 'Swing kettlebell', 'Sentadilla goblet', 'Turkish get-up'],
      color: 'border-red-400'
    }
  }

  const trainingStyles = [
    {
      name: 'Funcional en Casa',
      description: 'Movimientos naturales adaptados al hogar',
      duration: '30-45 min',
      frequency: '4-5 días/semana',
      focus: 'Fuerza funcional y movilidad',
      exercises: [
        'Sentadillas con peso corporal',
        'Flexiones en diferentes ángulos',
        'Plancha y variaciones',
        'Estocadas multidireccionales'
      ]
    },
    {
      name: 'HIIT Doméstico',
      description: 'Alta intensidad en espacios reducidos',
      duration: '20-30 min',
      frequency: '3-4 días/semana',
      focus: 'Quema de grasa y resistencia',
      exercises: [
        'Burpees',
        'Mountain climbers',
        'Jumping jacks',
        'Squat jumps'
      ]
    },
    {
      name: 'Fuerza con Bandas',
      description: 'Entrenamiento de resistencia variable',
      duration: '40-50 min',
      frequency: '4-5 días/semana',
      focus: 'Hipertrofia y fuerza',
      exercises: [
        'Press de pecho con banda',
        'Remo horizontal',
        'Sentadilla con resistencia',
        'Extensiones de tríceps'
      ]
    }
  ]

  const adaptationFeatures = [
    {
      title: 'Análisis del Espacio',
      description: 'La IA evalúa tu espacio disponible y adapta los ejercicios',
      icon: <Home className="w-5 h-5 text-blue-400" />
    },
    {
      title: 'Progresión Inteligente',
      description: 'Aumenta la dificultad sin necesidad de más equipamiento',
      icon: <TrendingUp className="w-5 h-5 text-green-400" />
    },
    {
      title: 'Rutinas Flexibles',
      description: 'Se adapta a tu horario y tiempo disponible',
      icon: <Clock className="w-5 h-5 text-yellow-400" />
    },
    {
      title: 'Sin Conexión',
      description: 'Funciona completamente offline una vez descargado',
      icon: <Wifi className="w-5 h-5 text-purple-400" />
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
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
              onClick={() => setSelectedEquipment(key)}
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
                      {level.equipment.map((item, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
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
        <Tabs value={selectedTrainingType} onValueChange={setSelectedTrainingType} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="functional">Funcional</TabsTrigger>
            <TabsTrigger value="hiit">HIIT</TabsTrigger>
            <TabsTrigger value="strength">Fuerza</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Botón para Generar Entrenamiento con IA */}
        <div className="text-center mb-8">
          <div className="bg-gray-900 border border-yellow-400/20 rounded-lg p-6">
            <h3 className="text-white text-xl font-semibold mb-4">
              Generar Entrenamiento Personalizado
            </h3>
            <p className="text-gray-400 mb-6">
              Basado en tu equipamiento: <span className="text-yellow-400 font-semibold">
                {equipmentLevels[selectedEquipment].name}
              </span> y tipo de entrenamiento: <span className="text-yellow-400 font-semibold">
                {selectedTrainingType === 'functional' ? 'Funcional' :
                 selectedTrainingType === 'hiit' ? 'HIIT' : 'Fuerza'}
              </span>
            </p>
            <Button
              onClick={generateWorkout}
              disabled={isGeneratingWorkout}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
            >
              {isGeneratingWorkout ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Generando...
                </>
              ) : (
                <>
                  <Target className="w-5 h-5 mr-2" />
                  Generar Mi Entrenamiento
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Entrenamiento Generado */}
        {generatedWorkout && (
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
                  {generatedWorkout.ejercicios && generatedWorkout.ejercicios.map((ejercicio, idx) => (
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
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={startWorkout}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Comenzar Entrenamiento
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Estadísticas Personales del Usuario */}
        <Card className="bg-gray-900 border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
              Tu Progreso en Casa - {userData.nombre}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{entrenamientoCasa.rutinasCompletadas || 0}</div>
                <div className="text-sm text-gray-400">Rutinas Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{entrenamientoCasa.tiempoTotalEntrenamiento || '0h'}</div>
                <div className="text-sm text-gray-400">Tiempo Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{entrenamientoCasa.nivelDificultad || 'Básico'}</div>
                <div className="text-sm text-gray-400">Nivel Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{entrenamientoCasa.duracionSesion || '30 min'}</div>
                <div className="text-sm text-gray-400">Duración Sesión</div>
              </div>
            </div>

            {/* Información adicional del usuario */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Tu Espacio de Entrenamiento:</h4>
                <p className="text-gray-300 text-sm">{entrenamientoCasa.espacioDisponible || 'No especificado'}</p>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-2">Horario Preferido:</h4>
                <p className="text-gray-300 text-sm">{entrenamientoCasa.horarioPreferido || 'Flexible'}</p>
              </div>
            </div>

            {/* Ejercicios favoritos del usuario */}
            {entrenamientoCasa.ejerciciosFavoritos && entrenamientoCasa.ejerciciosFavoritos.length > 0 && (
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

        {/* Características de Adaptación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {adaptationFeatures.map((feature, index) => (
            <Card key={index} className="bg-gray-900 border-yellow-400/20">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  {feature.icon}
                  <div>
                    <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-400 text-sm">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Plan de Progresión */}
        <Card className="bg-gray-900 border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Plan de Progresión Inteligente</CardTitle>
            <CardDescription className="text-gray-400">
              Cómo la IA adapta tu entrenamiento sin necesidad de más equipamiento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">1</div>
                <div>
                  <h4 className="text-white font-semibold">Semanas 1-2: Adaptación</h4>
                  <p className="text-gray-400 text-sm">Aprendizaje de movimientos básicos y evaluación de capacidades</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">2</div>
                <div>
                  <h4 className="text-white font-semibold">Semanas 3-6: Progresión</h4>
                  <p className="text-gray-400 text-sm">Aumento de repeticiones, series y variaciones más complejas</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">3</div>
                <div>
                  <h4 className="text-white font-semibold">Semanas 7+: Especialización</h4>
                  <p className="text-gray-400 text-sm">Técnicas avanzadas, tempo controlado y periodización</p>
                </div>
              </div>
            </div>
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
          onNext={nextExercise}
          onClose={closeExerciseModal}
          isOpen={isExerciseModalOpen}
        />
      </div>
    </div>
  )
}

export default HomeTrainingSection
