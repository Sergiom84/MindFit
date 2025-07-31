import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  User, 
  Dumbbell, 
  Calendar, 
  Apple, 
  Heart, 
  TrendingUp, 
  Settings,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Home,
  ChevronRight,
  Target,
  Activity,
  Zap,
  Trophy,
  Clock,
  BarChart3,
  Lock,
  Unlock,
  AlertTriangle,
  Camera,
  Music,
  CheckCircle,
  XCircle,
  Brain,
  Smartphone
} from 'lucide-react'
import './App.css'

// Enhanced Floating Music Bubble Component
const MusicBubble = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('activation') // activation, main, cooldown
  const [autoPlaylist, setAutoPlaylist] = useState(true)

  const musicPhases = {
    activation: { name: 'Activación', color: 'bg-orange-400', music: 'Música Energética' },
    main: { name: 'Trabajo Principal', color: 'bg-red-500', music: 'Playlists Potentes' },
    cooldown: { name: 'Vuelta a la Calma', color: 'bg-blue-400', music: 'Sonidos Relajantes' }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - 30,
        y: e.clientY - 30
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div 
      className={`fixed z-50 w-16 h-16 ${musicPhases[currentPhase].color} rounded-full shadow-lg cursor-move flex items-center justify-center hover:scale-110 transition-all duration-200`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      title={`${musicPhases[currentPhase].name}: ${musicPhases[currentPhase].music}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-0 w-full h-full text-white hover:bg-transparent"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      
      {/* Phase indicator */}
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
        <Music size={10} className="text-black" />
      </div>
    </div>
  )
}

// Navigation Component
const Navigation = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/methodologies', icon: Dumbbell, label: 'Metodologías' },
    { path: '/routines', icon: Calendar, label: 'Rutinas' },
    { path: '/nutrition', icon: Apple, label: 'Nutrición' },
    { path: '/injuries', icon: Heart, label: 'Lesiones' },
    { path: '/progress', icon: TrendingUp, label: 'Progreso' },
    { path: '/settings', icon: Settings, label: 'Ajustes' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-yellow-400/20 z-40">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Version Selection Modal Component
const VersionSelectionModal = ({ methodology, onSelect }) => {
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [userLevel] = useState('Principiante') // This would come from user profile

  const versions = {
    adapted: {
      name: 'Versión Adaptada',
      icon: <Lock className="w-5 h-5" />,
      intensity: 'Moderada',
      volume: 'Bajo a medio',
      risk: 'Bajo',
      frequency: 'Menor (más descanso)',
      rest: 'Personalizado según recuperación',
      level: 'Principiante / Intermedio',
      adaptation: 'Alta (ajustes frecuentes y progresivos)',
      recommended: userLevel === 'Principiante'
    },
    strict: {
      name: 'Versión Estricta',
      icon: <Unlock className="w-5 h-5" />,
      intensity: 'Alta',
      volume: 'Medio a alto',
      risk: 'Alto si no se regula',
      frequency: 'Mayor (más estímulo semanal)',
      rest: 'Estándar por la metodología',
      level: 'Intermedio avanzado / Competición',
      adaptation: 'Alta (pero bajo riesgo de colapso inicial)',
      recommended: userLevel !== 'Principiante'
    }
  }

  const handleVersionSelect = (version) => {
    setSelectedVersion(version)
    if (version === 'strict' && userLevel === 'Principiante') {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }

  const confirmSelection = () => {
    onSelect(selectedVersion)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
          Seleccionar Versión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-900 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Selección de Versión - {methodology}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Elige la versión que mejor se adapte a tu nivel y objetivos
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {Object.entries(versions).map(([key, version]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${
                selectedVersion === key 
                  ? 'border-yellow-400 bg-yellow-400/10' 
                  : 'border-gray-600 hover:border-yellow-400/50'
              } ${version.recommended ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => handleVersionSelect(key)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {version.icon}
                    <CardTitle className="text-white">{version.name}</CardTitle>
                  </div>
                  {version.recommended && (
                    <Badge className="bg-green-400 text-black">Recomendado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Intensidad:</span>
                    <p className="text-white">{version.intensity}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Volumen:</span>
                    <p className="text-white">{version.volume}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Riesgo:</span>
                    <p className="text-white">{version.risk}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nivel:</span>
                    <p className="text-white">{version.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showWarning && (
          <Alert className="border-orange-400 bg-orange-400/10">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              ⚠️ Advertencia: Has seleccionado la versión estricta siendo principiante. 
              Esto puede aumentar el riesgo de lesiones o sobreentrenamiento. 
              Se recomienda usar la versión adaptada durante 4-6 semanas mínimo.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            onClick={confirmSelection}
            disabled={!selectedVersion}
            className="bg-yellow-400 text-black hover:bg-yellow-300"
          >
            Confirmar Selección
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Home Screen
const HomeScreen = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, yellow 0%, transparent 50%)`
        }}
      />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            MindMixer
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Tu entrenador personal inteligente que adapta rutinas, nutrición y seguimiento 
            automáticamente según tu progreso y objetivos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
              <CardHeader>
                <Brain className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">IA Adaptativa Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Análisis en tiempo real de evolución anatómica y metabólica
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
              <CardHeader>
                <Smartphone className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Entrenamiento en Casa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Modalidad multifuncional con bandas, mancuernas y peso corporal
                </p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
              <CardHeader>
                <Camera className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Corrección por Video IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Análisis de técnica en tiempo real con feedback inmediato
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Profile Screen
const ProfileScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Perfil de Usuario</h1>
      
      <div className="space-y-6">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Datos Básicos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400">Edad</label>
                <p className="text-white font-semibold">28 años</p>
              </div>
              <div>
                <label className="text-gray-400">Peso</label>
                <p className="text-white font-semibold">75 kg</p>
              </div>
              <div>
                <label className="text-gray-400">Estatura</label>
                <p className="text-white font-semibold">1.78 m</p>
              </div>
              <div>
                <label className="text-gray-400">Sexo</label>
                <p className="text-white font-semibold">Masculino</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Composición Corporal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400">Grasa Corporal</label>
                <p className="text-white font-semibold">15%</p>
              </div>
              <div>
                <label className="text-gray-400">Cintura</label>
                <p className="text-white font-semibold">82 cm</p>
              </div>
              <div>
                <label className="text-gray-400">Pecho</label>
                <p className="text-white font-semibold">98 cm</p>
              </div>
              <div>
                <label className="text-gray-400">Brazos</label>
                <p className="text-white font-semibold">35 cm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Nivel y Enfoque</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-400">Nivel de Entrenamiento</label>
              <Badge className="bg-yellow-400 text-black ml-2">Amateur</Badge>
            </div>
            <div>
              <label className="text-gray-400">Enfoque Seleccionado</label>
              <p className="text-white">Powerlifter amateur saludable</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Preferencias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-gray-400">Comidas diarias preferidas</label>
              <p className="text-white">4 comidas</p>
            </div>
            <div>
              <label className="text-gray-400">Alimentos excluidos</label>
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="border-red-400 text-red-400">Lácteos</Badge>
                <Badge variant="outline" className="border-red-400 text-red-400">Gluten</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Enhanced Methodologies Screen
const MethodologiesScreen = () => {
  const [selectedMethodology, setSelectedMethodology] = useState(null)

  const methodologies = [
    {
      name: "Heavy Duty",
      description: "Entrenamiento de alta intensidad con descansos prolongados",
      focus: "Intensidad máxima",
      homeCompatible: true
    },
    {
      name: "Powerlifting",
      description: "Enfoque en los tres levantamientos principales",
      focus: "Fuerza máxima",
      homeCompatible: false
    },
    {
      name: "Hipertrofia",
      description: "Maximización del crecimiento muscular",
      focus: "Volumen muscular",
      homeCompatible: true
    },
    {
      name: "Funcional",
      description: "Movimientos aplicables a la vida diaria",
      focus: "Funcionalidad",
      homeCompatible: true
    },
    {
      name: "Entrenamiento en Casa",
      description: "Modalidad multifuncional con bandas, mancuernas y peso corporal",
      focus: "Adaptabilidad",
      homeCompatible: true,
      isNew: true
    }
  ]

  const handleMethodologySelect = (methodology) => {
    setSelectedMethodology(methodology)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Metodologías de Entrenamiento</h1>
      
      <div className="space-y-4">
        {methodologies.map((method, index) => (
          <Card key={index} className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-white">{method.name}</CardTitle>
                    {method.isNew && (
                      <Badge className="bg-green-400 text-black">Nuevo</Badge>
                    )}
                    {method.homeCompatible && (
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        <Smartphone className="w-3 h-3 mr-1" />
                        Casa
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">{method.description}</CardDescription>
                </div>
                <ChevronRight className="text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <Badge className="bg-yellow-400/20 text-yellow-400">{method.focus}</Badge>
                <VersionSelectionModal 
                  methodology={method.name}
                  onSelect={(version) => handleMethodologySelect({...method, version})}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMethodology && (
        <Card className="mt-6 bg-green-900/20 border-green-400/20">
          <CardHeader>
            <CardTitle className="text-green-400">Metodología Seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white">
              {selectedMethodology.name} - Versión {selectedMethodology.version === 'adapted' ? 'Adaptada' : 'Estricta'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Enhanced Routines Screen
const RoutinesScreen = () => {
  const [showVideoCorrection, setShowVideoCorrection] = useState(false)
  
  const exercises = [
    { name: "Sentadillas", sets: "4", reps: "8-10", weight: "80kg", hasVideo: true },
    { name: "Press de Banca", sets: "4", reps: "6-8", weight: "70kg", hasVideo: true },
    { name: "Peso Muerto", sets: "3", reps: "5", weight: "100kg", hasVideo: true },
    { name: "Press Militar", sets: "3", reps: "8-10", weight: "45kg", hasVideo: true }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Rutina de Entrenamiento</h1>
      
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Día 1 - Tren Superior</CardTitle>
              <CardDescription className="text-gray-400">Lunes, 29 Julio 2024</CardDescription>
            </div>
            <Button 
              onClick={() => setShowVideoCorrection(!showVideoCorrection)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              {showVideoCorrection ? 'Detener' : 'Corrección IA'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showVideoCorrection && (
        <Card className="bg-purple-900/20 border-purple-400/20 mb-6">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Corrección de Técnica por Video IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Cámara activada</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Análisis de postura en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Detección de ángulos articulares</span>
              </div>
              <Alert className="border-blue-400 bg-blue-400/10">
                <AlertDescription className="text-blue-300">
                  💡 Mantén el dispositivo estable y asegúrate de estar completamente visible en el encuadre
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <Card key={index} className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-white font-semibold">{exercise.name}</h3>
                  <p className="text-gray-400 text-sm">{exercise.sets} series × {exercise.reps} reps</p>
                </div>
                <div className="text-right space-y-2">
                  <p className="text-yellow-400 font-bold">{exercise.weight}</p>
                  <div className="flex space-x-2">
                    <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                      VER
                    </Button>
                    {showVideoCorrection && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Camera className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              {showVideoCorrection && (
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 text-sm">Estado de técnica:</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Correcta</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced Nutrition Screen (keeping existing functionality)
const NutritionScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Nutrición y Dietas</h1>
      
      <div className="space-y-6">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="w-5 h-5 mr-2 text-yellow-400" />
              Gasto Calórico Diario (IA Adaptativa)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-400">2,450</p>
              <p className="text-gray-400">calorías</p>
              <p className="text-sm text-green-400 mt-2">Ajustado automáticamente según evolución</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Macronutrientes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Proteínas</span>
                <span className="text-white">150g</span>
              </div>
              <Progress value={75} className="bg-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Carbohidratos</span>
                <span className="text-white">300g</span>
              </div>
              <Progress value={60} className="bg-gray-700" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400">Grasas</span>
                <span className="text-white">80g</span>
              </div>
              <Progress value={45} className="bg-gray-700" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white">Suplementación Inteligente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-white">Proteína Whey</span>
                <Badge className="bg-yellow-400 text-black">Recomendado por IA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Creatina</span>
                <Badge className="bg-yellow-400 text-black">Recomendado por IA</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white">Omega-3</span>
                <Badge className="bg-blue-400 text-black">Sugerido</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Keep existing screens with minor enhancements
const InjuriesScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Lesiones y Adaptaciones</h1>
      
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Brain className="w-5 h-5 mr-2 text-yellow-400" />
            Estado Actual (Monitoreado por IA)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-white">Sin lesiones activas</span>
          </div>
          <p className="text-sm text-gray-400 mt-2">
            La IA monitorea automáticamente tu feedback y ajusta la rutina preventivamente
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white">Historial y Adaptaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-white">Dolor lumbar leve</p>
                <p className="text-gray-400 text-sm">Recuperado - Marzo 2024</p>
                <p className="text-blue-400 text-xs">IA adaptó rutina automáticamente</p>
              </div>
              <Badge variant="outline" className="border-green-400 text-green-400">Recuperado</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full mt-6 bg-yellow-400 text-black hover:bg-yellow-300">
        <Heart className="mr-2" size={16} />
        Reportar Nueva Lesión
      </Button>
    </div>
  )
}

const ProgressScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Seguimiento y Evolución</h1>
      
      <div className="space-y-6">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Brain className="mr-2 text-yellow-400" />
              Análisis IA en Tiempo Real
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">+3kg</p>
                <p className="text-gray-400">Peso ganado</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">-2%</p>
                <p className="text-gray-400">Grasa corporal</p>
              </div>
            </div>
            <Alert className="mt-4 border-blue-400 bg-blue-400/10">
              <AlertDescription className="text-blue-300">
                🤖 La IA detectó progreso óptimo. Manteniendo rutina actual con ajustes menores.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="mr-2 text-yellow-400" />
              Fuerza y Puntos Débiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Sentadilla</span>
                <span className="text-white">80kg (+10kg)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Press Banca</span>
                <div className="text-right">
                  <span className="text-white">70kg (+5kg)</span>
                  <Badge className="ml-2 bg-orange-400 text-black text-xs">Punto débil</Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Peso Muerto</span>
                <span className="text-white">100kg (+15kg)</span>
              </div>
            </div>
            <p className="text-sm text-orange-400 mt-3">
              IA redirigiendo volumen hacia press de banca para equilibrar desarrollo
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Clock className="mr-2 text-yellow-400" />
              Esta Semana
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Entrenamientos</span>
                <span className="text-white">4/4</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Calorías promedio</span>
                <span className="text-white">2,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Recuperación</span>
                <Badge className="bg-green-400 text-black">Óptima</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

const SettingsScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Ajustes y Configuración</h1>
      
      <div className="space-y-4">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Configuración Musical</span>
              </div>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Corrección por Video IA</span>
              </div>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Notificaciones</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Unidades de medida</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Backup de datos</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Privacidad</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Acerca de</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/methodologies" element={<MethodologiesScreen />} />
          <Route path="/routines" element={<RoutinesScreen />} />
          <Route path="/nutrition" element={<NutritionScreen />} />
          <Route path="/injuries" element={<InjuriesScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
        <Navigation />
        <MusicBubble />
      </div>
    </Router>
  )
}

export default App

