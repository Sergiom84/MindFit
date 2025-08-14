import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import SpaceEvaluationModal from './SpaceEvaluationModal'
import WorkoutExerciseModal from './WorkoutExerciseModal'
import IAHomeTraining from '@/components/IAHomeTraining'
import { useUserContext } from '@/contexts/UserContext'
import {
  Dumbbell,
  Target,
  Clock,
  CheckCircle,
  Play,
  Calendar,
  TrendingUp,
  Circle,
  AlertTriangle,
  Heart,
  Home
} from 'lucide-react'
import { Progress } from '@/components/ui/progress'

// Evita crashear si el servidor responde 304/204 o body vacío
async function safeJson(res) {
  if (res.status === 304 || res.status === 204) return null;
  const text = await res.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { return null; }
}

// Parsear listas de ejercicios de forma segura
function parseExercises(content) {
  try {
    return JSON.parse(content || '[]');
  } catch {
    return [];
  }
}

const HomeTrainingSection = () => {
  // justo dentro del componente HomeTrainingSection
  const [equipamiento, setEquipamiento] = useState('minimo');     // 'minimo' | 'basico' | 'avanzado'
  const [tipo, setTipo] = useState('funcional');                  // 'funcional' | 'hiit' | 'fuerza'
  const [showIAPlan, setShowIAPlan] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState('minimal')
  const [selectedTrainingType, setSelectedTrainingType] = useState('functional')
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false)
  const [isGeneratingWorkout, setIsGeneratingWorkout] = useState(false)
  const [generatedWorkout, setGeneratedWorkout] = useState(null)
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0)
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false)
  const [activeProgram, setActiveProgram] = useState(null)
  const [weeklyCalendar, setWeeklyCalendar] = useState([])
  const [homeTrainingStats, setHomeTrainingStats] = useState({
    rutinasCompletadas: 0,
    tiempoTotalEntrenamiento: '0h 0m',
    duracionSesion: '30 min'
  })
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

  // 👉 desactiva efectos cuando showIAPlan = true
  useEffect(() => {
    // Si el usuario ha lanzado "Generar Mi Entrenamiento" con IA,
    // no dispares las cargas del programa/estadísticas semanales.
    if (showIAPlan) return;
    if (!userData.id) return;

    loadActiveProgram(userData.id);
    loadHomeTrainingStats(userData.id);
  }, [showIAPlan, userData.id]);

  // (solo si quieres reiniciar al cambiar selección)
  // Si deseas que al cambiar de equipamiento/tipo se "reseteé" el player para obligar a regenerar:
  useEffect(() => {
    setShowIAPlan(false);
  }, [equipamiento, tipo]);

  const loadActiveProgram = async (userId) => {
    try {
      const response = await fetch(`/api/home-training/active-program/${userId}`);
      const data = await safeJson(response);

      if (data && data.success && data.program) {
        setActiveProgram(data.program);
        generateWeeklyCalendar(data.program);
      }
    } catch (error) {
      console.error('Error cargando programa activo:', error);
    }
  };

  const loadHomeTrainingStats = async (userId) => {
    try {
      const response = await fetch(`/api/home-training/stats/${userId}`);
      const data = await safeJson(response);

      if (data && data.success) {
        setHomeTrainingStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const generateWeeklyCalendar = (program) => {
    // Hacer la función tolerante a data vacío
    const safeProgram = program || {};
    const safeDias = Array.isArray(safeProgram.dias) ? safeProgram.dias : [];

    if (safeDias.length > 0) {
      // Usar datos de la base de datos si están disponibles
      const calendar = safeDias.map(day => {
        const exercises = parseExercises(day.ejercicios_asignados);
        const exerciseCount = exercises.length;
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
        };
      });
      setWeeklyCalendar(calendar);
    } else if (generatedWorkout) {
      // Crear calendario de ejemplo si no hay datos de BD
      generateMockWeeklyCalendar();
    }
  };

  const generateMockWeeklyCalendar = () => {
    const today = new Date();
    const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const dayIds = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

    const calendar = dayNames.map((dayName, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - today.getDay() + 1 + index); // Lunes de esta semana + index

      const isToday = date.toDateString() === today.toDateString();
      const isRest = index === 6; // Domingo descanso
      const isPast = date < today && !isToday;
      const isFuture = date > today;

      let status = 'pendiente';
      let completed = 0;
      let total = generatedWorkout?.ejercicios?.length || 5;

      if (isRest) {
        status = 'rest';
        total = 0;
      } else if (isPast) {
        status = Math.random() > 0.3 ? 'completado' : 'perdido';
        completed = status === 'completado' ? total : Math.floor(total * 0.6);
      } else if (isToday) {
        status = 'en_progreso';
        completed = Math.floor(total * 0.3);
      }

      return {
        id: dayIds[index],
        dayName: dayName,
        dayNumber: date.getDate(),
        date: date.toISOString().split('T')[0],
        isToday: isToday,
        exercises: isRest ? [] : Array.from({length: total}, (_, i) => i + 1),
        exerciseCount: isRest ? 0 : total,
        completed: completed,
        total: total,
        status: status,
        isRest: isRest
      };
    });

    setWeeklyCalendar(calendar);
  };

  const calculateMockProgress = () => {
    if (weeklyCalendar.length === 0) return 0;

    const completedDays = weeklyCalendar.filter(day => day.status === 'completado').length;
    const totalWorkoutDays = weeklyCalendar.filter(day => !day.isRest).length;

    return totalWorkoutDays > 0 ? Math.round((completedDays / totalWorkoutDays) * 100) : 0;
  };

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

      const data = await safeJson(response);
      if (!data) {
        throw new Error('Respuesta vacía del servidor');
      }
      setGeneratedWorkout(data.entrenamiento);
      setCurrentExerciseIndex(0);

      // Crear programa en la base de datos si se indica
      if (data.shouldCreateProgram && data.entrenamiento) {
        await createProgramInDatabase(data.entrenamiento);
      } else {
        // Si no se puede crear en BD, generar calendario mock
        generateMockWeeklyCalendar();
      }

    } catch (error) {
      console.error('Error generando entrenamiento:', error);
      alert('Error al generar entrenamiento. Por favor, inténtalo de nuevo.');
    } finally {
      setIsGeneratingWorkout(false);
    }
  };

  const createProgramInDatabase = async (entrenamiento) => {
    // 👉 No crear programas en BD si estamos usando el componente IA
    if (showIAPlan) return;

    try {
      const response = await fetch('/api/home-training/create-program', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userData.id,
          titulo: entrenamiento.titulo,
          descripcion: entrenamiento.descripcion,
          equipamiento: selectedEquipment,
          tipoEntrenamiento: selectedTrainingType,
          duracionTotal: entrenamiento.duracionTotal,
          frecuencia: entrenamiento.frecuencia,
          enfoque: entrenamiento.enfoque,
          ejercicios: entrenamiento.ejercicios
        })
      });

      const data = await safeJson(response);

      if (data && data.success) {
        // Recargar programa activo
        await loadActiveProgram(userData.id);
        console.log('Programa creado exitosamente');
      }
    } catch (error) {
      console.error('Error creando programa:', error);
    }
  };

  const startWorkout = () => {
    if (generatedWorkout && generatedWorkout.ejercicios && generatedWorkout.ejercicios.length > 0) {
      setCurrentExerciseIndex(0);
      setIsExerciseModalOpen(true);
    }
  };

  const nextExercise = async () => {
    if (currentExerciseIndex < generatedWorkout.ejercicios.length - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Entrenamiento completado
      setIsExerciseModalOpen(false);

      // Registrar progreso si es parte de un programa activo
      if (activeProgram) {
        await completeWorkoutDay();
      }

      setGeneratedWorkout(null);
      alert('¡Entrenamiento completado! ¡Excelente trabajo!');
    }
  };

  const completeWorkoutDay = async () => {
    // 👉 No hacer nada si estamos usando el componente IA
    if (showIAPlan) return;

    try {
      // Encontrar el día actual en el calendario
      const today = new Date().toDateString();
      const currentDay = weeklyCalendar.find(day =>
        new Date(day.date).toDateString() === today
      );

      if (currentDay && currentDay.status !== 'completado') {
        if (activeProgram) {
          // Si hay programa activo, usar API
          const duracionEstimada = generatedWorkout.ejercicios.reduce((total, ejercicio) => {
            const tiempoEjercicio = ejercicio.tipo === 'tiempo' ? ejercicio.duracion : 30;
            return total + tiempoEjercicio + ejercicio.descanso;
          }, 0) / 60;

          const response = await fetch('/api/home-training/complete-day', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              dayId: currentDay.id,
              userId: userData.id,
              duracionMinutos: Math.round(duracionEstimada),
              ejerciciosCompletados: generatedWorkout.ejercicios.length,
              ejerciciosTotales: generatedWorkout.ejercicios.length
            })
          });

          const data = await safeJson(response);
          if (data && response.ok) {
            await loadActiveProgram(userData.id);
            await loadHomeTrainingStats(userData.id);
          }
        } else {
          // Actualizar calendario mock localmente
          const updatedCalendar = weeklyCalendar.map(day => {
            if (day.id === currentDay.id) {
              return {
                ...day,
                status: 'completado',
                completed: day.total
              };
            }
            return day;
          });

          setWeeklyCalendar(updatedCalendar);

          // Actualizar estadísticas mock
          const completedSessions = updatedCalendar.filter(d => d.status === 'completado').length;
          setHomeTrainingStats(prev => ({
            ...prev,
            rutinasCompletadas: completedSessions,
            tiempoTotalEntrenamiento: `${completedSessions * 30}m`
          }));
        }
      }
    } catch (error) {
      console.error('Error completando día:', error);
    }
  };

  const closeExerciseModal = () => {
    setIsExerciseModalOpen(false);
    setCurrentExerciseIndex(0);
  };

  const handleDayClick = (day) => {
    if (day.isRest) {
      alert('Este es un día de descanso. ¡Disfruta tu recuperación!');
      return;
    }

    if (day.status === 'completado') {
      alert('Ya has completado este día. ¡Excelente trabajo!');
      return;
    }

    if (day.status === 'perdido') {
      alert('Este día ya pasó. ¡Enfócate en los días siguientes!');
      return;
    }

    // Obtener ejercicios para este día
    let ejerciciosDelDia = [];

    if (activeProgram && activeProgram.ejercicios) {
      // Usar ejercicios de la base de datos
      ejerciciosDelDia = activeProgram.ejercicios.filter((_, idx) =>
        day.exercises.includes(idx + 1)
      );
    } else if (generatedWorkout && generatedWorkout.ejercicios) {
      // Usar ejercicios del entrenamiento generado
      ejerciciosDelDia = generatedWorkout.ejercicios;
    }

    if (ejerciciosDelDia.length > 0) {
      // Configurar entrenamiento para este día específico
      setGeneratedWorkout({
        ...(activeProgram || generatedWorkout),
        ejercicios: ejerciciosDelDia
      });
      setCurrentExerciseIndex(0);
      setIsExerciseModalOpen(true);
    } else {
      alert('No hay ejercicios disponibles para este día.');
    }
  };

  const equipmentLevels = {
    minimal: {
      name: 'Equipamiento Mínimo',
      icon: <Home className="w-5 h-5 sm:w-6 sm:h-6" />,
      equipment: ['Peso corporal', 'Toallas', 'Silla/Sofá', 'Pared'],
      workouts: ['Flexiones variadas', 'Sentadillas', 'Plancha', 'Burpees'],
      color: 'border-green-400'
    },
    basic: {
      name: 'Equipamiento Básico',
      icon: <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6" />,
      equipment: ['Mancuernas ajustables', 'Bandas elásticas', 'Esterilla', 'Banco/Step'],
      workouts: ['Press de pecho', 'Remo con banda', 'Peso muerto', 'Curl bíceps'],
      color: 'border-yellow-400'
    },
    advanced: {
      name: 'Equipamiento Avanzado',
      icon: <Target className="w-5 h-5 sm:w-6 sm:h-6" />,
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
                setSelectedEquipment(key);
                // Mapear valores para el componente IA
                if (key === 'minimal') setEquipamiento('minimo');
                else if (key === 'basic') setEquipamiento('basico');
                else if (key === 'advanced') setEquipamiento('avanzado');
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
        <Tabs value={selectedTrainingType} onValueChange={(value) => {
          setSelectedTrainingType(value);
          // Mapear valores para el componente IA
          if (value === 'functional') setTipo('funcional');
          else if (value === 'hiit') setTipo('hiit');
          else if (value === 'strength') setTipo('fuerza');
        }} className="mb-8">
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
              onClick={() => {
                // Opcional: si quieres reiniciar cuando el usuario cambia de selección:
                // setShowIAPlan(false);
                setShowIAPlan(true);
              }}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
            >
              <Target className="w-5 h-5 mr-2" />
              Generar Mi Entrenamiento
            </Button>
          </div>
        </div>

        {/* Render condicional (sustituye el bloque antiguo) */}
        {showIAPlan ? (
          // 👉 El nuevo player de la sesión de HOY
          <IAHomeTraining
            equipamiento={equipamiento}
            tipo={tipo}
            autoStart
          />
        ) : (
          // 👉 Tu contenido previo de selección / explicación / cards
          // (deja aquí el grid con Mínimo/Básico/Avanzado, tabs Funcional/HIIT/Fuerza,
          // y el botón "Generar Mi Entrenamiento")
          <div>
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
          </div>
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
                <div className="text-2xl font-bold text-green-400">{homeTrainingStats.rutinasCompletadas}</div>
                <div className="text-sm text-gray-400">Rutinas Completadas</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{homeTrainingStats.tiempoTotalEntrenamiento}</div>
                <div className="text-sm text-gray-400">Tiempo Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{entrenamientoCasa.nivelDificultad || 'Básico'}</div>
                <div className="text-sm text-gray-400">Nivel Actual</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{homeTrainingStats.duracionSesion}</div>
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
